import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local first for app variables, then .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// For Prisma CLI (db push, studio), use the direct (non-pooler) Neon URL.
// The pooler URL in .env.local is for the Next.js app runtime.
// Direct URL = same credentials but without "-pooler" in the hostname.
const cliUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!cliUrl) {
  throw new Error("DATABASE_URL is not set in .env or .env.local");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: cliUrl,
  },
});
