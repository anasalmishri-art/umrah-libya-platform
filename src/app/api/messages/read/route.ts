import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST: mark message as read
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ error: "معرف الرسالة مطلوب" }, { status: 400 });
    }

    const message = await db.message.findUnique({ where: { id: messageId } });
    if (!message) {
      return NextResponse.json({ error: "الرسالة غير موجودة" }, { status: 404 });
    }

    // Only the customer who owns the message can mark it as read
    if (user.role === "CUSTOMER" && message.customerId !== user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const updated = await db.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error("Mark message read error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
