/**
 * Rate Limiting بسيط في الذاكرة
 * للاستخدام في APIs الحساسة (login, register, إلخ)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * التحقق من Rate Limit
 * @param identifier - IP أو معرف المستخدم
 * @param limit - عدد الطلبات المسموح
 * @param windowMs - النافذة الزمنية بالمللي ثانية
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 دقيقة افتراضياً
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // إذا انتهت النافذة الزمنية أو لا يوجد إدخال
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  // إذا تجاوز الحد
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  // زيادة العداد
  entry.count++;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * الحصول على IP من الطلب
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

/**
 * تنظيف الإدخال من XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * التحقق من قوة كلمة المرور
 */
export function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
  }
  if (password.length > 128) {
    return { valid: false, message: "كلمة المرور طويلة جداً" };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: "كلمة المرور يجب أن تحتوي على أحرف" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل" };
  }
  return { valid: true };
}

/**
 * التحقق من رقم الهاتف (يدعم الأرقام الليبية وغيرها)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  // إزالة المسافات والشرطات
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // قبول: +218xxxxxxxxx أو 09xxxxxxxx أو أرقام دولية
  const phoneRegex = /^\+?(\d{8,15})$/;
  return phoneRegex.test(cleaned);
}

/**
 * التحقق من النص (منع XSS والحقن)
 */
export function sanitizeText(input: any, maxLength: number = 1000): string {
  if (typeof input !== "string") return "";
  return sanitizeInput(input).slice(0, maxLength);
}
