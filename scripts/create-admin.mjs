// Creates or updates an admin user.
// Usage: node scripts/create-admin.mjs <email> <password> [name]
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> [name]");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const passwordHash = await bcrypt.hash(password, 10);

const admin = await prisma.admin.upsert({
  where: { email: email.toLowerCase() },
  update: { passwordHash, name: name || undefined },
  create: {
    email: email.toLowerCase(),
    passwordHash,
    name: name || null,
    role: "superadmin",
  },
});

console.log(`Admin ready: ${admin.email} (${admin.role})`);
await prisma.$disconnect();
