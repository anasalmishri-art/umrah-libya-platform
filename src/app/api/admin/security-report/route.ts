import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * API للحصول على تقرير الأمان الكامل
 * يعرض:
 * - سجل محاولات الدخول
 * - IPs المحظورة
 * - الأحداث الأمنية
 * - آخر فحص يومي
 * - إحصائيات الأمان
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // ===== 1. إحصائيات محاولات الدخول =====
    const [loginStats, recentLogins] = await Promise.all([
      db.loginAttempt.groupBy({
        by: ["success"],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),
      db.loginAttempt.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    // ===== 2. IPs المحظورة =====
    const bannedIPs = await db.bannedIP.findMany({
      orderBy: { bannedUntil: "desc" },
      take: 100,
    });

    // ===== 3. الأحداث الأمنية =====
    const [securityEvents, eventStats] = await Promise.all([
      db.securityEvent.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.securityEvent.groupBy({
        by: ["severity"],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),
    ]);

    // ===== 4. آخر فحص يومي =====
    const lastHealthCheck = await db.securityEvent.findFirst({
      where: { type: "DAILY_HEALTH_CHECK" },
      orderBy: { createdAt: "desc" },
    });

    // ===== 5. إحصائيات إجمالية =====
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const stats = {
      loginAttempts: {
        total: await db.loginAttempt.count({ where: { createdAt: { gte: startDate } } }),
        successful: await db.loginAttempt.count({
          where: { success: true, createdAt: { gte: startDate } },
        }),
        failed: await db.loginAttempt.count({
          where: { success: false, createdAt: { gte: startDate } },
        }),
        last24h: await db.loginAttempt.count({ where: { createdAt: { gte: last24Hours } } }),
      },
      bannedIPs: {
        total: bannedIPs.length,
        active: bannedIPs.filter((b) => b.bannedUntil > now).length,
        permanent: bannedIPs.filter((b) => b.bannedPermanently).length,
      },
      securityEvents: {
        total: await db.securityEvent.count({ where: { createdAt: { gte: startDate } } }),
        critical: await db.securityEvent.count({
          where: { severity: "CRITICAL", createdAt: { gte: startDate } },
        }),
        high: await db.securityEvent.count({
          where: { severity: "HIGH", createdAt: { gte: startDate } },
        }),
        medium: await db.securityEvent.count({
          where: { severity: "MEDIUM", createdAt: { gte: startDate } },
        }),
        low: await db.securityEvent.count({
          where: { severity: "LOW", createdAt: { gte: startDate } },
        }),
      },
    };

    return NextResponse.json({
      success: true,
      period: { days, startDate: startDate.toISOString(), endDate: now.toISOString() },
      stats,
      recentLogins,
      bannedIPs,
      securityEvents,
      lastHealthCheck: lastHealthCheck
        ? {
            date: lastHealthCheck.createdAt,
            description: lastHealthCheck.description,
            metadata: lastHealthCheck.metadata,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Security report error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
