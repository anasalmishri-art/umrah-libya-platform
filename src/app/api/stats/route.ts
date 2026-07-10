import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const [
      totalCompanies,
      pendingCompanies,
      approvedCompanies,
      totalPackages,
      totalOrders,
      pendingPaymentOrders,
      paidOrders,
      totalRevenue,
      totalCustomers,
      totalPromotions,
    ] = await Promise.all([
      db.company.count(),
      db.company.count({ where: { status: "PENDING" } }),
      db.company.count({ where: { status: "APPROVED" } }),
      db.package.count(),
      db.order.count(),
      db.order.count({ where: { status: "PENDING_PAYMENT" } }),
      db.order.count({ where: { status: "PAID" } }),
      db.order.aggregate({ _sum: { totalPrice: true }, where: { status: "PAID" } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.promotion.count(),
    ]);

    // Revenue by company
    const revenueByCompany = await db.order.groupBy({
      by: ["companyId"],
      where: { status: "PAID" },
      _sum: { totalPrice: true },
      _count: true,
    });

    const companies = await db.company.findMany({
      where: { id: { in: revenueByCompany.map((r) => r.companyId) } },
      select: { id: true, name: true },
    });

    const companyRevenue = revenueByCompany.map((r) => {
      const c = companies.find((c) => c.id === r.companyId);
      return {
        name: c?.name || "غير معروف",
        revenue: r._sum.totalPrice || 0,
        orders: r._count,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      totalCompanies,
      pendingCompanies,
      approvedCompanies,
      totalPackages,
      totalOrders,
      pendingPaymentOrders,
      paidOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalCustomers,
      totalPromotions,
      companyRevenue,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
