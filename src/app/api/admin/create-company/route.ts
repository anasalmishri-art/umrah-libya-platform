import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

// POST: admin creates a company account manually
// Returns the password in plaintext so admin can share it
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const {
      email,
      password,
      name, // admin contact name
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
      autoApprove,
    } = body;

    if (!email || !password || !companyName || !companyPhone) {
      return NextResponse.json({ error: "البيانات الأساسية مطلوبة" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
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
            country: country || "ليبيا",
            website,
            status: autoApprove ? "APPROVED" : "PENDING",
          },
        },
      },
      include: { company: true },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء حساب الشركة بنجاح",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        password, // Return plaintext password so admin can share it
        role: newUser.role,
        company: newUser.company,
      },
    });
  } catch (error) {
    console.error("Admin create company error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الحساب" }, { status: 500 });
  }
}
