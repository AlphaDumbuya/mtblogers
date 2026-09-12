import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(v: unknown) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const status = url.searchParams.get("status") || "";

  const where: Prisma.ContributionWhereInput = {};
  if (status) where.status = status as any;
  if (q) {
    where.OR = [
      { contributorName: { contains: q, mode: "insensitive" } },
      { contributorPhone: { contains: q } },
      { reference: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.contribution.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "Reference",
    "Date",
    "Paid At",
    "Name",
    "Phone",
    "Email",
    "Type",
    "Amount",
    "Currency",
    "Status",
  ];

  const lines = [header.join(",")];
  for (const c of rows) {
    lines.push(
      [
        c.reference,
        c.createdAt.toISOString(),
        c.paidAt ? c.paidAt.toISOString() : "",
        c.contributorName,
        c.contributorPhone,
        c.contributorEmail || "",
        c.contributionType,
        Number(c.amount).toFixed(2),
        c.currency,
        c.status,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  const body = lines.join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contributions-${date}.csv"`,
    },
  });
}
