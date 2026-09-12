import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMemberSession } from "@/lib/member-auth";

export const runtime = "nodejs";

// Mark all notifications as read
export async function POST(request: Request) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { memberId: session.id, read: false },
    data: { read: true },
  });

  // Redirect back
  const referer = request.headers.get("referer") || "/member/notifications";
  return NextResponse.redirect(referer);
}
