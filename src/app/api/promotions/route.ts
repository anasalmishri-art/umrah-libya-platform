import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET: list promotions
export async function GET() {
  try {
    const user = await getCurrentUser();
    const now = new Date().toISOString().slice(0, 10);

    // Public: only active promotions within date range
    if (!user || user.role !== "SUPER_ADMIN") {
      const promotions = await db.promotion.findMany({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ promotions });
    }

    // Admin: all promotions
    const promotions = await db.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("GET /api/promotions error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST: create promotion (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const promo = await db.promotion.create({
      data: {
        title: body.title,
        description: body.description || null,
        banner: body.banner || null,
        discountType: body.discountType || "PERCENTAGE",
        discountValue: parseFloat(body.discountValue) || 0,
        appliesTo: body.appliesTo || "ALL",
        packageId: body.packageId || null,
        companyId: body.companyId || null,
        startDate: body.startDate,
        endDate: body.endDate,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({ success: true, promotion: promo });
  } catch (error) {
    console.error("Create promotion error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// PUT: update promotion
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    const updateData: any = {};
    ["title", "description", "banner", "discountType", "appliesTo", "packageId", "companyId", "startDate", "endDate"].forEach((f) => {
      if (data[f] !== undefined) updateData[f] = data[f];
    });
    if (data.discountValue !== undefined) updateData.discountValue = parseFloat(data.discountValue);
    if (data.isActive !== undefined) updateData.isActive = !!data.isActive;

    const promo = await db.promotion.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, promotion: promo });
  } catch (error) {
    console.error("Update promotion error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// DELETE: delete promotion
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    await db.promotion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete promotion error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
