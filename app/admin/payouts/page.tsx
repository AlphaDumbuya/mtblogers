// Server component wrapper
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getPayoutsData() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const payouts = await prisma.payout.findMany({
    orderBy: { paidAt: "desc" },
    take: 100,
    include: { request: { include: { member: { select: { fullName: true } } } } },
  });

  const total = payouts.reduce((s, p) => s + Number(p.amount), 0);
  const withProof = payouts.filter(p => p.proofUrl).length;

  return { payouts, total, withProof };
}

import PayoutsPageClient from "./PayoutsPageClient";

export default async function PayoutsPage() {
  const { payouts, total, withProof } = await getPayoutsData();
  return <PayoutsPageClient initialPayouts={payouts} total={total} withProof={withProof} />;
}
