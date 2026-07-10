import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database for Libyan market...");

  // Create super admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await db.user.upsert({
    where: { email: "admin@umrah.ly" },
    update: {
      password: adminPassword,
      name: "Super Admin",
      phone: "+218910000000",
      role: "SUPER_ADMIN",
    },
    create: {
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
  const companyUser = await db.user.upsert({
    where: { email: "company@umrah.ly" },
    update: {
      password: companyPassword,
      name: "شركة بيت الله للعمرة",
      phone: "+218912345678",
      role: "COMPANY",
    },
    create: {
      email: "company@umrah.ly",
      password: companyPassword,
      name: "شركة بيت الله للعمرة",
      phone: "+218912345678",
      role: "COMPANY",
    },
  });

  const company = await db.company.upsert({
    where: { userId: companyUser.id },
    update: {
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
    },
    create: {
      userId: companyUser.id,
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
    },
  });
  console.log("Sample company created:", company.name);

  // Create a sample pending company (Libyan - Benghazi)
  const pendingPassword = await bcrypt.hash("company123", 10);
  const pendingUser = await db.user.upsert({
    where: { email: "newcompany@umrah.ly" },
    update: {
      password: pendingPassword,
      name: "شركة الرحمن للعمرة",
      phone: "+218925555555",
      role: "COMPANY",
    },
    create: {
      email: "newcompany@umrah.ly",
      password: pendingPassword,
      name: "شركة الرحمن للعمرة",
      phone: "+218925555555",
      role: "COMPANY",
    },
  });

  const pendingCompany = await db.company.upsert({
    where: { userId: pendingUser.id },
    update: {
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
    create: {
      userId: pendingUser.id,
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
  });
  console.log("Pending company created:", pendingCompany.name);

  // Delete existing packages and recreate
  await db.package.deleteMany({ where: { companyId: company.id } });

  // Create sample packages (prices in Libyan Dinar - LYD)
  const pkg1 = await db.package.create({
    data: {
      companyId: company.id,
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
    },
  });

  const pkg2 = await db.package.create({
    data: {
      companyId: company.id,
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
    },
  });

  const pkg3 = await db.package.create({
    data: {
      companyId: company.id,
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
      companyId: company.id,
      title: "باقة عمرة عائلية - 12 يوم",
      description: "باقة مخصصة للعائلات تشمل غرف عائلية واسعة، برنامج متكامل للأطفال والكبار، نقل خاص بالحافلات المكييفة، ووجبات تناسب جميع أفراد الأسرة. رحلة من مصراتة إلى جدة.",
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
  console.log("Sample packages created:", pkg1.title, pkg2.title, pkg3.title, pkg4.title);

  // Delete existing promotions and recreate
  await db.promotion.deleteMany({});

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
    },
  });
  console.log("Sample promotion created:", promo.title);

  // Update site settings for Libyan market
  await db.setting.upsert({
    where: { key: "site_name" },
    update: { value: "منصة عمرة ليبيا" },
    create: { key: "site_name", value: "منصة عمرة ليبيا" },
  });
  await db.setting.upsert({
    where: { key: "whatsapp_number" },
    update: { value: "+218910000000" },
    create: { key: "whatsapp_number", value: "+218910000000" },
  });
  await db.setting.upsert({
    where: { key: "hero_title" },
    update: { value: "رحلتك إلى بيت الله الحرام تبدأ من ليبيا" },
    create: { key: "hero_title", value: "رحلتك إلى بيت الله الحرام تبدأ من ليبيا" },
  });
  await db.setting.upsert({
    where: { key: "hero_subtitle" },
    update: { value: "منصة ليبية متكاملة تجمع أفضل شركات العمرة لتقدم لك باقات متنوعة بأسعار تنافسية وخدمة متميزة" },
    create: { key: "hero_subtitle", value: "منصة ليبية متكاملة تجمع أفضل شركات العمرة لتقدم لك باقات متنوعة بأسعار تنافسية وخدمة متميزة" },
  });

  console.log("Seed completed successfully!");
  console.log("\n=== Login Credentials (Libyan Market) ===");
  console.log("Super Admin: admin@umrah.ly / admin123");
  console.log("Company: company@umrah.ly / company123");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
