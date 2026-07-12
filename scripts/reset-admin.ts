import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * سكريبت لإنشاء أدمن جديد بكلمة مرور قوية
 * وحذف الأدمن القديم والحسابات التجريبية
 */
async function main() {
  console.log("🔒 بدء عملية تحديث الحسابات...\n");

  // ===== 1. إنشاء أدمن جديد بكلمة مرور قوية =====
  const newAdminEmail = "admin@omrah.ly";
  const newAdminPassword = "Um4h-L1by4-@dm1n-2026!";

  // حذف الأدمن القديم إذا وجد
  await db.user.deleteMany({ where: { email: "admin@umrah.ly" } });

  const hashedPassword = await bcrypt.hash(newAdminPassword, 12);

  const newAdmin = await db.user.create({
    data: {
      email: newAdminEmail,
      password: hashedPassword,
      name: "مدير المنصة",
      phone: "+218910000000",
      role: "SUPER_ADMIN",
    },
  });

  console.log("✅ تم إنشاء حساب الأدمن الجديد:");
  console.log(`   📧 البريد: ${newAdminEmail}`);
  console.log(`   🔑 كلمة المرور: ${newAdminPassword}`);
  console.log(`   🆔 المعرف: ${newAdmin.id}\n`);

  // ===== 2. حذف الحسابات التجريبية =====
  console.log("🧹 حذف الحسابات التجريبية...");

  const testEmails = [
    "test@test.com",
    "test2@test.com",
    "test3@test.com",
    "test4@test.com",
    "test5@test.com",
    "hacker@hacker.com",
    "hackadmin@test.com",
    "xsstest@test.com",
    "weak@test.com",
    "ahmed.test@example.ly",
  ];

  for (const email of testEmails) {
    const deleted = await db.user.deleteMany({ where: { email } });
    if (deleted.count > 0) {
      console.log(`   ✅ تم حذف: ${email}`);
    }
  }

  // حذف الشركات التجريبية
  const testCompanyNames = ["test", "tt"];
  for (const name of testCompanyNames) {
    const deleted = await db.company.deleteMany({
      where: { name: { contains: name } },
    });
    if (deleted.count > 0) {
      console.log(`   ✅ تم حذف شركة: ${name}`);
    }
  }

  // ===== 3. عرض الإحصائيات النهائية =====
  console.log("\n📊 الإحصائيات النهائية:");
  const users = await db.user.count();
  const companies = await db.company.count();
  const packages = await db.package.count();
  const orders = await db.order.count();

  console.log(`   👥 المستخدمين: ${users}`);
  console.log(`   🏢 الشركات: ${companies}`);
  console.log(`   📦 الباقات: ${packages}`);
  console.log(`   🛒 الطلبات: ${orders}`);

  console.log("\n🎉 تم الانتهاء بنجاح!");
  console.log("\n========================================");
  console.log("🔐 بيانات الدخول الجديدة للأدمن:");
  console.log("========================================");
  console.log(`📧 البريد: ${newAdminEmail}`);
  console.log(`🔑 كلمة المرور: ${newAdminPassword}`);
  console.log("========================================");
  console.log("\n⚠️ احفظ هذه البيانات في مكان آمن!");
  console.log("⚠️ لن تتمكن من رؤية كلمة المرور مرة أخرى!");
}

main()
  .catch((e) => {
    console.error("❌ خطأ:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
