import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// صفحة تشخيص - للتحقق من حالة قاعدة البيانات والاتصال
export async function GET() {
  const debug: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
  };

  // 1. التحقق من متغيرات البيئة
  debug.checks.env = {
    DATABASE_URL: process.env.DATABASE_URL ? "✅ موجود" : "❌ مفقود",
    JWT_SECRET: process.env.JWT_SECRET ? "✅ موجود" : "❌ مفقود",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✅ موجود" : "⚠️ مفقود (غير ضروري)",
  };

  // 2. التحقق من الاتصال بقاعدة البيانات
  try {
    // محاولة عد المستخدمين
    const userCount = await db.user.count();
    debug.checks.database = {
      status: "✅ متصل",
      users: userCount,
    };

    // عد الجداول الأخرى
    try {
      debug.checks.database.companies = await db.company.count();
      debug.checks.database.packages = await db.package.count();
      debug.checks.database.orders = await db.order.count();
      debug.checks.database.promotions = await db.promotion.count();
      debug.checks.database.settings = await db.setting.count();
      debug.checks.database.messages = await db.message.count();
    } catch (e: any) {
      debug.checks.database.tableError = e.message;
    }

    // 3. التحقق من وجود الأدمن
    const admin = await db.user.findUnique({ where: { email: "admin@umrah.ly" } });
    debug.checks.admin = admin ? "✅ موجود" : "❌ مفقود - شغّل /api/setup";

    // 4. التحقق من الشركات
    const companies = await db.company.findMany({ select: { name: true, status: true, city: true } });
    debug.checks.companies = companies;

  } catch (error: any) {
    debug.checks.database = {
      status: "❌ فشل الاتصال",
      error: error.message,
    };
  }

  // 5. التوصيات
  debug.recommendations = [];
  if (debug.checks.env.DATABASE_URL.includes("مفقود")) {
    debug.recommendations.push("أضف DATABASE_URL في إعدادات Vercel Environment Variables");
  }
  if (debug.checks.env.JWT_SECRET.includes("مفقود")) {
    debug.recommendations.push("أضف JWT_SECRET في إعدادات Vercel Environment Variables");
  }
  if (debug.checks.database?.status?.includes("فشل")) {
    debug.recommendations.push("تأكد من صحة رابط DATABASE_URL - يجب أن يكون PostgreSQL من Neon");
  }
  if (debug.checks.admin?.includes("مفقود")) {
    debug.recommendations.push("اذهب إلى /api/setup لتهيئة قاعدة البيانات");
  }
  if (debug.recommendations.length === 0) {
    debug.recommendations.push("✅ كل شيء يعمل بشكل صحيح!");
  }

  return NextResponse.json(debug, { status: 200 });
}
