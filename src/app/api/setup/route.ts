import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// صفحة إعداد قاعدة البيانات - تعمل مرة واحدة فقط
export async function GET(req: NextRequest) {
  const results: string[] = [];

  try {
    // 1. إنشاء الأدمن
    results.push("🔵 بدء تهيئة قاعدة البيانات...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const existingAdmin = await db.user.findUnique({ where: { email: "admin@umrah.ly" } });

    if (!existingAdmin) {
      await db.user.create({
        data: {
          email: "admin@umrah.ly",
          password: adminPassword,
          name: "Super Admin",
          phone: "+218910000000",
          role: "SUPER_ADMIN",
        },
      });
      results.push("✅ تم إنشاء حساب الأدمن: admin@umrah.ly / admin123");
    } else {
      results.push("ℹ️ حساب الأدمن موجود بالفعل");
    }

    // 2. إنشاء شركة طرابلس
    const existingCompany1 = await db.user.findUnique({ where: { email: "company@umrah.ly" } });
    if (!existingCompany1) {
      const companyPassword = await bcrypt.hash("company123", 10);
      const companyUser = await db.user.create({
        data: {
          email: "company@umrah.ly",
          password: companyPassword,
          name: "شركة بيت الله للعمرة",
          phone: "+218912345678",
          role: "COMPANY",
          company: {
            create: {
              name: "شركة بيت الله للعمرة",
              description: "شركة ليبية متخصصة في خدمات العمرة والحج منذ أكثر من 15 عاماً. نوفر رحلات جوية من مطار طرابلس الدولي ومطار معيتيقة.",
              licenseNumber: "UMR-LY-2024-001",
              phone: "+218912345678",
              whatsapp: "+218912345678",
              email: "info@baytullah.ly",
              address: "شارع الجمهورية، وسط المدينة",
              city: "طرابلس",
              country: "ليبيا",
              status: "APPROVED",
              rating: 4.7,
              isFeatured: true,
              featuredStatus: "APPROVED",
            },
          },
        },
        include: { company: true },
      });

      // إضافة باقات لشركة طرابلس
      await db.package.createMany({
        data: [
          {
            companyId: companyUser.company!.id,
            title: "باقة عمرة اقتصادية - 7 أيام",
            description: "باقة عمرة اقتصادية تشمل الإقامة في فندق 3 نجوم، تذاكر الطيران من طرابلس، النقل، والمرشد الديني.",
            type: "UMRAH",
            durationDays: 7,
            price: 8500,
            oldPrice: 10000,
            currency: "LYD",
            hotelStars: 3,
            hotelName: "فندق العزيزية بلازا",
            includesTransport: true,
            includesMeals: false,
            includesGuide: true,
            includesZiyarat: true,
            departureDate: "2026-08-15",
            availableSeats: 50,
            features: JSON.stringify(["تذاكر طيران", "إقامة 6 ليالي", "نقل مطار", "مرشد ديني", "تأمين صحي"]),
            isFeatured: true,
            featuredStatus: "APPROVED",
          },
          {
            companyId: companyUser.company!.id,
            title: "باقة عمرة فاخرة - 10 أيام",
            description: "باقة فاخرة مع فندق 5 نجوم بإطلالة على الحرم، بوفيه مفتوح، ونقل VIP من طرابلس.",
            type: "UMRAH",
            durationDays: 10,
            price: 18500,
            oldPrice: 22000,
            currency: "LYD",
            hotelStars: 5,
            hotelName: "فندق مكة هيلتون",
            includesTransport: true,
            includesMeals: true,
            includesGuide: true,
            includesZiyarat: true,
            departureDate: "2026-08-20",
            availableSeats: 30,
            features: JSON.stringify(["درجة رجال أعمال", "فندق 5 نجوم", "بوفيه مفتوح", "نقل VIP", "تأمين شامل"]),
            isFeatured: true,
            featuredStatus: "APPROVED",
          },
        ],
      });
      results.push("✅ تم إنشاء شركة بيت الله للعمرة (طرابلس) مع باقتين");
    } else {
      results.push("ℹ️ شركة طرابلس موجودة بالفعل");
    }

    // 3. إنشاء شركة مصراتة
    const existingCompany2 = await db.user.findUnique({ where: { email: "safwa@umrah.ly" } });
    if (!existingCompany2) {
      const company2Password = await bcrypt.hash("company123", 10);
      const company2User = await db.user.create({
        data: {
          email: "safwa@umrah.ly",
          password: company2Password,
          name: "شركة الصفوة للعمرة",
          phone: "+218913456789",
          role: "COMPANY",
          company: {
            create: {
              name: "شركة الصفوة للعمرة",
              description: "شركة مصراتية متخصصة في رحلات العمرة والحج، نوفر باقات عائلية وفردية بأفضل الأسعار.",
              licenseNumber: "UMR-LY-2024-003",
              phone: "+218913456789",
              whatsapp: "+218913456789",
              email: "info@safwa.ly",
              address: "شارع طرابلس، مصراتة",
              city: "مصراتة",
              country: "ليبيا",
              status: "APPROVED",
              rating: 4.5,
            },
          },
        },
        include: { company: true },
      });

      await db.package.createMany({
        data: [
          {
            companyId: company2User.company!.id,
            title: "باقة عمرة عائلية - 12 يوم",
            description: "باقة مخصصة للعائلات تشمل غرف عائلية واسعة وبرنامج متكامل من مصراتة.",
            type: "UMRAH",
            durationDays: 12,
            price: 14500,
            oldPrice: 17000,
            currency: "LYD",
            hotelStars: 4,
            hotelName: "فندق الدار البيضاء",
            includesTransport: true,
            includesMeals: true,
            includesGuide: true,
            includesZiyarat: true,
            departureDate: "2026-09-10",
            availableSeats: 40,
            features: JSON.stringify(["غرف عائلية", "وجبات", "نقل مكيف", "مرشد", "برنامج أطفال"]),
          },
          {
            companyId: company2User.company!.id,
            title: "باقة عمرة قصيرة - 5 أيام",
            description: "باقة قصيرة ومركزة لأداء العمرة في وقت قياسي.",
            type: "UMRAH",
            durationDays: 5,
            price: 6500,
            currency: "LYD",
            hotelStars: 3,
            hotelName: "فندق الاستقامة",
            includesTransport: true,
            includesMeals: false,
            includesGuide: true,
            includesZiyarat: true,
            departureDate: "2026-10-05",
            availableSeats: 35,
            features: JSON.stringify(["تذاكر طيران", "إقامة 4 ليالي", "نقل مطار", "مرشد"]),
          },
        ],
      });
      results.push("✅ تم إنشاء شركة الصفوة للعمرة (مصراتة) مع باقتين");
    } else {
      results.push("ℹ️ شركة مصراتة موجودة بالفعل");
    }

    // 4. إنشاء شركة قيد المراجعة
    const existingCompany3 = await db.user.findUnique({ where: { email: "newcompany@umrah.ly" } });
    if (!existingCompany3) {
      const pendingPassword = await bcrypt.hash("company123", 10);
      await db.user.create({
        data: {
          email: "newcompany@umrah.ly",
          password: pendingPassword,
          name: "شركة الرحمن للعمرة",
          phone: "+218925555555",
          role: "COMPANY",
          company: {
            create: {
              name: "شركة الرحمن للعمرة",
              description: "شركة ناشئة من بنغازي تقدم خدمات العمرة بأسعار منافسة.",
              licenseNumber: "UMR-LY-2024-002",
              phone: "+218925555555",
              whatsapp: "+218925555555",
              email: "info@rahman.ly",
              address: "شارع جمال عبد الناصر، بنغازي",
              city: "بنغازي",
              country: "ليبيا",
              status: "PENDING",
            },
          },
        },
      });
      results.push("✅ تم إنشاء شركة الرحمن للعمرة (بنغازي - قيد المراجعة)");
    } else {
      results.push("ℹ️ شركة بنغازي موجودة بالفعل");
    }

    // 5. إنشاء عرض ترويجي
    const existingPromo = await db.promotion.findFirst({ where: { title: "عرض رمضان الكريم - خصم 15%" } });
    if (!existingPromo) {
      await db.promotion.create({
        data: {
          title: "عرض رمضان الكريم - خصم 15%",
          description: "خصم 15% على جميع باقات العمرة لشهر رمضان المبارك. احجز الآن!",
          discountType: "PERCENTAGE",
          discountValue: 15,
          appliesTo: "ALL",
          startDate: "2026-07-01",
          endDate: "2026-08-31",
          isActive: true,
          status: "APPROVED",
        },
      });
      results.push("✅ تم إنشاء عرض رمضان الكريم");
    } else {
      results.push("ℹ️ العرض الترويجي موجود بالفعل");
    }

    // 6. إنشاء إعدادات الموقع
    const settingsCount = await db.setting.count();
    if (settingsCount === 0) {
      const settings = [
        { key: "site_name", value: "منصة عمرة ليبيا" },
        { key: "site_tagline", value: "رحلتك إلى بيت الله الحرام تبدأ من ليبيا" },
        { key: "site_logo", value: "" },
        { key: "hero_badge", value: "منصة عمرة ليبيا المعتمدة" },
        { key: "hero_title", value: "رحلتك إلى بيت الله الحرام تبدأ من ليبيا" },
        { key: "hero_subtitle", value: "منصة ليبية متكاملة تجمع أفضل شركات العمرة لتقدم لك باقات متنوعة بأسعار تنافسية وخدمة متميزة" },
        { key: "hero_cta_primary", value: "تصفّح الشركات" },
        { key: "hero_cta_secondary", value: "العروض الحالية" },
        { key: "stat_companies", value: "50+" },
        { key: "stat_companies_label", value: "شركة معتمدة" },
        { key: "stat_packages", value: "200+" },
        { key: "stat_packages_label", value: "باقة متاحة" },
        { key: "stat_customers", value: "10,000+" },
        { key: "stat_customers_label", value: "عميل سعيد" },
        { key: "stat_experience", value: "15+" },
        { key: "stat_experience_label", value: "سنة خبرة" },
        { key: "why_title", value: "لماذا تختار منصة عمرة؟" },
        { key: "why_subtitle", value: "نوفّر لك تجربة عمرة متكاملة وآمنة" },
        { key: "feature_1_title", value: "شركات موثوقة" },
        { key: "feature_1_desc", value: "جميع الشركات معتمدة ومرخّصة" },
        { key: "feature_2_title", value: "أسعار تنافسية" },
        { key: "feature_2_desc", value: "قارن بين باقات متعددة" },
        { key: "feature_3_title", value: "حجز سريع" },
        { key: "feature_3_desc", value: "احجز باقتك خلال دقائق" },
        { key: "feature_4_title", value: "خدمة متميزة" },
        { key: "feature_4_desc", value: "إشراف ديني متخصص" },
        { key: "featured_companies_title", value: "شركات مميزة" },
        { key: "featured_companies_subtitle", value: "شركات مختارة بعناية" },
        { key: "promotions_title", value: "العروض الحالية" },
        { key: "promotions_subtitle", value: "استفد من أفضل العروض" },
        { key: "all_companies_title", value: "كل الشركات" },
        { key: "all_companies_subtitle", value: "تصفح جميع شركات العمرة" },
        { key: "cta_title", value: "هل أنت شركة عمرة؟" },
        { key: "cta_desc", value: "انضم إلى منصتنا وابدأ بعرض باقاتك." },
        { key: "cta_button", value: "سجّل شركتك الآن" },
        { key: "about_title", value: "من نحن" },
        { key: "about_desc", value: "منصة عمرة هي أول منصة إلكترونية متكاملة في ليبيا متخصصة في تجميع شركات العمرة." },
        { key: "about_mission_title", value: "رسالتنا" },
        { key: "about_mission_desc", value: "تسهيل رحلة العمرة على المسلمين." },
        { key: "about_vision_title", value: "رؤيتنا" },
        { key: "about_vision_desc", value: "أن نكون المنصة الأولى عربياً وإسلامياً." },
        { key: "contact_phone", value: "+218 91 000 0000" },
        { key: "contact_whatsapp", value: "+218 91 000 0000" },
        { key: "contact_email", value: "info@umrah-platform.ly" },
        { key: "contact_address", value: "طرابلس، ليبيا" },
        { key: "contact_hours", value: "السبت - الخميس: 9ص - 9م" },
        { key: "footer_about", value: "منصة متكاملة لخدمات العمرة في ليبيا." },
        { key: "footer_copyright", value: "© 2026 منصة عمرة ليبيا" },
        { key: "whatsapp_number", value: "+218910000000" },
      ];

      for (const s of settings) {
        await db.setting.upsert({
          where: { key: s.key },
          update: {},
          create: s,
        });
      }
      results.push(`✅ تم إنشاء ${settings.length} إعداد للموقع`);
    } else {
      results.push(`ℹ️ إعدادات الموقع موجودة (${settingsCount} إعداد)`);
    }

    results.push("");
    results.push("🎉 تمت تهيئة قاعدة البيانات بنجاح!");
    results.push("");
    results.push("=== بيانات الدخول ===");
    results.push("الأدمن: admin@umrah.ly / admin123");
    results.push("شركة طرابلس: company@umrah.ly / company123");
    results.push("شركة مصراتة: safwa@umrah.ly / company123");
    results.push("شركة بنغازي: newcompany@umrah.ly / company123");

    return NextResponse.json({
      success: true,
      message: "تمت التهيئة بنجاح",
      results,
    });
  } catch (error: any) {
    results.push(`❌ خطأ: ${error.message}`);
    console.error("Setup error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      results,
    }, { status: 500 });
  }
}
