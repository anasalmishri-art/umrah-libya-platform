import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, setSessionCookie } from "@/lib/auth";
import {
  getClientIP,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  sanitizeText,
} from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit-redis";
import { logLoginAttempt, recordFailedAttempt, isIPBanned } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    // ===== 1. التحقق من حظر IP =====
    const banCheck = await isIPBanned(ip);
    if (banCheck.banned) {
      return NextResponse.json(
        { error: `تم حظر عنوان IP الخاص بك. السبب: ${banCheck.reason}` },
        { status: 403 }
      );
    }

    // ===== 2. Rate Limiting (Redis) =====
    const rateLimitResult = await checkRateLimit("register", ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "تم تجاوز عدد محاولات التسجيل. حاول لاحقاً" },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    const body = await req.json();
    const {
      email,
      password,
      name,
      phone,
      companyName,
      description,
      licenseNumber,
      companyPhone,
      whatsapp,
      companyEmail,
      address,
      city,
      country,
      website,
    } = body;

    // ===== التحقق من الحقول المطلوبة =====
    if (!email || !password || !name || !companyName || !companyPhone) {
      return NextResponse.json(
        { error: "جميع الحقول الأساسية مطلوبة" },
        { status: 400 }
      );
    }

    // ===== التحقق من صحة المدخلات =====
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "صيغة البريد الإلكتروني غير صحيحة" },
        { status: 400 }
      );
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400 }
      );
    }

    if (!isValidPhone(companyPhone)) {
      return NextResponse.json(
        { error: "رقم هاتف الشركة غير صحيح" },
        { status: 400 }
      );
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { error: "رقم هاتف المسؤول غير صحيح" },
        { status: 400 }
      );
    }

    // ===== منع Mass Assignment - تجاهل حقول غير مصرحة =====
    // ملاحظة: role محدد دائماً كـ "COMPANY" ولا يمكن للمستخدم تجاوزه
    // status محدد دائماً كـ "PENDING" ولا يمكن للمستخدم تجاوزه

    // ===== تنظيف المدخلات من XSS =====
    const cleanName = sanitizeText(name, 100);
    const cleanCompanyName = sanitizeText(companyName, 200);
    const cleanDescription = sanitizeText(description, 2000);
    const cleanAddress = sanitizeText(address, 500);
    const cleanCity = sanitizeText(city, 100);
    const cleanCountry = sanitizeText(country, 100) || "ليبيا";
    const cleanWebsite = sanitizeText(website, 200);
    const cleanLicense = sanitizeText(licenseNumber, 100);

    // ===== التحقق من عدم تكرار البريد =====
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12); // زيادة rounds لـ 12

    // Create user with company role
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: cleanName,
        phone: phone ? sanitizeText(phone, 20) : null,
        role: "COMPANY", // ثابت - لا يمكن تجاوزه
        company: {
          create: {
            name: cleanCompanyName,
            description: cleanDescription,
            licenseNumber: cleanLicense,
            phone: sanitizeText(companyPhone, 20),
            whatsapp: whatsapp ? sanitizeText(whatsapp, 20) : null,
            email: companyEmail ? sanitizeText(companyEmail, 254) : null,
            address: cleanAddress,
            city: cleanCity,
            country: cleanCountry,
            website: cleanWebsite,
            status: "PENDING", // ثابت - لا يمكن تجاوزه
          },
        },
      },
      include: { company: true },
    });

    // Auto-login (but they still need admin approval)
    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      companyId: user.company?.id,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "تم إنشاء حساب شركتك بنجاح. سيتم مراجعة طلبك من قبل الإدارة قبل تفعيل الحساب.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.company?.id,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب" },
      { status: 500 }
    );
  }
}
