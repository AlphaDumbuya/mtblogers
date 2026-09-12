import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      contributions: { orderBy: { createdAt: "desc" }, take: 20, include: { period: true } },
      requests: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!member) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ member });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { pin, ...rest } = body;
  const updateData: any = { ...rest };

  // Only hash a new PIN if provided
  if (pin) {
    if (!/^\d{6}$/.test(String(pin))) {
      return NextResponse.json({ error: "PIN must be exactly 6 digits." }, { status: 400 });
    }
    updateData.pin = await bcrypt.hash(String(pin), 10);
  }

  // Clean empty strings to null
  for (const key of Object.keys(updateData)) {
    if (updateData[key] === "") updateData[key] = null;
  }

  // Handle dateOfBirth
  if (updateData.dateOfBirth) updateData.dateOfBirth = new Date(updateData.dateOfBirth);

  const member = await prisma.member.update({ where: { id }, data: updateData });
  return NextResponse.json({ success: true, member });
}
