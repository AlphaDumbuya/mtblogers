import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";

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
      published: body.published ?? true,
      adminId: session.id,
    },
  });

  // Send email notification to all members if published
  if (announcement.published) {
    const members = await prisma.member.findMany({
      where: { email: { not: null } },
      select: { email: true, fullName: true },
    });

    if (members.length > 0) {
      await Promise.all(
        members.map(member =>
          sendEmail({
            to: [{ email: member.email!, name: member.fullName }],
            subject: `New Announcement: ${announcement.title}`,
            html: emailTemplates.announcementNotification(announcement.title, announcement.body),
          })
        )
      );
    }
  }

  return NextResponse.json({ success: true, announcement });
}
