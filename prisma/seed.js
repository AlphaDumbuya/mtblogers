require("dotenv").config({ path: ".env.local", override: true });
require("dotenv").config({ path: ".env" });

const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("🌱 Seeding...");

  // Admin
  const hash = await bcrypt.hash("Admin@2025", 10);
  try {
    const a = await prisma.admin.upsert({
      where: { email: "admin@mtb.fund" },
      update: {},
      create: { email: "admin@mtb.fund", passwordHash: hash, name: "MTB Admin", role: "superadmin" },
    });
    console.log("✅ Admin:", a.email, "| Password: Admin@2025");
  } catch (e) {
    console.log("ℹ️  Admin error:", e.message);
  }

  // Active period
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const label = `${MONTHS[m - 1]} ${y}`;
  try {
    await prisma.contributionPeriod.updateMany({ data: { isActive: false } });
    const p = await prisma.contributionPeriod.create({
      data: { year: y, month: m, label, isActive: true },
    });
    console.log("✅ Period:", p.label);
  } catch (e) {
    try {
      await prisma.contributionPeriod.updateMany({
        where: { year: y, month: m },
        data: { isActive: true },
      });
      console.log("ℹ️  Period activated:", label);
    } catch (e2) {
      console.log("Period info:", e2.message);
    }
  }

  // Site config
  const defaults = [
    ["founder_name", "Ibrahim S. Kamara"],
    ["founder_title", "Founder & Visionary"],
    ["founder_bio", "Mr. Ibrahim S. Kamara is a proud Temne son and community leader. He founded Maseray Temne Blogger to connect our people, share our culture, and support the community."],
    ["founder_why", "To connect, inform and support the Temne community."],
    ["founder_vision", "A united and empowered Temne community."],
    ["founder_mission", "To share information, promote our culture and support community development."],
    ["founder_message", "Together, we can build a stronger, brighter future for our people."],
    ["founder_photo_url", "/logo.png"],
  ];
  for (const [key, value] of defaults) {
    await prisma.siteConfig.upsert({ where: { key }, create: { key, value }, update: {} });
  }
  console.log("✅ Site config seeded.");

  await prisma.$disconnect();
  console.log("✅ Done!");
}

run().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
