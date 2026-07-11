import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST: approve/reject a promotion (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { promotionId, action } = body;
    // action: APPROVE | REJECT

    if (!promotionId || !action) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const promo = await db.promotion.update({
      where: { id: promotionId },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, promotion: promo });
  } catch (error) {
    console.error("Approve promotion error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
