import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

function money(n: number) {
  return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function PayoutsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const payouts = await prisma.payout.findMany({
    orderBy: { paidAt: "desc" },
    take: 100,
    include: { request: { include: { member: { select: { fullName: true } } } } },
  });

  const total = payouts.reduce((s, p) => s + Number(p.amount), 0);
  const withProof = payouts.filter(p => p.proofUrl).length;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Payouts</h1>
        <Link href="/admin/payouts/new" className="btn">+ Record Payout</Link>
      </div>
      <div className="stats">
        <div className="stat-card">
          <div className="label">Total Disbursed</div>
          <div className="value">{money(total)}</div>
        </div>
        <div className="stat-card blue">
          <div className="label">Payout Records</div>
          <div className="value">{payouts.length}</div>
        </div>
        <div className="stat-card green">
          <div className="label">With Proof</div>
          <div className="value">{withProof}</div>
        </div>
      </div>
      <div className="panel">
        <h2>Disbursements</h2>
        {payouts.length === 0 ? (
          <div className="empty">
            No payouts recorded yet. When the fund helps a member,{" "}
            <a href="/admin/payouts/new" style={{ color: "#1c9366" }}>record it here</a>{" "}
            to keep the balance transparent.
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Code</th><th>Beneficiary</th><th>Request / Member</th>
                    <th>Amount</th><th>Method</th><th>Date</th><th>Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.payoutCode}</td>
                      <td style={{ fontWeight: 600 }}>{p.beneficiaryName}</td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>
                        {p.request ? (
                          <Link href={`/admin/requests/${p.request.id}`} style={{ color: "#1c9366", textDecoration: "none" }}>
                            {p.request.member?.fullName}
                          </Link>
                        ) : "—"}
                      </td>
                      <td style={{ fontWeight: 800, color: "#1c9366" }}>{money(Number(p.amount))}</td>
                      <td>{p.method || "—"}</td>
                      <td style={{ fontSize: 12 }}>{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: "center" }}>
                        {p.proofUrl ? (
                          <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" style={{
                            color: "#1c9366",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: 12,
                          }}>
                            📄 View
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
