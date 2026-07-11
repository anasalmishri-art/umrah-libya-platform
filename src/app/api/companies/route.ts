import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET: list all companies (admin only) or approved companies (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const user = await getCurrentUser();

    // Public: only approved companies
    if (!user || user.role !== "SUPER_ADMIN") {
      const where: any = { status: "APPROVED" };
      if (featured === "true") {
        where.isFeatured = true;
      }
      const companies = await db.company.findMany({
        where,
        include: {
          _count: { select: { packages: { where: { isActive: true } } } },
        },
        orderBy: featured === "true" ? { rating: "desc" } : { name: "asc" },
      });
      return NextResponse.json({ companies });
    }

    // Admin: can filter by status
    const where: any = {};
    if (status) where.status = status;
    if (featured === "true") where.isFeatured = true;
    const companies = await db.company.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, phone: true, name: true } },
        _count: { select: { packages: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ companies });
  } catch (error) {
    console.error("GET /api/companies error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
