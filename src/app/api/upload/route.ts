import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { logSecurityEvent } from "@/lib/audit-log";
import { getClientIP } from "@/lib/security";

// ===== إعدادات الأمان =====
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (حسب طلب المستخدم)
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"];
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// توقيعات الملفات (Magic Numbers) للتحقق من النوع الحقيقي
const FILE_SIGNATURES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/gif": [0x47, 0x49, 0x46, 0x38],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF
  "application/pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
};

/**
 * التحقق من توقيع الملف (Magic Number) - منع تزوير نوع الملف
 */
function verifyFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signature = FILE_SIGNATURES[mimeType];
  if (!signature) return false;
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
}

/**
 * توليد اسم ملف عشوائي آمن
 */
function generateSecureFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const randomBytes = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  return `${timestamp}-${randomBytes}${ext}`;
}

/**
 * فحص بسيط للمحتوى الخبيث
 */
function scanForMaliciousContent(buffer: Buffer, mimeType: string): { safe: boolean; reason?: string } {
  // تحويل المحتوى لنص للفحص
  const content = buffer.toString("utf8").toLowerCase();

  // فحص وجود سكريبتات خطيرة
  const maliciousPatterns = [
    "<script",
    "javascript:",
    "onerror=",
    "onload=",
    "eval(",
    "document.cookie",
    "<?php",
    "<%",
    "<!--#exec",
  ];

  for (const pattern of maliciousPatterns) {
    if (content.includes(pattern)) {
      return { safe: false, reason: `محتوى مشبوه: ${pattern}` };
    }
  }

  // للملفات النصية/PDF: فحص روابط خارجية مشبوهة
  if (mimeType === "application/pdf") {
    // فحص وجود JavaScript في PDF
    if (content.includes("/javascript") || content.includes("/js ")) {
      return { safe: false, reason: "PDF يحتوي على JavaScript" };
    }
  }

  return { safe: true };
}

// POST: رفع ملف آمن
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const ip = getClientIP(req);
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const purpose = (formData.get("purpose") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
    }

    // ===== 1. التحقق من الحجم =====
    if (file.size === 0) {
      return NextResponse.json({ error: "الملف فارغ" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `حجم الملف يجب ألا يتجاوز ${MAX_FILE_SIZE / (1024 * 1024)} ميجابايت` },
        { status: 400 }
      );
    }

    // ===== 2. التحقق من نوع MIME =====
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `نوع الملف غير مدعوم. الأنواع المسموحة: ${ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // ===== 3. التحقق من الامتداد =====
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "امتداد الملف غير مسموح" },
        { status: 400 }
      );
    }

    // ===== 4. قراءة محتوى الملف =====
    const buffer = Buffer.from(await file.arrayBuffer());

    // ===== 5. التحقق من توقيع الملف (Magic Number) =====
    if (!verifyFileSignature(buffer, file.type)) {
      await logSecurityEvent({
        type: "MALICIOUS_FILE_UPLOAD",
        severity: "HIGH",
        ip,
        userId: user.id,
        description: `محاولة رفع ملف بتوقيع مزيف: ${file.name}`,
        metadata: JSON.stringify({ claimedType: file.type, actualExt: ext }),
      });
      return NextResponse.json(
        { error: "محتوى الملف لا يتطابق مع نوعه" },
        { status: 400 }
      );
    }

    // ===== 6. فحص المحتوى الخبيث =====
    const scanResult = scanForMaliciousContent(buffer, file.type);
    if (!scanResult.safe) {
      await logSecurityEvent({
        type: "MALICIOUS_FILE_UPLOAD",
        severity: "CRITICAL",
        ip,
        userId: user.id,
        description: `ملف خبيث: ${scanResult.reason}`,
        metadata: JSON.stringify({ filename: file.name, mimeType: file.type }),
      });
      return NextResponse.json(
        { error: `الملف يحتوي على محتوى خبيث: ${scanResult.reason}` },
        { status: 400 }
      );
    }

    // ===== 7. توليد اسم آمن =====
    const secureFilename = generateSecureFilename(file.name);

    // ===== 8. حفظ الملف =====
    await mkdir(UPLOAD_DIR, { recursive: true });
    const filePath = path.join(UPLOAD_DIR, secureFilename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${secureFilename}`;

    // ===== 9. تسجيل الملف في قاعدة البيانات =====
    const fileRecord = await db.fileUpload.create({
      data: {
        filename: secureFilename,
        originalName: file.name.slice(0, 255),
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        uploadedById: user.id,
        purpose,
        virusScanned: true, // تم الفحص
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileId: fileRecord.id,
      filename: secureFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء رفع الملف" }, { status: 500 });
  }
}
