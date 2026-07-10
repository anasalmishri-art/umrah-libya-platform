import { db } from "@/lib/db";

async function cleanDb() {
  console.log("Cleaning database...");
  await db.order.deleteMany();
  await db.package.deleteMany();
  await db.promotion.deleteMany();
  await db.company.deleteMany();
  await db.user.deleteMany({ where: { role: { not: "SUPER_ADMIN" } } });
  // Keep super admin
  await db.setting.deleteMany();
  console.log("Database cleaned.");
}

cleanDb()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
