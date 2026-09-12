import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import RequestDetailClient from "./RequestDetailClient";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function RequestDetailPage({ params }: Params) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;

  const request = await prisma.assistanceRequest.findUnique({
    where: { id },
    include: {
      member: { select: { id: true, fullName: true, phone: true, memberCode: true } },
      documents: true,
      payouts: true,
    },
  });

  if (!request) redirect("/admin/requests");

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
          <a href="/admin/requests" style={{ color: "#1c9366", textDecoration: "none" }}>Requests</a>
          {" / "}{request.requestCode}
        </div>
        <h1>{request.title}</h1>
      </div>
      <RequestDetailClient request={JSON.parse(JSON.stringify(request))} />
    </>
  );
}
