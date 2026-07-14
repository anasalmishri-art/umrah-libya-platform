import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET: عرض سجل محاولات الدخول (للأدمن فقط)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // login_attempts | security_events
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    if (type === "security_events") {
      const [events, total] = await Promise.all([
        db.securityEvent.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        db.securityEvent.count(),
      ]);

      return NextResponse.json({
        events,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // افتراضياً: محاولات الدخول
    const [attempts, total] = await Promise.all([
      db.loginAttempt.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      db.loginAttempt.count(),
    ]);

    return NextResponse.json({
      attempts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Audit log error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
