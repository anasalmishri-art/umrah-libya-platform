import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeText } from "@/lib/security";

// القائمة البيضاء للمفاتيح المسموح بتعديلها
const ALLOWED_SETTING_KEYS = new Set([
  "site_name", "site_tagline", "site_logo",
  "hero_badge", "hero_title", "hero_subtitle",
  "hero_cta_primary", "hero_cta_secondary",
  "stat_companies", "stat_companies_label",
  "stat_packages", "stat_packages_label",
  "stat_customers", "stat_customers_label",
  "stat_experience", "stat_experience_label",
  "why_title", "why_subtitle",
  "feature_1_title", "feature_1_desc",
  "feature_2_title", "feature_2_desc",
  "feature_3_title", "feature_3_desc",
  "feature_4_title", "feature_4_desc",
  "featured_companies_title", "featured_companies_subtitle",
  "promotions_title", "promotions_subtitle",
  "all_companies_title", "all_companies_subtitle",
  "cta_title", "cta_desc", "cta_button",
  "about_title", "about_desc",
  "about_mission_title", "about_mission_desc",
  "about_vision_title", "about_vision_desc",
  "contact_phone", "contact_whatsapp", "contact_email",
  "contact_address", "contact_hours",
  "footer_about", "footer_copyright",
  "whatsapp_number",
]);

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

    // التحقق من كل مفتاح وتنظيف القيمة
    for (const [key, value] of Object.entries(updates)) {
      // منع تعديل مفاتيح غير مصرح بها
      if (!ALLOWED_SETTING_KEYS.has(key)) {
        continue; // تجاهل المفاتيح غير المصرح بها
      }

      // تنظيف القيمة من XSS
      const cleanValue = sanitizeText(String(value), 5000);

      await db.setting.upsert({
        where: { key },
        update: { value: cleanValue },
        create: { key, value: cleanValue },
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
