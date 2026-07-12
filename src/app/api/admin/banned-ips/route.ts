import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { banIPManually, unbanIP } from "@/lib/audit-log";

// GET: قائمة الـ IPs المحظورة
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const bannedIPs = await db.bannedIP.findMany({
      orderBy: { bannedUntil: "desc" },
    });

    return NextResponse.json({ bannedIPs });
  } catch (error) {
    console.error("Get banned IPs error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST: حظر/إلغاء حظر IP
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { action, ip, reason, duration } = body;

    if (!ip) {
      return NextResponse.json({ error: "IP مطلوب" }, { status: 400 });
    }

    if (action === "ban") {
      if (!reason || !duration) {
        return NextResponse.json({ error: "السبب والمدة مطلوبان" }, { status: 400 });
      }
      await banIPManually(ip, reason, duration);
      return NextResponse.json({ success: true, message: "تم حظر IP" });
    }

    if (action === "unban") {
      await unbanIP(ip);
      return NextResponse.json({ success: true, message: "تم إلغاء حظر IP" });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("Ban/unban IP error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
