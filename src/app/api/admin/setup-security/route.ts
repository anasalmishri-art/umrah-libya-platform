import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logSecurityEvent } from "@/lib/audit-log";

/**
 * API لإعداد الأمان:
 * - إنشاء أدمن جديد بكلمة مرور قوية
 * - حذف الأدمن القديم
 * - حذف الحسابات التجريبية
 *
 * يعمل مرة واحدة فقط - يتطلب معرفة كلمة المرور الحالية
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword } = body;

    // التحقق من المعرفة بكلمة المرور الحالية (admin123)
    if (currentPassword !== "admin123") {
      return NextResponse.json(
        { error: "كلمة المرور الحالية غير صحيحة" },
        { status: 403 }
      );
    }

    const results: string[] = [];

    // ===== 1. إنشاء أدمن جديد =====
    const newAdminEmail = "admin@omrah.ly";
    const newAdminPassword = "Um4h-L1by4-@dm1n-2026!";

    // حذف الأدمن القديم
    const oldAdmin = await db.user.findUnique({ where: { email: "admin@umrah.ly" } });
    if (oldAdmin) {
      await db.user.delete({ where: { id: oldAdmin.id } });
      results.push("✅ تم حذف حساب الأدمن القديم (admin@umrah.ly)");
    }

    // إنشاء الأدمن الجديد
    const hashedPassword = await bcrypt.hash(newAdminPassword, 12);
    await db.user.create({
      data: {
        email: newAdminEmail,
        password: hashedPassword,
        name: "مدير المنصة",
        phone: "+218910000000",
        role: "SUPER_ADMIN",
      },
    });
    results.push(`✅ تم إنشاء حساب الأدمن الجديد: ${newAdminEmail}`);

    // ===== 2. حذف الحسابات التجريبية =====
    const testEmails = [
      "test@test.com",
      "test2@test.com",
      "test3@test.com",
      "test4@test.com",
      "test5@test.com",
      "hacker@hacker.com",
      "hackadmin@test.com",
      "xsstest@test.com",
      "weak@test.com",
      "ahmed.test@example.ly",
    ];

    let deletedCount = 0;
    for (const email of testEmails) {
      const deleted = await db.user.deleteMany({ where: { email } });
      if (deleted.count > 0) {
        deletedCount++;
        results.push(`✅ تم حذف: ${email}`);
      }
    }

    // حذف الشركات التجريبية (بدون باقات حقيقية)
    const testCompanyNames = ["test", "tt"];
    for (const name of testCompanyNames) {
      const companies = await db.company.findMany({
        where: { name: { equals: name } },
        include: { _count: { select: { packages: true, orders: true } } },
      });

      for (const company of companies) {
        // حذف الباقات المرتبطة أولاً
        await db.package.deleteMany({ where: { companyId: company.id } });
        await db.order.deleteMany({ where: { companyId: company.id } });
        await db.company.delete({ where: { id: company.id } });
        results.push(`✅ تم حذف شركة: ${name}`);
        deletedCount++;
      }
    }

    results.push(`\n🧹 تم حذف ${deletedCount} حساب تجريبي`);

    // ===== 3. تسجيل الحدث الأمني =====
    await logSecurityEvent({
      type: "SECURITY_SETUP_COMPLETED",
      severity: "HIGH",
      description: "تم إعداد الأمان: إنشاء أدمن جديد وحذف الحسابات التجريبية",
      metadata: JSON.stringify({ deletedCount }),
    });

    // ===== 4. الإحصائيات النهائية =====
    const stats = {
      users: await db.user.count(),
      companies: await db.company.count(),
      packages: await db.package.count(),
      orders: await db.order.count(),
    };

    return NextResponse.json({
      success: true,
      message: "تم إعداد الأمان بنجاح",
      results,
      newCredentials: {
        email: newAdminEmail,
        password: newAdminPassword,
        warning: "احفظ هذه البيانات! لن تظهر مرة أخرى.",
      },
      stats,
    });
  } catch (error: any) {
    console.error("Setup security error:", error);
    return NextResponse.json(
      { error: "حدث خطأ: " + error.message },
      { status: 500 }
    );
  }
}
