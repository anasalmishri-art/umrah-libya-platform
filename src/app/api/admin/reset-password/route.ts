import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

// POST: admin resets a company's password
// Returns the new password in plaintext so admin can share it
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, newPassword } = body;

    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Generate a random password if not provided
    const password = newPassword || Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "تم إعادة تعيين كلمة المرور بنجاح",
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        password, // Return plaintext so admin can share it
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
