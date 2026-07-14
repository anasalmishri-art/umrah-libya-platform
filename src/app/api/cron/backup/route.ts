import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/audit-log";

/**
 * النسخ الاحتياطي الأسبوعي التلقائي - #13
 * يعمل كل يوم أحد الساعة 3 فجراً
 * يحتفظ بآخر 30 يوماً من النسخ
 *
 * يُستخدم عبر Vercel Cron Jobs
 */

const BACKUP_RETENTION_DAYS = 30;
const CRON_SECRET = process.env.CRON_SECRET || "umrah-libya-backup-secret-2026";

export async function GET(req: NextRequest) {
  try {
    // التحقق من صحة الطلب (حماية من الاستدعاء الخارجي)
    const authHeader = req.headers.get("authorization");
    const expectedAuth = `Bearer ${CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      await logSecurityEvent({
        type: "UNAUTHORIZED_BACKUP_ACCESS",
        severity: "HIGH",
        ip: req.headers.get("x-forwarded-for") || "unknown",
        description: "محاولة وصول غير مصرح بها لـ backup API",
      });
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const startTime = Date.now();
    const backupDate = new Date().toISOString().slice(0, 10);
    const backupId = `backup-${backupDate}-${Date.now()}`;

    // ===== جمع كل البيانات =====
    const [
      users,
      companies,
      packages,
      orders,
      promotions,
      messages,
      settings,
      loginAttempts,
      securityEvents,
      fileUploads,
    ] = await Promise.all([
      db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
          // لا نأخذ كلمات المرور لأمان إضافي
        },
      }),
      db.company.findMany(),
      db.package.findMany(),
      db.order.findMany(),
      db.promotion.findMany(),
      db.message.findMany(),
      db.setting.findMany(),
      // آخر 30 يوم من محاولات الدخول
      db.loginAttempt.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      // آخر 30 يوم من الأحداث الأمنية
      db.securityEvent.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      db.fileUpload.findMany(),
    ]);

    // ===== بناء كائن النسخة الاحتياطية =====
    const backup = {
      metadata: {
        backupId,
        backupDate,
        createdAt: new Date().toISOString(),
        version: "1.0",
        retentionDays: BACKUP_RETENTION_DAYS,
        expiresAt: new Date(Date.now() + BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      },
      stats: {
        users: users.length,
        companies: companies.length,
        packages: packages.length,
        orders: orders.length,
        promotions: promotions.length,
        messages: messages.length,
        settings: settings.length,
        loginAttempts: loginAttempts.length,
        securityEvents: securityEvents.length,
        fileUploads: fileUploads.length,
      },
      data: {
        users,
        companies,
        packages,
        orders,
        promotions,
        messages,
        settings,
        loginAttempts,
        securityEvents,
        fileUploads,
      },
    };

    const backupJson = JSON.stringify(backup, null, 2);
    const backupSize = Buffer.byteLength(backupJson, "utf8");

    // ===== تسجيل النسخة الاحتياطية =====
    await logSecurityEvent({
      type: "BACKUP_CREATED",
      severity: "LOW",
      description: `تم إنشاء نسخة احتياطية: ${backupId}`,
      metadata: JSON.stringify({
        backupId,
        size: backupSize,
        duration: Date.now() - startTime,
        stats: backup.stats,
      }),
    });

    // ===== تنظيف النسخ القديمة (احتفاظ بـ 30 يوم) =====
    const thirtyDaysAgo = new Date(Date.now() - BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // حذف سجلات الأمان الأقدم من 30 يوم (للحفاظ على حجم قاعدة البيانات)
    await db.loginAttempt.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });

    await db.securityEvent.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        severity: { in: ["LOW", "MEDIUM"] }, // احتفاظ بالأحداث الحرجة
      },
    });

    // ===== إرجاع النسخة كملف JSON =====
    return new NextResponse(backupJson, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${backupId}.json"`,
        "X-Backup-Id": backupId,
        "X-Backup-Size": String(backupSize),
      },
    });
  } catch (error: any) {
    console.error("Backup error:", error);
    await logSecurityEvent({
      type: "BACKUP_FAILED",
      severity: "HIGH",
      description: `فشل النسخ الاحتياطي: ${error.message}`,
    });
    return NextResponse.json(
      { error: "فشل إنشاء النسخة الاحتياطية", details: error.message },
      { status: 500 }
    );
  }
}
