import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid." }, { status: 400 }); }

  // Get old announcement to check if we're transitioning to published
  const oldAnnouncement = await prisma.announcement.findUnique({ where: { id } });
  const wasPublished = oldAnnouncement?.published ?? false;
  const willBePublished = typeof body.published === "boolean" ? body.published : wasPublished;
  const isBecomingPublished = !wasPublished && willBePublished;

  const a = await prisma.announcement.update({
    where: { id },
    data: {
      tag: body.tag ?? undefined,
      title: body.title?.trim() ?? undefined,
      body: body.body?.trim() ?? undefined,
      published: typeof body.published === "boolean" ? body.published : undefined,
    },
  });

  // Send email if announcement is being published for the first time
  if (isBecomingPublished) {
    const members = await prisma.member.findMany({
      where: { email: { not: null } },
      select: { email: true, fullName: true },
    });

    if (members.length > 0) {
      await Promise.all(
        members.map(member =>
          sendEmail({
            to: [{ email: member.email!, name: member.fullName }],
            subject: `New Announcement: ${a.title}`,
            html: emailTemplates.announcementNotification(a.title, a.body),
          })
        )
      );
    }
  }

  return NextResponse.json({ success: true, announcement: a });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
