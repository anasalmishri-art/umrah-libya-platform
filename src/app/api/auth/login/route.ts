import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    // Check company approval status
    if (user.role === "COMPANY" && user.company) {
      if (user.company.status === "PENDING") {
        return NextResponse.json(
          { error: "حساب الشركة قيد المراجعة من قبل الإدارة. سيتم التواصل معكم قريباً." },
          { status: 403 }
        );
      }
      if (user.company.status === "REJECTED") {
        return NextResponse.json(
          { error: "تم رفض طلب انضمام شركتك. يرجى التواصل مع الإدارة." },
          { status: 403 }
        );
      }
      if (user.company.status === "SUSPENDED") {
        return NextResponse.json(
          { error: "حساب شركتك موقوف مؤقتاً. يرجى التواصل مع الإدارة." },
          { status: 403 }
        );
      }
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      companyId: user.company?.id,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.company?.id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
