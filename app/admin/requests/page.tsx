import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

function money(n: number) {
  return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function RequestsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const requests = await prisma.assistanceRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { member: true, _count: { select: { documents: true } } },
  });

  const statusOrder: Record<string, number> = {
    SUBMITTED: 0, UNDER_REVIEW: 1, APPROVED: 2, DISBURSED: 3, REJECTED: 4,
  };
  const sorted = [...requests].sort(
    (a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Assistance Requests</h1>
        <Link href="/admin/requests/new" className="btn">+ New Request</Link>
      </div>
      <div className="panel">
        <h2>
          {requests.length} request{requests.length === 1 ? "" : "s"}
        </h2>
        {requests.length === 0 ? (
          <div className="empty">
            No assistance requests yet. When a member needs help, their request
            will appear here for review.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Member</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Requested</th>
                  <th>Docs</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{r.requestCode}</td>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={`/admin/members/${r.memberId}`} style={{ color: "#1c9366", textDecoration: "none" }}>
                        {r.member.fullName}
                      </Link>
                    </td>
                    <td>{r.category}</td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</td>
                    <td style={{ fontWeight: 700, color: "#1c9366" }}>{money(Number(r.amountRequested))}</td>
                    <td style={{ textAlign: "center" }}>{r._count.documents}</td>
                    <td>
                      <span className={`badge ${r.status}`}>{r.status.replace("_", " ")}</span>
                    </td>
                    <td>
                      <Link href={`/admin/requests/${r.id}`} className="btn secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
