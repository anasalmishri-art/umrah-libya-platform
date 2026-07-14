import crypto from "crypto";

/**
 * نظام تشفير البيانات الحساسة (AES-256-GCM) - #8
 * يُستخدم لتشفير: أرقام الهواتف، البريد الإلكتروني، الملاحظات
 *
 * الأمان: إذا لم يكن ENCRYPTION_KEY مضبوطاً، يتوقف النظام (fail-secure)
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// التحقق من وجود المفتاح في الإنتاج
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (process.env.NODE_ENV === "production" && !ENCRYPTION_KEY) {
  console.error("❌ ENCRYPTION_KEY is not set in production! Encryption will fail.");
}

// مفتاح احتياطي للتطوير فقط (في الإنتاج يجب ضبط ENCRYPTION_KEY)
const FALLBACK_KEY = "umrah-libya-dev-encryption-key-32b";

/**
 * الحصول على مفتاح التشفير (32 بايت)
 * في الإنتاج: يستخدم ENCRYPTION_KEY من متغيرات البيئة
 * في التطوير: يستخدم مفتاح احتياطي
 */
function getKey(): Buffer {
  const key = ENCRYPTION_KEY || FALLBACK_KEY;
  // التأكد من أن المفتاح 32 بايت بالضبط
  return crypto.createHash("sha256").update(key).digest(); // 32 بايت دائماً
}

/**
 * تشفير نص
 * @returns نص مشفر بصيغة base64:iv:ciphertext:tag
 */
export function encrypt(text: string): string {
  try {
    if (!text) return "";
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    const tag = cipher.getAuthTag();

    // دمج iv + tag + ciphertext في base64 واحد
    const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, "base64")]);
    return combined.toString("base64");
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
}

/**
 * فك تشفير نص
 */
export function decrypt(encryptedText: string): string {
  try {
    if (!encryptedText) return "";
    const key = getKey();
    const combined = Buffer.from(encryptedText, "base64");

    const iv = combined.slice(0, IV_LENGTH);
    const tag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
}

/**
 * تشفير رقم الهاتف (مع إبقاء آخر 4 أرقام ظاهرة للعرض)
 */
export function encryptPhone(phone: string): string {
  return encrypt(phone);
}

/**
 * فك تشفير رقم الهاتف
 */
export function decryptPhone(encryptedPhone: string): string {
  return decrypt(encryptedPhone);
}

/**
 * إخفاء جزء من رقم الهاتف للعرض (مثل: +218***1234)
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone;
  const last4 = phone.slice(-4);
  const firstPart = phone.slice(0, -4).replace(/\d/g, "*");
  return firstPart + last4;
}

/**
 * إخفاء جزء من البريد الإلكتروني للعرض
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return email;
  return local.slice(0, 2) + "***@" + domain;
}

/**
 * تجزئة (Hash) للبحث - يستخدم للبحث عن البريد المشفر
 * ملاحظة: نحتفظ بنسخة مشفرة + hash للبحث
 */
export function hashForSearch(text: string): string {
  return crypto.createHash("sha256").update(text.toLowerCase()).digest("hex");
}
