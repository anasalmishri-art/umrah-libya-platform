import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * نظام Rate Limiting المتقدم باستخدام Redis (Upstash) - #12
 * يعمل تلقائياً على Vercel
 *
 * إذا لم تكن متغيرات Upstash مضبوطة، يستخدم النظام الذاكرة المحلية
 */

let ratelimiters: {
  login: Ratelimit | null;
  register: Ratelimit | null;
  order: Ratelimit | null;
  upload: Ratelimit | null;
  api: Ratelimit | null;
};

// ===== Rate Limiting الاحتياطي (في الذاكرة) =====
const memoryLimitMap = new Map<string, { count: number; resetTime: number }>();

function memoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    memoryLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

// ===== تهيئة Redis =====
function initRedis() {
  if (ratelimiters) return ratelimiters;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    ratelimiters = {
      // تسجيل الدخول: 5 محاولات كل 15 دقيقة
      login: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "rl:login",
      }),
      // التسجيل: 3 محاولات كل ساعة
      register: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        prefix: "rl:register",
      }),
      // الطلبات: 10 طلبات كل ساعة
      order: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        prefix: "rl:order",
      }),
      // رفع الملفات: 20 ملف كل ساعة
      upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        prefix: "rl:upload",
      }),
      // API العام: 100 طلب كل دقيقة
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        prefix: "rl:api",
      }),
    };
  } else {
    // استخدام الذاكرة المحلية
    ratelimiters = {
      login: null,
      register: null,
      order: null,
      upload: null,
      api: null,
    };
  }

  return ratelimiters;
}

/**
 * تطبيق Rate Limiting
 */
export async function checkRateLimit(
  type: "login" | "register" | "order" | "upload" | "api",
  identifier: string
): Promise<{ allowed: boolean; remaining: number; resetTime?: number }> {
  const limits = initRedis();
  const limiter = limits[type];

  if (limiter) {
    // استخدام Redis
    const result = await limiter.limit(identifier);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetTime: result.reset,
    };
  }

  // استخدام الذاكرة المحلية
  const config = {
    login: { limit: 5, window: 15 * 60 * 1000 },
    register: { limit: 3, window: 60 * 60 * 1000 },
    order: { limit: 10, window: 60 * 60 * 1000 },
    upload: { limit: 20, window: 60 * 60 * 1000 },
    api: { limit: 100, window: 60 * 1000 },
  }[type];

  const result = memoryRateLimit(identifier, config.limit, config.window);
  return result;
}
