import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid." }, { status: 400 }); }

  const a = await prisma.announcement.update({
    where: { id },
    data: {
      tag: body.tag ?? undefined,
      title: body.title?.trim() ?? undefined,
      body: body.body?.trim() ?? undefined,
      published: typeof body.published === "boolean" ? body.published : undefined,
    },
  });
  return NextResponse.json({ success: true, announcement: a });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
