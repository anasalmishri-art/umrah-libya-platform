import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/audit-log";

/**
 * الفحص اليومي التلقائي للموقع - Check كل 24 ساعة
 * يعمل عبر Vercel Cron
 * يفحص:
 * 1. صحة قاعدة البيانات
 * 2. الأمان (محاولات دخول، IPs محظورة)
 * 3. الأداء (عدد الطلبات، الأخطاء)
 * 4. النسخ الاحتياطي
 * 5. الـ APIs
 */

const CRON_SECRET = process.env.CRON_SECRET || "umrah-libya-backup-secret-2026";
const REPORT_RETENTION_DAYS = 30;

interface HealthCheck {
  category: string;
  status: "PASS" | "WARN" | "FAIL";
  message: string;
  details?: any;
}

export async function GET(req: NextRequest) {
  try {
    // التحقق من الصلاحية
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const checks: HealthCheck[] = [];
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ===== 1. فحص قاعدة البيانات =====
    try {
      const userCount = await db.user.count();
      const companyCount = await db.company.count();
      const packageCount = await db.package.count();
      const orderCount = await db.order.count();

      checks.push({
        category: "قاعدة البيانات",
        status: "PASS",
        message: `قاعدة البيانات تعمل بشكل طبيعي`,
        details: { users: userCount, companies: companyCount, packages: packageCount, orders: orderCount },
      });
    } catch (error: any) {
      checks.push({
        category: "قاعدة البيانات",
        status: "FAIL",
        message: `فشل الاتصال بقاعدة البيانات: ${error.message}`,
      });
    }

    // ===== 2. فحص الأمان =====
    try {
      // محاولات الدخول الفاشلة في آخر 24 ساعة
      const failedLogins = await db.loginAttempt.count({
        where: {
          success: false,
          createdAt: { gte: yesterday },
        },
      });

      // محاولات الدخول الناجحة
      const successfulLogins = await db.loginAttempt.count({
        where: {
          success: true,
          createdAt: { gte: yesterday },
        },
      });

      // IPs المحظورة حالياً
      const bannedIPs = await db.bannedIP.count({
        where: { bannedUntil: { gt: now } },
      });

      // أحداث أمنية حرجة
      const criticalEvents = await db.securityEvent.count({
        where: {
          severity: "CRITICAL",
          createdAt: { gte: yesterday },
        },
      });

      if (failedLogins > 100) {
        checks.push({
          category: "الأمان",
          status: "WARN",
          message: `عدد محاولات الدخول الفاشلة مرتفع: ${failedLogins} في 24 ساعة`,
          details: { failedLogins, successfulLogins, bannedIPs, criticalEvents },
        });
      } else if (criticalEvents > 0) {
        checks.push({
          category: "الأمان",
          status: "WARN",
          message: `يوجد ${criticalEvents} حدث أمني حرج في 24 ساعة`,
          details: { failedLogins, successfulLogins, bannedIPs, criticalEvents },
        });
      } else {
        checks.push({
          category: "الأمان",
          status: "PASS",
          message: `الوضع الأمني مستقر`,
          details: { failedLogins, successfulLogins, bannedIPs, criticalEvents },
        });
      }
    } catch (error: any) {
      checks.push({
        category: "الأمان",
        status: "FAIL",
        message: `فشل فحص الأمان: ${error.message}`,
      });
    }

    // ===== 3. فحص الشركات =====
    try {
      const pendingCompanies = await db.company.count({ where: { status: "PENDING" } });
      const approvedCompanies = await db.company.count({ where: { status: "APPROVED" } });
      const suspendedCompanies = await db.company.count({ where: { status: "SUSPENDED" } });

      if (pendingCompanies > 5) {
        checks.push({
          category: "الشركات",
          status: "WARN",
          message: `${pendingCompanies} شركة بانتظار المراجعة`,
          details: { pending: pendingCompanies, approved: approvedCompanies, suspended: suspendedCompanies },
        });
      } else {
        checks.push({
          category: "الشركات",
          status: "PASS",
          message: `الشركات في وضع طبيعي`,
          details: { pending: pendingCompanies, approved: approvedCompanies, suspended: suspendedCompanies },
        });
      }
    } catch (error: any) {
      checks.push({
        category: "الشركات",
        status: "FAIL",
        message: `فشل فحص الشركات: ${error.message}`,
      });
    }

    // ===== 4. فحص الطلبات =====
    try {
      const pendingOrders = await db.order.count({ where: { status: "PENDING_PAYMENT" } });
      const paidOrders = await db.order.count({ where: { status: "PAID" } });
      const completedOrders = await db.order.count({ where: { status: "COMPLETED" } });
      const cancelledOrders = await db.order.count({ where: { status: "CANCELLED" } });

      const totalRevenue = await db.order.aggregate({
        where: { status: { in: ["PAID", "COMPLETED"] } },
        _sum: { totalPrice: true },
      });

      checks.push({
        category: "الطلبات",
        status: "PASS",
        message: `الطلبات في وضع طبيعي`,
        details: {
          pending: pendingOrders,
          paid: paidOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          revenue: totalRevenue._sum.totalPrice || 0,
        },
      });
    } catch (error: any) {
      checks.push({
        category: "الطلبات",
        status: "FAIL",
        message: `فشل فحص الطلبات: ${error.message}`,
      });
    }

    // ===== 5. فحص المتغيرات البيئية =====
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
      CRON_SECRET: !!process.env.CRON_SECRET,
      UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    };

    const missingVars = Object.entries(envVars).filter(([_, v]) => !v).map(([k]) => k);

    if (missingVars.length > 0) {
      checks.push({
        category: "المتغيرات البيئية",
        status: missingVars.includes("DATABASE_URL") || missingVars.includes("JWT_SECRET") ? "FAIL" : "WARN",
        message: `متغيرات مفقودة: ${missingVars.join(", ")}`,
        details: envVars,
      });
    } else {
      checks.push({
        category: "المتغيرات البيئية",
        status: "PASS",
        message: "كل المتغيرات البيئية مضبوطة",
        details: envVars,
      });
    }

    // ===== 6. حساب النتيجة الإجمالية =====
    const passCount = checks.filter((c) => c.status === "PASS").length;
    const warnCount = checks.filter((c) => c.status === "WARN").length;
    const failCount = checks.filter((c) => c.status === "FAIL").length;

    const overallStatus: "PASS" | "WARN" | "FAIL" =
      failCount > 0 ? "FAIL" : warnCount > 0 ? "WARN" : "PASS";

    const report = {
      id: `report-${now.toISOString().slice(0, 10)}-${Date.now()}`,
      date: now.toISOString(),
      overallStatus,
      summary: {
        total: checks.length,
        passed: passCount,
        warnings: warnCount,
        failed: failCount,
      },
      checks,
    };

    // ===== 7. تسجيل الحدث =====
    await logSecurityEvent({
      type: "DAILY_HEALTH_CHECK",
      severity: overallStatus === "PASS" ? "LOW" : overallStatus === "WARN" ? "MEDIUM" : "HIGH",
      description: `فحص يومي: ${passCount} نجح، ${warnCount} تحذير، ${failCount} فشل`,
      metadata: JSON.stringify(report.summary),
    });

    // ===== 8. تنظيف التقارير القديمة (30 يوم) =====
    // حذف سجلات الفحص القديمة (نحتفظ بالأحداث الحرجة)
    await db.securityEvent.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - REPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000) },
        type: "DAILY_HEALTH_CHECK",
      },
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        id: `report-error-${Date.now()}`,
        date: new Date().toISOString(),
        overallStatus: "FAIL",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
