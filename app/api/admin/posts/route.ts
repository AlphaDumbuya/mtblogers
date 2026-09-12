import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function uniqueSlug(base: string) {
  let slug = slugify(base);
  let i = 0;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${++i}`;
  }
  return slug;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid." }, { status: 400 }); }

  const { kind, title, summary, body: text, imageUrl, eventDate, eventVenue, published } = body;

  if (!["NEWS", "EVENT"].includes(kind)) return NextResponse.json({ error: "Kind must be NEWS or EVENT." }, { status: 400 });
  if (!title?.trim()) return NextResponse.json({ error: "Title required." }, { status: 400 });
  if (!text?.trim()) return NextResponse.json({ error: "Body required." }, { status: 400 });

  const slug = await uniqueSlug(title);

  const post = await prisma.post.create({
    data: {
      kind,
      title: title.trim(),
      slug,
      summary: summary?.trim() || null,
      body: text.trim(),
      imageUrl: imageUrl?.trim() || null,
      eventDate: eventDate ? new Date(eventDate) : null,
      eventVenue: eventVenue?.trim() || null,
      published: published === true,
      publishedAt: published === true ? new Date() : null,
      adminId: session.id,
    },
  });

  return NextResponse.json({ success: true, post });
}
