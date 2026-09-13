import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requestCode } from "@/lib/codes";
import { sendEmail, emailTemplates } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { memberId, category, title, description, amountRequested } = body;

  if (!memberId) return NextResponse.json({ error: "Member is required." }, { status: 400 });
  if (!category?.trim()) return NextResponse.json({ error: "Category is required." }, { status: 400 });
  if (!title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!description?.trim()) return NextResponse.json({ error: "Description is required." }, { status: 400 });
  if (!amountRequested || Number(amountRequested) < 1) return NextResponse.json({ error: "Valid amount is required." }, { status: 400 });

  const count = await prisma.assistanceRequest.count();
  const req = await prisma.assistanceRequest.create({
    data: {
      requestCode: requestCode(count + 1),
      memberId,
      category: category.trim(),
      title: title.trim(),
      description: description.trim(),
      amountRequested: Number(amountRequested),
    },
    include: { member: true },
  });

  // Send email notification to member
  if (req.member?.email) {
    await sendEmail({
      to: [{ email: req.member.email, name: req.member.fullName }],
      subject: `Request Received - ${req.requestCode}`,
      html: emailTemplates.requestSubmitted(req.member.fullName, req.requestCode, req.title),
    });
  }

  return NextResponse.json({ success: true, request: req });
}
