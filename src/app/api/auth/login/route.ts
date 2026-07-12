import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, setSessionCookie } from "@/lib/auth";
import { getClientIP, isValidEmail } from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit-redis";
import { logLoginAttempt, recordFailedAttempt, isIPBanned } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  let email: string | undefined;
  let ip: string;

  try {
    ip = getClientIP(req);

    // ===== 1. التحقق من حظر IP =====
    const banCheck = await isIPBanned(ip);
    if (banCheck.banned) {
      const remainingTime = banCheck.bannedUntil
        ? Math.ceil((banCheck.bannedUntil.getTime() - Date.now()) / 1000 / 60)
        : 0;
      return NextResponse.json(
        {
          error: `تم حظر عنوان IP الخاص بك. المحاولة مرة أخرى بعد ${remainingTime} دقيقة. السبب: ${banCheck.reason}`,
        },
        {
          status: 403,
          headers: remainingTime > 0 ? { "Retry-After": String(remainingTime * 60) } : {},
        }
      );
    }

    // ===== 2. Rate Limiting (Redis) =====
    const rateLimitResult = await checkRateLimit("login", ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "تم تجاوز عدد محاولات الدخول. حاول مرة أخرى بعد 15 دقيقة" },
        {
          status: 429,
          headers: { "Retry-After": "900" },
        }
      );
    }

    const body = await req.json();
    email = body.email;
    const password = body.password;

    // ===== 3. التحقق من المدخلات =====
    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    if (email.length > 254 || password.length > 128) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
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

      // تسجيل المحاولة الفاشلة
      await logLoginAttempt({
        email,
        ip,
        userAgent: req.headers.get("user-agent") || undefined,
        success: false,
        failureReason: "USER_NOT_FOUND",
      });

      // تسجيل المحاولة الفاشلة + فحص الحظر التلقائي
      const banResult = await recordFailedAttempt(ip, email);
      if (banResult.shouldBan) {
        return NextResponse.json(
          { error: "تم حظر حسابك مؤقتاً بسبب محاولات دخول كثيرة فاشلة" },
          { status: 403 }
        );
      }

      return NextResponse.json(genericError, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // تسجيل المحاولة الفاشلة
      await logLoginAttempt({
        email,
        ip,
        userAgent: req.headers.get("user-agent") || undefined,
        success: false,
        failureReason: "WRONG_PASSWORD",
      });

      // فحص الحظر التلقائي
      const banResult = await recordFailedAttempt(ip, email);
      if (banResult.shouldBan) {
        return NextResponse.json(
          { error: "تم حظر حسابك مؤقتاً بسبب محاولات دخول كثيرة فاشلة" },
          { status: 403 }
        );
      }

      return NextResponse.json(genericError, { status: 401 });
    }

    // ===== التحقق من حالة الشركة =====
    if (user.role === "COMPANY" && user.company) {
      if (user.company.status === "PENDING") {
        await logLoginAttempt({
          email,
          ip,
          userAgent: req.headers.get("user-agent") || undefined,
          success: false,
          failureReason: "COMPANY_PENDING",
        });
        return NextResponse.json(
          { error: "حساب الشركة قيد المراجعة من قبل الإدارة. سيتم التواصل معكم قريباً." },
          { status: 403 }
        );
      }
      if (user.company.status === "REJECTED") {
        await logLoginAttempt({
          email,
          ip,
          userAgent: req.headers.get("user-agent") || undefined,
          success: false,
          failureReason: "COMPANY_REJECTED",
        });
        return NextResponse.json(
          { error: "تم رفض طلب انضمام شركتك. يرجى التواصل مع الإدارة." },
          { status: 403 }
        );
      }
      if (user.company.status === "SUSPENDED") {
        await logLoginAttempt({
          email,
          ip,
          userAgent: req.headers.get("user-agent") || undefined,
          success: false,
          failureReason: "COMPANY_SUSPENDED",
        });
        return NextResponse.json(
          { error: "حساب شركتك موقوف مؤقتاً. يرجى التواصل مع الإدارة." },
          { status: 403 }
        );
      }
    }

    // ===== تسجيل الدخول الناجح =====
    await logLoginAttempt({
      email,
      ip,
      userAgent: req.headers.get("user-agent") || undefined,
      success: true,
    });

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

    // تسجيل الخطأ
    if (ip) {
      await logLoginAttempt({
        email,
        ip,
        success: false,
        failureReason: "SERVER_ERROR",
      });
    }

    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
