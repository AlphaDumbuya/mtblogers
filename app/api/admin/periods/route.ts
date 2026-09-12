import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") || "";
  let body: any = {};
  const isFormSubmit = !contentType.includes("application/json");

  if (contentType.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }
  } else {
    try {
      const formData = await request.formData();
      body = {
        year: formData.get("year"),
        month: formData.get("month"),
        label: formData.get("label"),
        dueDate: formData.get("dueDate"),
        amountExpected: formData.get("amountExpected"),
        isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
      };
    } catch {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }
  }

  const { year, month, label, dueDate, amountExpected, isActive } = body;

  if (!year || !month || !label?.toString().trim()) {
    if (isFormSubmit) {
      return NextResponse.redirect(new URL("/admin/periods", request.url), 303);
    }
    return NextResponse.json({ error: "Year, month, and label are required." }, { status: 400 });
  }

  // If setting this as active, deactivate all others first
  if (isActive === true || isActive === "true") {
    await prisma.contributionPeriod.updateMany({ data: { isActive: false } });
  }

  const period = await prisma.contributionPeriod.upsert({
    where: { year_month: { year: Number(year), month: Number(month) } },
    create: {
      year: Number(year),
      month: Number(month),
      label: label.toString().trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      amountExpected: amountExpected ? Number(amountExpected) : null,
      isActive: isActive === true || isActive === "true",
    },
    update: {
      label: label.toString().trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      amountExpected: amountExpected ? Number(amountExpected) : null,
      isActive: isActive === true || isActive === "true",
    },
  });

  if (isFormSubmit) {
    return NextResponse.redirect(new URL("/admin/periods", request.url), 303);
  }

  return NextResponse.json({ success: true, period });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const periods = await prisma.contributionPeriod.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] });
  return NextResponse.json({ periods });
}
