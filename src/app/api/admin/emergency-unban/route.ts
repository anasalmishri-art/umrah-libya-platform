import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/audit-log";

/**
 * API طوارئ لإلغاء حظر جميع IPs
 *
 * الحماية: يتطلب CRON_SECRET
 * يحذف كل الـ IPs المحظورة
 */
export async function POST(req: NextRequest) {
  try {
    // ===== التحقق من CRON_SECRET =====
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json({ error: "CRON_SECRET غير مضبوط" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // ===== حذف كل الـ IPs المحظورة =====
    const deleted = await db.bannedIP.deleteMany({});

    // ===== حذف محاولات الدخول الفاشلة (لإعادة العدّاد) =====
    await db.loginAttempt.deleteMany({
      where: { success: false },
    });

    // ===== تسجيل الحدث =====
    await logSecurityEvent({
      type: "EMERGENCY_IP_UNBAN",
      severity: "HIGH",
      description: `تم إلغاء حظر ${deleted.count} IP عبر طوارئ`,
    });

    return NextResponse.json({
      success: true,
      message: `تم إلغاء حظر ${deleted.count} IP بنجاح!`,
      unbannedCount: deleted.count,
    });
  } catch (error: any) {
    console.error("Emergency unban error:", error);
    return NextResponse.json({ error: "حدث خطأ: " + error.message }, { status: 500 });
  }
}
