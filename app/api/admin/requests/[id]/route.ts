import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "DISBURSED", "REJECTED"];

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { status, decisionNotes } = body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const req = await prisma.assistanceRequest.update({
    where: { id },
    data: {
      status,
      decisionNotes: decisionNotes?.trim() || undefined,
      reviewedBy: session.email,
      reviewedAt: new Date(),
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: `Request ${status}`,
      entity: `AssistanceRequest:${id}`,
      details: decisionNotes || undefined,
      adminId: session.id,
    },
  });

  return NextResponse.json({ success: true, request: req });
}
