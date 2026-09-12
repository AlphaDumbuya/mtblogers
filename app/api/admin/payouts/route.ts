import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { payoutCode } from "@/lib/codes";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { beneficiaryName, amount, method, requestId, note, paidAt } = body;

  if (!beneficiaryName?.trim()) return NextResponse.json({ error: "Beneficiary name is required." }, { status: 400 });
  if (!amount || Number(amount) < 1) return NextResponse.json({ error: "Valid amount is required." }, { status: 400 });

  const count = await prisma.payout.count();
  const payout = await prisma.payout.create({
    data: {
      payoutCode: payoutCode(count + 1),
      beneficiaryName: beneficiaryName.trim(),
      amount: Number(amount),
      method: method?.trim() || null,
      requestId: requestId || null,
      approvedBy: session.email,
      note: note?.trim() || null,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    },
  });

  // If linked to a request, mark it DISBURSED
  if (requestId) {
    await prisma.assistanceRequest.update({
      where: { id: requestId },
      data: { status: "DISBURSED", reviewedBy: session.email, reviewedAt: new Date() },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "Payout recorded",
      entity: `Payout:${payout.id}`,
      details: `${payout.payoutCode} — SLE ${Number(amount).toFixed(2)} to ${beneficiaryName}`,
      adminId: session.id,
    },
  });

  return NextResponse.json({ success: true, payout });
}
