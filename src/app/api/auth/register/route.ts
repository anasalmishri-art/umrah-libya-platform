import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      // Account
      email,
      password,
      name,
      phone,
      // Company
      companyName,
      description,
      licenseNumber,
      companyPhone,
      whatsapp,
      companyEmail,
      address,
      city,
      country,
      website,
    } = body;

    // Validation
    if (!email || !password || !name || !companyName || !companyPhone) {
      return NextResponse.json(
        { error: "جميع الحقول الأساسية مطلوبة" },
        { status: 400 }
      );
    }

    // Check if email exists
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with company role
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        role: "COMPANY",
        company: {
          create: {
            name: companyName,
            description,
            licenseNumber,
            phone: companyPhone,
            whatsapp,
            email: companyEmail,
            address,
            city,
            country: country || "السعودية",
            website,
            status: "PENDING",
          },
        },
      },
      include: { company: true },
    });

    // Auto-login (but they still need admin approval)
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
      message: "تم إنشاء حساب شركتك بنجاح. سيتم مراجعة طلبك من قبل الإدارة قبل تفعيل الحساب.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.company?.id,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب" },
      { status: 500 }
    );
  }
}
