import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const SITE_KEYS = [
  "founder_name", "founder_title", "founder_bio", "founder_photo_url",
  "founder_vision", "founder_mission", "founder_message", "founder_why",
];

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid." }, { status: 400 }); }

  const ops = Object.entries(body)
    .filter(([key]) => SITE_KEYS.includes(key))
    .map(([key, value]) =>
      prisma.siteConfig.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    );

  await Promise.all(ops);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.siteConfig.findMany();
  const config = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({ config });
}
