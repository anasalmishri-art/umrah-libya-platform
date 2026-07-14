import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/audit-log";

/**
 * API لحذف شركة نهائياً (مع كل بياناتها)
 * - يحذف الباقات
 * - يحذف الطلبات
 * - يحذف الشركة
 * - يحذف المستخدم المرتبط
 *
 * يتطلب: أدمن مسجّل دخوله
 */
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json({ error: "معرف الشركة مطلوب" }, { status: 400 });
    }

    // ابحث عن الشركة
    const company = await db.company.findUnique({
      where: { id: companyId },
      include: {
        user: true,
        _count: {
          select: { packages: true, orders: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 });
    }

    const results: string[] = [];

    // ===== 1. حذف الباقات =====
    if (company._count.packages > 0) {
      await db.package.deleteMany({ where: { companyId } });
      results.push(`✅ تم حذف ${company._count.packages} باقة`);
    }

    // ===== 2. حذف الطلبات =====
    if (company._count.orders > 0) {
      await db.order.deleteMany({ where: { companyId } });
      results.push(`✅ تم حذف ${company._count.orders} طلب`);
    }

    // ===== 3. حذف الرسائل المرتبطة بالطلبات =====
    await db.message.deleteMany({
      where: { order: { companyId } },
    });

    // ===== 4. حذف الشركة =====
    await db.company.delete({ where: { id: companyId } });
    results.push(`✅ تم حذف الشركة: ${company.name}`);

    // ===== 5. حذف المستخدم المرتبط (إن وجد) =====
    if (company.user) {
      await db.user.delete({ where: { id: company.userId } });
      results.push(`✅ تم حذف حساب المستخدم: ${company.user.email}`);
    }

    // ===== تسجيل الحدث =====
    await logSecurityEvent({
      type: "COMPANY_DELETED",
      severity: "HIGH",
      userId: currentUser.id,
      description: `تم حذف الشركة: ${company.name} (${company.city})`,
    });

    return NextResponse.json({
      success: true,
      message: `تم حذف الشركة: ${company.name} نهائياً`,
      results,
    });
  } catch (error: any) {
    console.error("Delete company error:", error);
    return NextResponse.json(
      { error: "حدث خطأ: " + error.message },
      { status: 500 }
    );
  }
}
