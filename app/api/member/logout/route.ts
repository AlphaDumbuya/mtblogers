import { NextResponse } from "next/server";
import { destroyMemberSession } from "@/lib/member-auth";

export const runtime = "nodejs";

export async function POST() {
  await destroyMemberSession();
  return NextResponse.redirect(new URL("/member/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}
