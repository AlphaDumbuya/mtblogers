import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createMemberSession } from "@/lib/member-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { phone?: string; pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const phone = String(body.phone || "").trim();
  const pin = String(body.pin || "").trim();

  if (!phone || !pin) {
    return NextResponse.json({ error: "Phone and PIN are required." }, { status: 400 });
  }

  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "PIN must be 6 digits." }, { status: 400 });
  }

  const member = await prisma.member.findUnique({ where: { phone } });
  if (!member || !member.pin) {
    return NextResponse.json(
      { error: "No account found with that number, or PIN not yet set. Contact an admin." },
      { status: 401 }
    );
  }

  const ok = await bcrypt.compare(pin, member.pin);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect PIN. Please try again." }, { status: 401 });
  }

  if (member.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Your account is not active. Please contact an admin." },
      { status: 403 }
    );
  }

  await createMemberSession({
    id: member.id,
    memberCode: member.memberCode,
    fullName: member.fullName,
    phone: member.phone,
  });

  // Update lastLoginAt
  await prisma.member.update({
    where: { id: member.id },
    data: { lastLoginAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
