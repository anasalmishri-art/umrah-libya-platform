import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, setSessionCookie } from "@/lib/auth";
import { rateLimit, getClientIP, isValidEmail } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    // ===== Rate Limiting =====
    const ip = getClientIP(req);
    const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000); // 5 محاولات كل 15 دقيقة
    if (!limit.allowed) {
      const retryAfter = Math.ceil((limit.resetTime - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `تم تجاوز عدد محاولات الدخول. حاول مرة أخرى بعد ${retryAfter} دقيقة` },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)) },
        }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    // ===== التحقق من المدخلات =====
    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    if (email.length > 254 || password.length > 128) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "صيغة البريد الإلكتروني غير صحيحة" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { company: true },
    });

    // رسالة عامة لتفادي User Enumeration
    const genericError = { error: "بيانات الدخول غير صحيحة" };

    if (!user) {
      // تنفيذ bcrypt وهمي لمنع Timing Attacks
      await bcrypt.hash("dummy", 10);
      return NextResponse.json(genericError, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(genericError, { status: 401 });
    }

    // ===== التحقق من حالة الشركة =====
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
