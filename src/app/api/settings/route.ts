import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET: get all settings (public)
export async function GET() {
  try {
    const settings = await db.setting.findMany();
    const obj: Record<string, string> = {};
    settings.forEach((s) => (obj[s.key] = s.value));
    return NextResponse.json({ settings: obj });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ settings: {} });
  }
}

// PUT: update settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const updates = body.settings || body;

    for (const [key, value] of Object.entries(updates)) {
      await db.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// DELETE: delete a setting (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json({ error: "المفتاح مطلوب" }, { status: 400 });

    await db.setting.deleteMany({ where: { key } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete setting error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
