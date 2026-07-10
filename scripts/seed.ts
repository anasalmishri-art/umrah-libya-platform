import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Create super admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await db.user.upsert({
    where: { email: "admin@umrah.com" },
    update: {},
    create: {
      email: "admin@umrah.com",
      password: adminPassword,
      name: "Super Admin",
      phone: "+966500000000",
      role: "SUPER_ADMIN",
    },
  });
  console.log("Super admin created:", admin.email);

  // Create a sample approved company
  const companyPassword = await bcrypt.hash("company123", 10);
  const companyUser = await db.user.upsert({
    where: { email: "company@umrah.com" },
    update: {},
    create: {
      email: "company@umrah.com",
      password: companyPassword,
      name: "شركة بيت الله للعمرة",
      phone: "+966512345678",
      role: "COMPANY",
    },
  });

  const company = await db.company.upsert({
    where: { userId: companyUser.id },
    update: {},
    create: {
      userId: companyUser.id,
      name: "شركة بيت الله للعمرة",
      description: "شركة متخصصة في خدمات العمرة والحج منذ أكثر من 15 عاماً، نقدم باقات متنوعة تناسب جميع الاحتياجات بأسعار تنافسية وخدمة متميزة.",
      licenseNumber: "UMR-2024-001",
      phone: "+966512345678",
      whatsapp: "+966512345678",
      email: "info@baytullah.com",
      address: "حي العزيزية، مكة المكرمة",
      city: "مكة المكرمة",
      country: "السعودية",
      status: "APPROVED",
      rating: 4.7,
    },
  });
  console.log("Sample company created:", company.name);

  // Create a sample pending company
  const pendingPassword = await bcrypt.hash("company123", 10);
  const pendingUser = await db.user.upsert({
    where: { email: "newcompany@umrah.com" },
    update: {},
    create: {
      email: "newcompany@umrah.com",
      password: pendingPassword,
      name: "شركة الرحمن للعمرة",
      phone: "+966555555555",
      role: "COMPANY",
    },
  });

  const pendingCompany = await db.company.upsert({
    where: { userId: pendingUser.id },
    update: {},
    create: {
      userId: pendingUser.id,
      name: "شركة الرحمن للعمرة",
      description: "شركة ناشئة تقدم خدمات العمرة بأسعار منافسة.",
      licenseNumber: "UMR-2024-002",
      phone: "+966555555555",
      whatsapp: "+966555555555",
      email: "info@rahman.com",
      address: "حي النزهة، جدة",
      city: "جدة",
      country: "السعودية",
      status: "PENDING",
    },
  });
  console.log("Pending company created:", pendingCompany.name);

  // Create sample packages
  const pkg1 = await db.package.create({
    data: {
      companyId: company.id,
      title: "باقة عمرة اقتصادية - 7 أيام",
      description: "باقة عمرة اقتصادية تشمل الإقامة في فندق 3 نجوم على بعد 800 متر من الحرم، تذاكر الطيران ذهاب وعودة، نقل من وإلى المطار، جولات زيارة للأماكن المقدسة، وإشراف مرشد ديني متخصص.",
      type: "UMRAH",
      durationDays: 7,
      price: 2500,
      oldPrice: 3000,
      hotelStars: 3,
      hotelName: "فندق العزيزية بلازا",
      includesTransport: true,
      includesMeals: false,
      includesGuide: true,
      includesZiyarat: true,
      departureDate: "2026-08-15",
      availableSeats: 50,
      features: JSON.stringify(["تذاكر طيران ذهاب وعودة", "إقامة 6 ليالي فندق 3 نجوم", "نقل مطار", "مرشد ديني", "جولات زيارة"]),
      isFeatured: true,
    },
  });

  const pkg2 = await db.package.create({
    data: {
      companyId: company.id,
      title: "باقة عمرة فاخرة - 10 أيام",
      description: "باقة فاخرة تشمل الإقامة في فندق 5 نجوم بإطلالة مباشرة على الحرم المكي الشريف، جميع الوجبات بوفيه مفتوح، تنقلات خاصة بسيارات حديثة، وبرنامج متكامل من الزيارات والأنشطة الدينية.",
      type: "UMRAH",
      durationDays: 10,
      price: 6500,
      oldPrice: 7500,
      hotelStars: 5,
      hotelName: "فندق مكة هيلتون",
      includesTransport: true,
      includesMeals: true,
      includesGuide: true,
      includesZiyarat: true,
      departureDate: "2026-08-20",
      availableSeats: 30,
      features: JSON.stringify(["تذاكر طيران درجة رجال أعمال", "إقامة 9 ليالي فندق 5 نجوم", "بوفيه مفتوح 3 وجبات", "نقل خاص VIP", "مرشد ديني متخصص", "جولات زيارة"]),
      isFeatured: true,
    },
  });

  const pkg3 = await db.package.create({
    data: {
      companyId: company.id,
      title: "باقة عمرة رمضان - 15 يوم",
      description: "باقة خاصة لشهر رمضان المبارك، اعتكاف في الحرمين الشريفين، إقامة في فندق 4 نجوم قريب من الحرم، سحور وإفطار جماعي، وبرنامج دعوي متكامل.",
      type: "RAMADAN",
      durationDays: 15,
      price: 8500,
      hotelStars: 4,
      hotelName: "فندق زهراء الافراح",
      includesTransport: true,
      includesMeals: true,
      includesGuide: true,
      includesZiyarat: true,
      departureDate: "2027-02-28",
      availableSeats: 25,
      features: JSON.stringify(["إقامة 14 ليلة فندق 4 نجوم", "إفطار وسحور جماعي", "نقل مطار", "مرشد ديني", "اعتكاف في الحرم"]),
    },
  });
  console.log("Sample packages created:", pkg1.title, pkg2.title, pkg3.title);

  // Create sample promotion
  const promo = await db.promotion.create({
    data: {
      title: "عرض رمضان الكريم - خصم 15%",
      description: "خصم 15% على جميع باقات العمرة لشهر رمضان المبارك. عرض لفترة محدودة!",
      discountType: "PERCENTAGE",
      discountValue: 15,
      appliesTo: "ALL",
      startDate: "2026-07-01",
      endDate: "2026-08-31",
      isActive: true,
    },
  });
  console.log("Sample promotion created:", promo.title);

  // Create site settings
  await db.setting.upsert({
    where: { key: "site_name" },
    update: {},
    create: { key: "site_name", value: "منصة عمرة" },
  });
  await db.setting.upsert({
    where: { key: "whatsapp_number" },
    update: {},
    create: { key: "whatsapp_number", value: "+966500000000" },
  });
  await db.setting.upsert({
    where: { key: "hero_title" },
    update: {},
    create: { key: "hero_title", value: "رحلتك إلى بيت الله الحرام تبدأ من هنا" },
  });
  await db.setting.upsert({
    where: { key: "hero_subtitle" },
    update: {},
    create: { key: "hero_subtitle", value: "منصة متكاملة تجمع أفضل شركات العمرة لتقدم لك باقات متنوعة بأسعار تنافسية وخدمة متميزة" },
  });

  console.log("Seed completed successfully!");
  console.log("\n=== Login Credentials ===");
  console.log("Super Admin: admin@umrah.com / admin123");
  console.log("Company: company@umrah.com / company123");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
