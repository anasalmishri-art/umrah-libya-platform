import { db } from "@/lib/db";

/**
 * نظام تسجيل محاولات الدخول (Audit Log) - #3
 * ونظام حظر IP التلقائي - #4
 */

const MAX_ATTEMPTS_15MIN = 5; // 5 محاولات فاشلة في 15 دقيقة
const MAX_ATTEMPTS_1HOUR = 10; // 10 محاولات فاشلة في ساعة
const MAX_ATTEMPTS_24HOURS = 20; // 20 محاولة فاشلة في 24 ساعة

const BAN_DURATIONS = {
  LEVEL_1: 15 * 60 * 1000, // 15 دقيقة
  LEVEL_2: 60 * 60 * 1000, // ساعة
  LEVEL_3: 24 * 60 * 60 * 1000, // 24 ساعة
  PERMANENT: 365 * 24 * 60 * 60 * 1000, // سنة (شبه دائم)
};

/**
 * تسجيل محاولة الدخول في قاعدة البيانات
 */
export async function logLoginAttempt(params: {
  email?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
}): Promise<void> {
  try {
    await db.loginAttempt.create({
      data: {
        email: params.email?.toLowerCase() || null,
        ip: params.ip,
        userAgent: params.userAgent?.slice(0, 500) || null,
        success: params.success,
        failureReason: params.failureReason || null,
      },
    });

    // تسجيل حدث أمني عند الفشل
    if (!params.success) {
      await logSecurityEvent({
        type: "LOGIN_FAILED",
        severity: "LOW",
        ip: params.ip,
        description: `محاولة دخول فاشلة للبريد: ${params.email || "غير معروف"}`,
      });
    }
  } catch (error) {
    console.error("Failed to log login attempt:", error);
  }
}

/**
 * التحقق مما إذا كان IP محظوراً
 */
export async function isIPBanned(ip: string): Promise<{ banned: boolean; reason?: string; bannedUntil?: Date }> {
  try {
    const ban = await db.bannedIP.findUnique({
      where: { ip },
    });

    if (!ban) {
      return { banned: false };
    }

    // حظر دائم
    if (ban.bannedPermanently) {
      return {
        banned: true,
        reason: ban.reason,
        bannedUntil: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
      };
    }

    // حظر مؤقت - تحقق من الانتهاء
    if (ban.bannedUntil > new Date()) {
      return {
        banned: true,
        reason: ban.reason,
        bannedUntil: ban.bannedUntil,
      };
    }

    // انتهى الحظر - احذف السجل
    await db.bannedIP.delete({ where: { ip } });
    return { banned: false };
  } catch (error) {
    console.error("Failed to check IP ban:", error);
    return { banned: false };
  }
}

/**
 * تسجيل محاولة فاشلة وحظر IP تلقائياً عند تجاوز الحد
 */
export async function recordFailedAttempt(ip: string, email?: string): Promise<{
  shouldBan: boolean;
  banDuration?: number;
  attemptCount: number;
}> {
  try {
    const now = new Date();
    const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // عد المحاولات الفاشلة في الفترات المختلفة
    const [count15min, count1hour, count24hours] = await Promise.all([
      db.loginAttempt.count({
        where: {
          ip,
          success: false,
          createdAt: { gte: fifteenMinAgo },
        },
      }),
      db.loginAttempt.count({
        where: {
          ip,
          success: false,
          createdAt: { gte: oneHourAgo },
        },
      }),
      db.loginAttempt.count({
        where: {
          ip,
          success: false,
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
    ]);

    const totalAttempts = count24hours;

    // تحديد مستوى الحظر
    let banDuration: number | null = null;
    let reason = "";

    if (count24hours >= MAX_ATTEMPTS_24HOURS) {
      banDuration = BAN_DURATIONS.LEVEL_3;
      reason = `تجاوز ${MAX_ATTEMPTS_24HOURS} محاولة فاشلة في 24 ساعة`;
    } else if (count1hour >= MAX_ATTEMPTS_1HOUR) {
      banDuration = BAN_DURATIONS.LEVEL_2;
      reason = `تجاوز ${MAX_ATTEMPTS_1HOUR} محاولة فاشلة في ساعة`;
    } else if (count15min >= MAX_ATTEMPTS_15MIN) {
      banDuration = BAN_DURATIONS.LEVEL_1;
      reason = `تجاوز ${MAX_ATTEMPTS_15MIN} محاولة فاشلة في 15 دقيقة`;
    }

    if (banDuration) {
      // حظر IP
      await db.bannedIP.upsert({
        where: { ip },
        create: {
          ip,
          reason,
          attemptCount: totalAttempts,
          bannedUntil: new Date(now.getTime() + banDuration),
        },
        update: {
          reason,
          attemptCount: totalAttempts,
          bannedUntil: new Date(now.getTime() + banDuration),
        },
      });

      // تسجيل حدث أمني
      await logSecurityEvent({
        type: "IP_BANNED",
        severity: "HIGH",
        ip,
        description: reason,
        metadata: JSON.stringify({
          attemptCount: totalAttempts,
          banDuration,
          email,
        }),
      });

      return {
        shouldBan: true,
        banDuration,
        attemptCount: totalAttempts,
      };
    }

    return {
      shouldBan: false,
      attemptCount: count15min,
    };
  } catch (error) {
    console.error("Failed to record failed attempt:", error);
    return { shouldBan: false, attemptCount: 0 };
  }
}

/**
 * تسجيل حدث أمني
 */
export async function logSecurityEvent(params: {
  type: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ip?: string;
  userId?: string;
  description: string;
  metadata?: string;
}): Promise<void> {
  try {
    await db.securityEvent.create({
      data: {
        type: params.type,
        severity: params.severity || "MEDIUM",
        ip: params.ip || null,
        userId: params.userId || null,
        description: params.description,
        metadata: params.metadata || null,
      },
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

/**
 * حظر IP يدوياً (للأدمن)
 */
export async function banIPManually(
  ip: string,
  reason: string,
  duration: "1hour" | "24hours" | "7days" | "permanent"
): Promise<void> {
  const durations = {
    "1hour": BAN_DURATIONS.LEVEL_2,
    "24hours": BAN_DURATIONS.LEVEL_3,
    "7days": 7 * 24 * 60 * 60 * 1000,
    permanent: BAN_DURATIONS.PERMANENT,
  };

  await db.bannedIP.upsert({
    where: { ip },
    create: {
      ip,
      reason: `حظر يدوي: ${reason}`,
      bannedUntil: new Date(Date.now() + durations[duration]),
      bannedPermanently: duration === "permanent",
    },
    update: {
      reason: `حظر يدوي: ${reason}`,
      bannedUntil: new Date(Date.now() + durations[duration]),
      bannedPermanently: duration === "permanent",
    },
  });

  await logSecurityEvent({
    type: "IP_BANNED_MANUAL",
    severity: "MEDIUM",
    ip,
    description: `حظر يدوي: ${reason}`,
  });
}

/**
 * إلغاء حظر IP (للأدمن)
 */
export async function unbanIP(ip: string): Promise<void> {
  await db.bannedIP.deleteMany({ where: { ip } });

  await logSecurityEvent({
    type: "IP_UNBANNED",
    severity: "LOW",
    ip,
    description: "تم إلغاء حظر IP",
  });
}
