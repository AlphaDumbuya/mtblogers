import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if payout exists
    const payout = await prisma.payout.findUnique({ where: { id } });
    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    // Delete the payout
    await prisma.payout.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Payout deleted" });
  } catch (error) {
    console.error("Delete payout error:", error);
    return NextResponse.json(
      { error: "Failed to delete payout" },
      { status: 500 }
    );
  }
}
