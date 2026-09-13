import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";

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
    include: { member: true },
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

  // Send email notification when request is approved
  if (status === "APPROVED" && req.member?.email) {
    await sendEmail({
      to: [{ email: req.member.email, name: req.member.fullName }],
      subject: `Request Approved - ${req.requestCode}`,
      html: emailTemplates.requestApproved(
        req.member.fullName,
        req.requestCode,
        Number(req.amountRequested)
      ),
    });
  }

  return NextResponse.json({ success: true, request: req });
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if request exists
    const req = await prisma.assistanceRequest.findUnique({ where: { id } });
    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Delete the request (cascade delete will handle related documents)
    await prisma.assistanceRequest.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "Request deleted",
        entity: `AssistanceRequest:${id}`,
        adminId: session.id,
      },
    });

    return NextResponse.json({ success: true, message: "Request deleted" });
  } catch (error) {
    console.error("Delete request error:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}

