import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET: list all companies (admin only) or approved companies (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const user = await getCurrentUser();

    // Public: only approved companies
    if (!user || user.role !== "SUPER_ADMIN") {
      const companies = await db.company.findMany({
        where: { status: "APPROVED" },
        include: {
          _count: { select: { packages: { where: { isActive: true } } } },
        },
        orderBy: { rating: "desc" },
      });
      return NextResponse.json({ companies });
    }

    // Admin: can filter by status
    const where = status ? { status } : {};
    const companies = await db.company.findMany({
      where,
      include: {
        user: { select: { email: true, phone: true } },
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
