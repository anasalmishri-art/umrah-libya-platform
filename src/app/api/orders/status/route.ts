import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST: change order status (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح. هذه الميزة للمسؤول فقط" }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, status } = body;
    // status: PAID | PENDING_PAYMENT | CANCELLED | COMPLETED

    if (!orderId || !status) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        package: { select: { title: true } },
        company: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
