import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET: list messages for the current customer
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ messages: [] });
    }

    // Customers see their messages; admins and companies can see all
    let where: any = {};
    if (user.role === "CUSTOMER") {
      where.customerId = user.id;
    } else if (user.role === "SUPER_ADMIN") {
      // all messages
    } else {
      // Company: messages for orders on their packages
      where.order = { companyId: user.company?.id };
    }

    const messages = await db.message.findMany({
      where,
      include: {
        order: {
          select: { orderNumber: true, package: { select: { title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
