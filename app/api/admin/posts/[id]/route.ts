import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  
  const post = await prisma.post.findUnique({ 
    where: { id },
    include: { admin: { select: { name: true, email: true } } }
  });
  
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  
  return NextResponse.json({ success: true, post });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid." }, { status: 400 }); }

  const updateData: any = {};
  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.summary !== undefined) updateData.summary = body.summary?.trim() || null;
  if (body.body !== undefined) updateData.body = body.body.trim();
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl?.trim() || null;
  if (body.eventDate !== undefined) updateData.eventDate = body.eventDate ? new Date(body.eventDate) : null;
  if (body.eventVenue !== undefined) updateData.eventVenue = body.eventVenue?.trim() || null;
  if (typeof body.published === "boolean") {
    updateData.published = body.published;
    if (body.published) updateData.publishedAt = new Date();
  }

  const post = await prisma.post.update({ where: { id }, data: updateData });
  return NextResponse.json({ success: true, post });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
