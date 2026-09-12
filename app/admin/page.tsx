import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function money(n: number) {
  return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    paidAgg,
    monthAgg,
    pendingCount,
    paidCount,
    memberCount,
    payoutAgg,
    byType,
    recent,
    openRequests,
    activePeriod,
  ] = await Promise.all([
    prisma.contribution.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
    prisma.contribution.aggregate({
      _sum: { amount: true },
      where: { status: "PAID", paidAt: { gte: startOfMonth } },
    }),
    prisma.contribution.count({ where: { status: "PENDING" } }),
    prisma.contribution.count({ where: { status: "PAID" } }),
    prisma.member.count(),
    prisma.payout.aggregate({ _sum: { amount: true } }),
    prisma.contribution.groupBy({
      by: ["contributionType"],
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.contribution.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.assistanceRequest.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] } },
    }),
    prisma.contributionPeriod.findFirst({ where: { isActive: true } }),
  ]);


  const totalRaised = Number(paidAgg._sum.amount ?? 0);
  const thisMonth = Number(monthAgg._sum.amount ?? 0);
  const totalPaidOut = Number(payoutAgg._sum.amount ?? 0);
  const balance = totalRaised - totalPaidOut;

  const typeRows = byType
    .map((t) => ({
      type: t.contributionType,
      total: Number(t._sum.amount ?? 0),
      count: t._count,
    }))
    .sort((a, b) => b.total - a.total);

  const maxType = Math.max(1, ...typeRows.map((t) => t.total));

  return (
    <>
      <h1>Dashboard</h1>

      <div className="stats">
        <div className="stat-card">
          <div className="label">Fund balance</div>
          <div className="value">{money(balance)}</div>
        </div>
        <div className="stat-card blue">
          <div className="label">Total raised</div>
          <div className="value">{money(totalRaised)}</div>
        </div>
        <div className="stat-card amber">
          <div className="label">This month</div>
          <div className="value">{money(thisMonth)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Paid out</div>
          <div className="value">{money(totalPaidOut)}</div>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card blue">
          <div className="label">Paid contributions</div>
          <div className="value">{paidCount}</div>
        </div>
        <div className="stat-card amber">
          <div className="label">Pending</div>
          <div className="value">{pendingCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Members</div>
          <div className="value">{memberCount}</div>
        </div>
        <div className={`stat-card ${openRequests > 0 ? "amber" : ""}`}>
          <div className="label">Open Requests</div>
          <div className="value">{openRequests}</div>
        </div>
      </div>

      {activePeriod && (
        <div className="panel" style={{ borderLeft: "4px solid #1c9366" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ marginBottom: 4 }}>📅 Active Period: {activePeriod.label}</h2>
              {activePeriod.dueDate && (
                <p style={{ fontSize: 13, color: "#64748b" }}>
                  Due: {new Date(activePeriod.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <a href="/admin/periods" className="btn secondary" style={{ fontSize: 13 }}>Manage Periods</a>
          </div>
        </div>
      )}


      <div className="panel">
        <h2>Contributions by type</h2>
        {typeRows.length === 0 ? (
          <div className="empty">No paid contributions yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {typeRows.map((t) => (
              <div key={t.type}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  <span>
                    {t.type} <span style={{ color: "#94a3b8" }}>({t.count})</span>
                  </span>
                  <strong>{money(t.total)}</strong>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "#eef2f6",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(t.total / maxType) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg,#1c9366,#12694a)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Recent contributions</h2>
        {recent.length === 0 ? (
          <div className="empty">Nothing here yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id}>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{c.contributorName}</td>
                    <td>{c.contributionType}</td>
                    <td>{money(Number(c.amount))}</td>
                    <td>
                      <span className={`badge ${c.status}`}>{c.status}</span>
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
