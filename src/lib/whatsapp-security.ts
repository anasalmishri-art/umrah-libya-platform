import crypto from "crypto";

/**
 * نظام أمان روابط واتساب باستخدام HMAC - #14
 * يمنع تزوير أرقام الطلبات والمعلومات
 */

const HMAC_SECRET = process.env.JWT_SECRET || "umrah-libya-secret-2026";

/**
 * إنشاء توقيع HMAC للطلب
 */
export function generateOrderSignature(orderData: {
  orderNumber: string;
  customerPhone: string;
  totalPrice: number;
}): string {
  const payload = `${orderData.orderNumber}:${orderData.customerPhone}:${orderData.totalPrice}`;
  return crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("hex").slice(0, 16);
}

/**
 * التحقق من توقيع HMAC للطلب
 */
export function verifyOrderSignature(
  orderData: { orderNumber: string; customerPhone: string; totalPrice: number },
  signature: string
): boolean {
  const expectedSignature = generateOrderSignature(orderData);
  // استخدام timingSafeEqual لمنع Timing Attacks
  if (expectedSignature.length !== signature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(signature, "hex")
  );
}

/**
 * إنشاء رابط واتساب آمن مع توقيع
 */
export function buildSecureWhatsAppUrl(params: {
  phone: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  packageTitle: string;
  companyName: string;
  durationDays: number;
  numPersons: number;
  totalPrice: number;
  currency: string;
  notes?: string;
}): string {
  // تنظيف رقم الهاتف
  const cleanPhone = params.phone.replace(/[^0-9]/g, "");

  // إنشاء التوقيع
  const signature = generateOrderSignature({
    orderNumber: params.orderNumber,
    customerPhone: params.customerPhone,
    totalPrice: params.totalPrice,
  });

  // بناء الرسالة مع التوقيع
  const message = `السلام عليكم ورحمة الله،

أرغب في حجز باقة العمرة التالية:

📦 *رقم الطلب:* ${params.orderNumber}
🔐 *رمز التحقق:* ${signature}
🕌 *الباقة:* ${params.packageTitle}
🏢 *الشركة:* ${params.companyName}
📅 *المدة:* ${params.durationDays} أيام

👤 *بيانات العميل:*
- الاسم: ${params.customerName}
- الهاتف: ${params.customerPhone}
- عدد الأشخاص: ${params.numPersons}

💰 *الإجمالي:* ${params.totalPrice.toLocaleString()} ${params.currency}
${params.notes ? `\n📝 *ملاحظات:* ${params.notes}` : ""}

⚠️ *تحذير:* لا تكمل العملية إلا بعد التحقق من رمز التحقق مع الإدارة.

أرجو تأكيد الحجز وطريقة الدفع. شكراً لكم.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * التحقق من صحة رقم الطلب (منع التزوير)
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  // التنسيق: UMR-XXXXXXXX (8 أرقام)
  const regex = /^UMR-\d{8}$/;
  return regex.test(orderNumber);
}
