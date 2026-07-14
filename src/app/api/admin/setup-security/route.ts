import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logSecurityEvent } from "@/lib/audit-log";
import { getCurrentUser } from "@/lib/auth";

/**
 * API لإعداد الأمان الشامل:
 * - تغيير كلمة مرور الأدمن
 * - تغيير بريد الأدمن
 * - حذف الحسابات التجريبية
 * - حذف الشركات التجريبية
 *
 * يتطلب: أدمن مسجّل دخوله + كلمة المرور الحالية
 */
export async function POST(req: NextRequest) {
  try {
    // ===== التحقق من تسجيل الدخول =====
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح - يجب تسجيل الدخول كأدمن" }, { status: 403 });
    }

    const body = await req.json();
    const { currentPassword, newEmail, newPassword, action } = body;

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

    const results: string[] = [];

    // ===== الإجراء 1: تحديث بيانات الأدمن =====
    if (action === "update_admin" || action === "all") {
      const updateData: any = {};

      // تحديث البريد الإلكتروني
      if (newEmail && newEmail !== adminUser.email) {
        // التحقق من عدم تكرار البريد
        const existing = await db.user.findUnique({ where: { email: newEmail.toLowerCase() } });
        if (existing && existing.id !== adminUser.id) {
          return NextResponse.json(
            { error: "البريد الإلكتروني مستخدم بالفعل" },
            { status: 400 }
          );
        }
        updateData.email = newEmail.toLowerCase();
        results.push(`✅ تم تحديث البريد الإلكتروني إلى: ${newEmail}`);
      }

      // تحديث كلمة المرور
      if (newPassword && newPassword.length >= 8) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        updateData.password = hashedPassword;
        results.push("✅ تم تحديث كلمة المرور");
      }

      if (Object.keys(updateData).length > 0) {
        await db.user.update({
          where: { id: adminUser.id },
          data: updateData,
        });
      }
    }

    // ===== الإجراء 2: حذف الحسابات التجريبية =====
    if (action === "cleanup" || action === "all") {
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
        "newcompany@test.com",
        "company@umrah.ly",
        "safwa@umrah.ly",
        "newcompany@umrah.ly",
      ];

      let deletedUsersCount = 0;
      for (const email of testEmails) {
        try {
          // ابحث عن المستخدم
          const user = await db.user.findUnique({
            where: { email },
            include: { company: true },
          });

          if (user) {
            // إذا كان لديه شركة، احذف الشركة وباقاتها أولاً
            if (user.company) {
              await db.package.deleteMany({ where: { companyId: user.company.id } });
              await db.order.deleteMany({ where: { companyId: user.company.id } });
              await db.company.delete({ where: { id: user.company.id } });
              results.push(`✅ تم حذف شركة: ${user.company.name}`);
            }

            // احذف المستخدم
            await db.user.delete({ where: { id: user.id } });
            results.push(`✅ تم حذف مستخدم: ${email}`);
            deletedUsersCount++;
          }
        } catch (e: any) {
          // تجاهل الأخطاء (مثل القيود المرجعية)
          console.error(`Failed to delete ${email}:`, e.message);
        }
      }

      // ===== حذف الشركات التجريبية =====
      const testCompanyNames = ["test", "tt", "TEST", "Test"];
      for (const name of testCompanyNames) {
        try {
          const companies = await db.company.findMany({
            where: { name: { equals: name } },
          });

          for (const company of companies) {
            // حذف الباقات المرتبطة
            await db.package.deleteMany({ where: { companyId: company.id } });
            // حذف الطلبات المرتبطة
            await db.order.deleteMany({ where: { companyId: company.id } });
            // حذف الشركة
            await db.company.delete({ where: { id: company.id } });
            results.push(`✅ تم حذف شركة: ${name}`);
            deletedUsersCount++;
          }
        } catch (e: any) {
          console.error(`Failed to delete company ${name}:`, e.message);
        }
      }

      if (deletedUsersCount === 0) {
        results.push("ℹ️ لا توجد حسابات تجريبية للحذف");
      }
    }

    // ===== تسجيل الحدث الأمني =====
    await logSecurityEvent({
      type: "SECURITY_SETUP_COMPLETED",
      severity: "HIGH",
      userId: currentUser.id,
      description: `تم تنفيذ إجراء أمني: ${action}`,
      metadata: JSON.stringify({ results: results.length }),
    });

    // ===== الإحصائيات النهائية =====
    const stats = {
      users: await db.user.count(),
      companies: await db.company.count(),
      packages: await db.package.count(),
      orders: await db.order.count(),
    };

    return NextResponse.json({
      success: true,
      message: "تم تنفيذ الإجراء الأمني بنجاح",
      results,
      stats,
      updatedCredentials: newEmail || newPassword ? {
        email: newEmail || adminUser.email,
        password: newPassword || "(لم تتغير)",
        warning: "احفظ هذه البيانات! سجّل خروج ثم دخول بالبيانات الجديدة.",
      } : null,
    });
  } catch (error: any) {
    console.error("Setup security error:", error);
    return NextResponse.json(
      { error: "حدث خطأ: " + error.message },
      { status: 500 }
    );
  }
}
