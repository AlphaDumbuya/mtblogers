import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

import CreatePeriodForm from "./CreatePeriodForm";

export const dynamic = "force-dynamic";

function money(n: number) {
  return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function PeriodsAdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const periods = await prisma.contributionPeriod.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const memberCount = await prisma.member.count({ where: { status: "ACTIVE" } });

  // Get paid count per period
  const paidCounts = await Promise.all(
    periods.map(async (p) => {
      const paid = await prisma.contribution.count({
        where: { periodId: p.id, status: "PAID" },
      });
      const total = await prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { periodId: p.id, status: "PAID" },
      });
      return { id: p.id, paid, total: Number(total._sum.amount ?? 0) };
    })
  );
  const paidMap = Object.fromEntries(paidCounts.map(p => [p.id, p]));

  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Contribution Periods</h1>
      </div>

      {/* Quick create form */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <h2>Create / Activate Period</h2>
        <CreatePeriodForm defaultYear={defaultYear} defaultMonth={defaultMonth} />
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>
          ⚠️ "Set as active" will deactivate all other periods and make this one the current month shown on the home page.
        </p>
      </div>

      {/* Periods table */}
      <div className="panel">
        <h2>All Periods</h2>
        {periods.length === 0 ? (
          <div className="empty">No periods yet. Create one above.</div>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Period</th><th>Expected</th><th>Due Date</th>
                <th>Paid Members</th><th>Unpaid</th><th>Total Collected</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => {
                const stats = paidMap[p.id];
                const unpaid = Math.max(0, memberCount - (stats?.paid ?? 0));
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.label}</td>
                    <td>{p.amountExpected ? money(Number(p.amountExpected)) : "—"}</td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>
                      {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ color: "#166534", fontWeight: 700 }}>{stats?.paid ?? 0}</td>
                    <td style={{ color: unpaid > 0 ? "#dc2626" : "#166534", fontWeight: 700 }}>{unpaid}</td>
                    <td style={{ fontWeight: 700, color: "#1c9366" }}>{money(stats?.total ?? 0)}</td>
                    <td>
                      {p.isActive
                        ? <span className="badge PAID">Active</span>
                        : <span className="badge PENDING">Inactive</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
