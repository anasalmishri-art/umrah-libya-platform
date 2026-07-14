import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { isValidEmail, isStrongPassword } from "@/lib/security";
import { logSecurityEvent } from "@/lib/audit-log";

/**
 * API لتعديل بيانات الأدمن الشخصية
 * - تغيير البريد الإلكتروني
 * - تغيير كلمة المرور
 * - تغيير الاسم
 * - تغيير رقم الهاتف
 *
 * يتطلب: أدمن مسجّل دخوله + كلمة المرور الحالية
 */
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { currentPassword, newEmail, newPassword, newName, newPhone } = body;

    // ===== التحقق من كلمة المرور الحالية =====
    const adminUser = await db.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const validPassword = await bcrypt.compare(currentPassword, adminUser.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "كلمة المرور الحالية غير صحيحة" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    const changes: string[] = [];

    // ===== تحديث البريد الإلكتروني =====
    if (newEmail && newEmail !== adminUser.email) {
      if (!isValidEmail(newEmail)) {
        return NextResponse.json(
          { error: "صيغة البريد الإلكتروني غير صحيحة" },
          { status: 400 }
        );
      }

      // التحقق من عدم التكرار
      const existing = await db.user.findUnique({
        where: { email: newEmail.toLowerCase() },
      });
      if (existing && existing.id !== adminUser.id) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 400 }
        );
      }

      updateData.email = newEmail.toLowerCase();
      changes.push("البريد الإلكتروني");
    }

    // ===== تحديث كلمة المرور =====
    if (newPassword) {
      const passwordCheck = isStrongPassword(newPassword);
      if (!passwordCheck.valid) {
        return NextResponse.json(
          { error: passwordCheck.message },
          { status: 400 }
        );
      }

      // التحقق من أن كلمة المرور الجديدة مختلفة
      const isSamePassword = await bcrypt.compare(newPassword, adminUser.password);
      if (isSamePassword) {
        return NextResponse.json(
          { error: "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية" },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
      changes.push("كلمة المرور");
    }

    // ===== تحديث الاسم =====
    if (newName && newName !== adminUser.name) {
      if (newName.length < 3 || newName.length > 100) {
        return NextResponse.json(
          { error: "الاسم يجب أن يكون بين 3 و 100 حرف" },
          { status: 400 }
        );
      }
      updateData.name = newName;
      changes.push("الاسم");
    }

    // ===== تحديث الهاتف =====
    if (newPhone !== undefined && newPhone !== adminUser.phone) {
      updateData.phone = newPhone || null;
      changes.push("رقم الهاتف");
    }

    // ===== إذا لا توجد تغييرات =====
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "لا توجد تغييرات للإجراء" },
        { status: 400 }
      );
    }

    // ===== تنفيذ التحديث =====
    await db.user.update({
      where: { id: adminUser.id },
      data: updateData,
    });

    // ===== تسجيل الحدث الأمني =====
    await logSecurityEvent({
      type: "ADMIN_PROFILE_UPDATED",
      severity: "MEDIUM",
      userId: currentUser.id,
      description: `تم تحديث: ${changes.join(", ")}`,
    });

    return NextResponse.json({
      success: true,
      message: `تم تحديث ${changes.join(" و ")} بنجاح`,
      changes,
      note: newPassword
        ? "⚠️ يجب تسجيل الخروج والدخول مرة أخرى بكلمة المرور الجديدة"
        : null,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "حدث خطأ: " + error.message },
      { status: 500 }
    );
  }
}
