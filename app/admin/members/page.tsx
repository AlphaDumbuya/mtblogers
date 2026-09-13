// Server component wrapper
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getMembersData() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contributions: true, requests: true } } },
  });
}

import MembersPageClient from "./MembersPageClient";

export default async function MembersPage() {
  const members = await getMembersData();
  return <MembersPageClient initialMembers={members} />;
}
