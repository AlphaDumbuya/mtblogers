// Server component wrapper
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getRequestsData() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return await prisma.assistanceRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { member: true, _count: { select: { documents: true } } },
  });
}

import RequestsPageClient from "./RequestsPageClient";

export default async function RequestsPage() {
  const requests = await getRequestsData();
  return <RequestsPageClient initialRequests={requests} />;
}
