/**
 * prisma/seed.ts
 * Run with: node -e "require('dotenv').config({path:'.env.local'}); require('ts-node/register'); require('./prisma/seed')"
 * Or via: node node_modules/prisma/build/index.js db seed
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin user ────────────────────────────────────────────────────────────
  const adminEmail = "admin@mtb.fund";
  const adminPassword = "Admin@2025";
  const existing = await prisma.admin.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        name: "MTB Admin",
        role: "superadmin",
      },
    });
    console.log(`✅ Admin created: ${admin.email} / password: ${adminPassword}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${existing.email}`);
  }

  // ─── Active contribution period ────────────────────────────────────────────
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const label = `${months[month - 1]} ${year}`;

  const existingPeriod = await prisma.contributionPeriod.findFirst({
    where: { year, month },
  });

  if (!existingPeriod) {
    // Deactivate all others
    await prisma.contributionPeriod.updateMany({ data: { isActive: false } });

    const period = await prisma.contributionPeriod.create({
      data: { year, month, label, isActive: true },
    });
    console.log(`✅ Active period created: ${period.label}`);
  } else {
    console.log(`ℹ️  Period already exists: ${existingPeriod.label}`);
  }

  // ─── Default site config ───────────────────────────────────────────────────
  const defaults = [
    ["founder_name", "Ibrahim S. Kamara"],
    ["founder_title", "Founder & Visionary"],
    ["founder_bio", "Mr. Ibrahim S. Kamara is a proud Temne son, community leader and passionate advocate for the development of the Temne people. He founded Maseray Temne Blogger to connect our people, share our culture, and support the community."],
    ["founder_why", "To connect, inform and support the Temne community — bringing our people together no matter where they are in the world."],
    ["founder_vision", "A united and empowered Temne community."],
    ["founder_mission", "To share information, promote our culture and support community development."],
    ["founder_message", '"Together, we can build a stronger, brighter future for our people." — Ibrahim S. Kamara'],
    ["founder_photo_url", "/logo.png"],
  ] as [string, string][];

  for (const [key, value] of defaults) {
    await prisma.siteConfig.upsert({
      where: { key },
      create: { key, value },
      update: {},
    });
  }
  console.log(`✅ Site config defaults set.`);

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
