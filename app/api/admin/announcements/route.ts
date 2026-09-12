import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid." }, { status: 400 }); }

  const { tag, title, body: text } = body;
  if (!title?.trim()) return NextResponse.json({ error: "Title required." }, { status: 400 });
  if (!text?.trim()) return NextResponse.json({ error: "Body required." }, { status: 400 });

  const TAGS = ["IMPORTANT", "EVENT", "UPDATE"];
  const announcement = await prisma.announcement.create({
    data: {
      tag: TAGS.includes(tag) ? tag : "UPDATE",
      title: title.trim(),
      body: text.trim(),
      adminId: session.id,
    },
  });

  return NextResponse.json({ success: true, announcement });
}
