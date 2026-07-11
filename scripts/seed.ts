import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database for Libyan market...");

  // Clean existing data
  await db.message.deleteMany();
  await db.order.deleteMany();
  await db.package.deleteMany();
  await db.promotion.deleteMany();
  await db.company.deleteMany();
  await db.user.deleteMany();
  await db.setting.deleteMany();

  // Create super admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await db.user.create({
    data: {
      email: "admin@umrah.ly",
      password: adminPassword,
      name: "Super Admin",
      phone: "+218910000000",
      role: "SUPER_ADMIN",
    },
  });
  console.log("Super admin created:", admin.email);

  // Create a sample approved company (Libyan)
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
          description: "شركة ليبية متخصصة في خدمات العمرة والحج منذ أكثر من 15 عاماً، نقدم باقات متنوعة تناسب جميع الاحتياجات بأسعار تنافسية وخدمة متميزة. نوفر رحلات جوية من مطار طرابلس الدولي ومطار معيتيقة.",
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
  console.log("Sample company created:", companyUser.company?.name);

  // Create a sample pending company (Libyan - Benghazi)
  const pendingPassword = await bcrypt.hash("company123", 10);
  const pendingUser = await db.user.create({
    data: {
      email: "newcompany@umrah.ly",
      password: pendingPassword,
      name: "شركة الرحمن للعمرة",
      phone: "+218925555555",
      role: "COMPANY",
      company: {
        create: {
          name: "شركة الرحمن للعمرة",
          description: "شركة ناشئة من بنغازي تقدم خدمات العمرة بأسعار منافسة وبرامج متكاملة.",
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
    include: { company: true },
  });
  console.log("Pending company created:", pendingUser.company?.name);

  // Create a third approved company (Misrata)
  const company3Password = await bcrypt.hash("company123", 10);
  const company3User = await db.user.create({
    data: {
      email: "safwa@umrah.ly",
      password: company3Password,
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
  console.log("Third company created:", company3User.company?.name);

  // Create sample packages (prices in Libyan Dinar - LYD)
  const pkg1 = await db.package.create({
    data: {
      companyId: companyUser.company!.id,
      title: "باقة عمرة اقتصادية - 7 أيام",
      description: "باقة عمرة اقتصادية تشمل الإقامة في فندق 3 نجوم على بعد 800 متر من الحرم، تذاكر الطيران ذهاب وعودة من طرابلس إلى جدة، نقل من وإلى المطار، جولات زيارة للأماكن المقدسة، وإشراف مرشد ديني متخصص.",
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
      features: JSON.stringify([
        "تذاكر طيران ذهاب وعودة (طرابلس - جدة)",
        "إقامة 6 ليالي فندق 3 نجوم",
        "نقل من وإلى المطار",
        "مرشد ديني متخصص",
        "جولات زيارة للأماكن المقدسة",
        "تأمين صحي",
      ]),
      isFeatured: true,
      featuredStatus: "APPROVED",
    },
  });

  const pkg2 = await db.package.create({
    data: {
      companyId: companyUser.company!.id,
      title: "باقة عمرة فاخرة - 10 أيام",
      description: "باقة فاخرة تشمل الإقامة في فندق 5 نجوم بإطلالة مباشرة على الحرم المكي الشريف، جميع الوجبات بوفيه مفتوح، تنقلات خاصة بسيارات حديثة، وبرنامج متكامل من الزيارات والأنشطة الدينية. رحلة جوية مريحة من طرابلس.",
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
      features: JSON.stringify([
        "تذاكر طيران درجة رجال الأعمال (طرابلس - جدة)",
        "إقامة 9 ليالي فندق 5 نجوم",
        "بوفيه مفتوح 3 وجبات يومياً",
        "نقل خاص VIP",
        "مرشد ديني متخصص",
        "جولات زيارة شاملة",
        "تأمين صحي شامل",
      ]),
      isFeatured: true,
      featuredStatus: "APPROVED",
    },
  });

  const pkg3 = await db.package.create({
    data: {
      companyId: companyUser.company!.id,
      title: "باقة عمرة رمضان - 15 يوم",
      description: "باقة خاصة لشهر رمضان المبارك، اعتكاف في الحرمين الشريفين، إقامة في فندق 4 نجوم قريب من الحرم، سحور وإفطار جماعي، وبرنامج دعوي متكامل. رحلة من طرابلس إلى جدة.",
      type: "RAMADAN",
      durationDays: 15,
      price: 24000,
      currency: "LYD",
      hotelStars: 4,
      hotelName: "فندق زهراء الافراح",
      includesTransport: true,
      includesMeals: true,
      includesGuide: true,
      includesZiyarat: true,
      departureDate: "2027-02-28",
      availableSeats: 25,
      features: JSON.stringify([
        "إقامة 14 ليلة فندق 4 نجوم",
        "إفطار وسحور جماعي",
        "نقل من وإلى المطار",
        "مرشد ديني متخصص",
        "اعتكاف في الحرم",
        "تأمين صحي",
      ]),
    },
  });

  const pkg4 = await db.package.create({
    data: {
      companyId: company3User.company!.id,
      title: "باقة عمرة عائلية - 12 يوم",
      description: "باقة مخصصة للعائلات تشمل غرف عائلية واسعة، برنامج متكامل للأطفال والكبار، نقل خاص بالحافلات المكيفة، ووجبات تناسب جميع أفراد الأسرة. رحلة من مصراتة إلى جدة.",
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
      features: JSON.stringify([
        "تذاكر طيران (مصراتة - جدة)",
        "غرف عائلية واسعة",
        "وجبات تناسب العائلة",
        "نقل بالحافلات المكيفة",
        "مرشد ديني متخصص",
        "برنامج للأطفال",
      ]),
    },
  });

  const pkg5 = await db.package.create({
    data: {
      companyId: company3User.company!.id,
      title: "باقة عمرة قصيرة - 5 أيام",
      description: "باقة قصيرة ومركزة لأداء العمرة في وقت قياسي، مثالية للمشغولين. تشمل الإقامة في فندق 3 نجوم، تذاكر الطيران، النقل، ومرشد ديني.",
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
      features: JSON.stringify([
        "تذاكر طيران (مصراتة - جدة)",
        "إقامة 4 ليالي فندق 3 نجوم",
        "نقل من وإلى المطار",
        "مرشد ديني",
        "جولات زيارة سريعة",
      ]),
    },
  });
  console.log("Sample packages created:", pkg1.title, pkg2.title, pkg3.title, pkg4.title, pkg5.title);

  // Create sample promotion (approved)
  const promo = await db.promotion.create({
    data: {
      title: "عرض رمضان الكريم - خصم 15%",
      description: "خصم 15% على جميع باقات العمرة لشهر رمضان المبارك. عرض لفترة محدودة! احجز الآن وضمن مقعدك.",
      discountType: "PERCENTAGE",
      discountValue: 15,
      appliesTo: "ALL",
      startDate: "2026-07-01",
      endDate: "2026-08-31",
      isActive: true,
      status: "APPROVED",
    },
  });
  console.log("Sample promotion created:", promo.title);

  // ============= CMS Settings (all editable content) =============
  const settings = [
    // Brand
    { key: "site_name", value: "منصة عمرة ليبيا" },
    { key: "site_logo", value: "" },
    { key: "site_tagline", value: "رحلتك إلى بيت الله الحرام تبدأ من ليبيا" },
    // Hero
    { key: "hero_title", value: "رحلتك إلى بيت الله الحرام تبدأ من ليبيا" },
    { key: "hero_subtitle", value: "منصة ليبية متكاملة تجمع أفضل شركات العمرة لتقدم لك باقات متنوعة بأسعار تنافسية وخدمة متميزة" },
    { key: "hero_badge", value: "منصة عمرة ليبيا المعتمدة" },
    { key: "hero_cta_primary", value: "تصفّح الشركات" },
    { key: "hero_cta_secondary", value: "العروض الحالية" },
    // Stats
    { key: "stat_companies", value: "50+" },
    { key: "stat_companies_label", value: "شركة معتمدة" },
    { key: "stat_packages", value: "200+" },
    { key: "stat_packages_label", value: "باقة متاحة" },
    { key: "stat_customers", value: "10,000+" },
    { key: "stat_customers_label", value: "عميل سعيد" },
    { key: "stat_experience", value: "15+" },
    { key: "stat_experience_label", value: "سنة خبرة" },
    // Why choose us
    { key: "why_title", value: "لماذا تختار منصة عمرة؟" },
    { key: "why_subtitle", value: "نوفّر لك تجربة عمرة متكاملة وآمنة من البداية حتى النهاية" },
    { key: "feature_1_title", value: "شركات موثوقة" },
    { key: "feature_1_desc", value: "جميع الشركات معتمدة ومرخّصة، يتم التحقق منها قبل انضمامها للمنصة" },
    { key: "feature_2_title", value: "أسعار تنافسية" },
    { key: "feature_2_desc", value: "قارن بين باقات متعددة من شركات مختلفة واختر الأنسب لميزانيتك" },
    { key: "feature_3_title", value: "حجز سريع" },
    { key: "feature_3_desc", value: "احجز باقتك خلال دقائق عبر واتساب وأكمل إجراءات الدفع بسهولة" },
    { key: "feature_4_title", value: "خدمة متميزة" },
    { key: "feature_4_desc", value: "إشراف ديني متخصص ومرشدون ذوو خبرة لضمان رحلة مريحة ومباركة" },
    // Featured sections
    { key: "featured_companies_title", value: "شركات مميزة" },
    { key: "featured_companies_subtitle", value: "شركات مختارة بعناية وموصى بها" },
    { key: "promotions_title", value: "العروض الحالية" },
    { key: "promotions_subtitle", value: "استفد من أفضل عروض العمرة المتاحة الآن" },
    { key: "all_companies_title", value: "كل الشركات" },
    { key: "all_companies_subtitle", value: "تصفح جميع شركات العمرة المسجلة في المنصة" },
    // CTA
    { key: "cta_title", value: "هل أنت شركة عمرة؟" },
    { key: "cta_desc", value: "انضم إلى منصتنا واصنع حضوراً رقمياً قوياً. سجّل شركتك الآن وابدأ بعرض باقاتك على آلاف العملاء." },
    { key: "cta_button", value: "سجّل شركتك الآن" },
    // About
    { key: "about_title", value: "من نحن" },
    { key: "about_desc", value: "منصة عمرة هي أول منصة إلكترونية متكاملة في ليبيا متخصصة في تجميع شركات العمرة المعتمدة تحت مظلة واحدة، لتسهيل عملية البحث والحجز على العملاء." },
    { key: "about_mission_title", value: "رسالتنا" },
    { key: "about_mission_desc", value: "تسهيل رحلة العمرة على المسلمين من خلال توفير منصة موحدة تعرض أفضل باقات العمرة من شركات معتمدة، مع ضمان الشفافية في الأسعار وجودة الخدمة، ليتمكن كل مسلم من أداء عمرته بكل يسر وسهولة." },
    { key: "about_vision_title", value: "رؤيتنا" },
    { key: "about_vision_desc", value: "أن نكون المنصة الأولى عربياً وإسلامياً في خدمات العمرة والحج، عبر تبني أحدث التقنيات الرقمية وتوسيع شبكة شركائنا من شركات العمرة المعتمدة في مختلف الدول، خدمةً لضيوف الرحمن." },
    // Contact
    { key: "contact_phone", value: "+218 91 000 0000" },
    { key: "contact_whatsapp", value: "+218 91 000 0000" },
    { key: "contact_email", value: "info@umrah-platform.ly" },
    { key: "contact_address", value: "طرابلس، ليبيا" },
    { key: "contact_hours", value: "السبت - الخميس: 9 صباحاً - 9 مساءً" },
    // Footer
    { key: "footer_about", value: "منصة متكاملة تجمع أفضل شركات العمرة المعتمدة لتقدم لك باقات متنوعة بأسعار تنافسية وخدمة متميزة." },
    { key: "footer_copyright", value: "© 2026 منصة عمرة ليبيا. جميع الحقوق محفوظة." },
    // WhatsApp
    { key: "whatsapp_number", value: "+218910000000" },
  ];

  for (const s of settings) {
    await db.setting.create({ data: s });
  }
  console.log("CMS settings created:", settings.length, "settings");

  console.log("\n=== Seed completed successfully! ===");
  console.log("\n=== Login Credentials (Libyan Market) ===");
  console.log("Super Admin: admin@umrah.ly / admin123");
  console.log("Company (Tripoli): company@umrah.ly / company123");
  console.log("Company (Misrata): safwa@umrah.ly / company123");
  console.log("Pending Company: newcompany@umrah.ly / company123");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
