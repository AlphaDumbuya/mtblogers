import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
