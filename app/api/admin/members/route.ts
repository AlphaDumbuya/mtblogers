import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { memberCode } from "@/lib/codes";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, memberCode: true, phone: true, status: true },
  });

  return NextResponse.json({ members });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { fullName, phone, email, gender, dateOfBirth, tribe, district, country, occupation, isDiaspora, pin } = body;

  if (!fullName?.trim()) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  if (!phone?.trim()) return NextResponse.json({ error: "Phone number is required." }, { status: 400 });

  // Check unique phone
  const existing = await prisma.member.findUnique({ where: { phone: phone.trim() } });
  if (existing) return NextResponse.json({ error: "A member with this phone number already exists." }, { status: 409 });

  const count = await prisma.member.count();
  const pinHash = pin ? await bcrypt.hash(String(pin), 10) : null;

  const member = await prisma.member.create({
    data: {
      memberCode: memberCode(count + 1),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      tribe: tribe?.trim() || null,
      district: district?.trim() || null,
      country: country?.trim() || "Sierra Leone",
      occupation: occupation?.trim() || null,
      isDiaspora: isDiaspora === true,
      pin: pinHash,
    },
  });

  return NextResponse.json({ success: true, member });
}
