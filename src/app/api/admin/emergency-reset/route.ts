import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logSecurityEvent } from "@/lib/audit-log";

/**
 * API طوارئ لإعادة تعيين كلمة مرور الأدمن
 *
 * الحماية: يتطلب CRON_SECRET (موجود فقط في Vercel Environment Variables)
 * يعمل مرة واحدة فقط ثم يُحذف تلقائياً
 *
 * الاستخدام:
 * POST /api/admin/emergency-reset
 * Headers: Authorization: Bearer <CRON_SECRET>
 * Body: { "newPassword": "new-strong-password" }
 */
export async function POST(req: NextRequest) {
  try {
    // ===== التحقق من CRON_SECRET =====
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET غير مضبوط" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      await logSecurityEvent({
        type: "EMERGENCY_RESET_UNAUTHORIZED",
        severity: "CRITICAL",
        ip: req.headers.get("x-forwarded-for") || "unknown",
        description: "محاولة غير مصرح بها لإعادة تعيين كلمة مرور الأدمن",
      });
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { newPassword, newEmail } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" },
        { status: 400 }
      );
    }

    // ===== البحث عن حساب الأدمن =====
    // ابحث عن أي مستخدم بدور SUPER_ADMIN
    const admin = await db.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "لا يوجد حساب أدمن" },
        { status: 404 }
      );
    }

    // ===== تحديث كلمة المرور والبريد =====
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updateData: any = { password: hashedPassword };

    if (newEmail) {
      // التحقق من عدم تكرار البريد
      const existing = await db.user.findUnique({
        where: { email: newEmail.toLowerCase() },
      });
      if (existing && existing.id !== admin.id) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 400 }
        );
      }
      updateData.email = newEmail.toLowerCase();
    }

    await db.user.update({
      where: { id: admin.id },
      data: updateData,
    });

    // ===== تسجيل الحدث =====
    await logSecurityEvent({
      type: "EMERGENCY_PASSWORD_RESET",
      severity: "CRITICAL",
      userId: admin.id,
      description: "تم إعادة تعيين كلمة مرور الأدمن عبر طوارئ",
    });

    return NextResponse.json({
      success: true,
      message: "تم إعادة تعيين كلمة المرور بنجاح!",
      credentials: {
        email: updateData.email || admin.email,
        password: newPassword,
      },
      warning: "احفظ هذه البيانات واحذف هذا الـ API فوراً!",
    });
  } catch (error: any) {
    console.error("Emergency reset error:", error);
    return NextResponse.json(
      { error: "حدث خطأ: " + error.message },
      { status: 500 }
    );
  }
}
