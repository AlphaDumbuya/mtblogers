import { prisma } from "@/lib/db";
import { getMemberSession } from "@/lib/member-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contribution Dashboard" };
export const dynamic = "force-dynamic";

function money(n: number) {
  return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type SearchParams = { [k: string]: string | string[] | undefined };

export default async function ContributionsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getMemberSession();
  if (!session) redirect("/member/login");

  const sp = await searchParams;
  const periodId = typeof sp.period === "string" ? sp.period : undefined;

  const [periods, activePeriod, memberCount] = await Promise.all([
    prisma.contributionPeriod.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] }),
    prisma.contributionPeriod.findFirst({ where: { isActive: true } }),
    prisma.member.count({ where: { status: "ACTIVE" } }),
  ]);

  const selectedPeriod = periodId
    ? periods.find((p: typeof periods[number]) => p.id === periodId)
    : activePeriod ?? periods[0];

  let contributions: any[] = [];
  let paidCount = 0;
  let unpaidCount = 0;
  let totalCollected = 0;

  if (selectedPeriod) {
    contributions = await prisma.contribution.findMany({
      where: { periodId: selectedPeriod.id, status: "PAID" },
      orderBy: { paidAt: "desc" },
      include: { member: { select: { fullName: true, district: true } } },
    });
    paidCount = contributions.length;
    unpaidCount = Math.max(0, memberCount - paidCount);
    totalCollected = contributions.reduce((s, c) => s + Number(c.amount), 0);
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <h1>💳 Contribution Dashboard</h1>
          <p>See who has paid, who has not, and the full details of each contribution.</p>
        </div>
      </div>

      <div className="section">
        {/* Period selector */}
        <form method="get" style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: "var(--navy-800)" }}>Period:</label>
          <select
            name="period"
            defaultValue={selectedPeriod?.id ?? ""}
            onChange={(e) => {
              // handled by form submit
            }}
            style={{
              padding: "9px 14px",
              border: "1.5px solid var(--gray-300)",
              borderRadius: "var(--radius-sm)",
              fontSize: 14,
              background: "var(--white)",
            }}
          >
            <option value="">— Select period —</option>
            {periods.map((p: typeof periods[number]) => (
              <option key={p.id} value={p.id}>
                {p.label} {p.isActive ? "(Active)" : ""}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary" style={{ padding: "9px 20px", fontSize: 14 }}>
            View
          </button>
        </form>

        {/* Stats */}
        <div className="stat-grid">
          {[
            { icon: "👥", label: "Total Members", val: memberCount, color: "blue" },
            { icon: "✅", label: "Paid Members", val: paidCount, color: "green" },
            { icon: "❌", label: "Unpaid Members", val: unpaidCount, color: "red" },
            { icon: "💰", label: "Total Collected", val: selectedPeriod ? money(totalCollected) : "—", color: "amber" },
          ].map(({ icon, label, val, color }) => (
            <div key={label} className="stat-card-pub">
              <div className={`stat-icon ${color}`}>{icon}</div>
              <div>
                <div className="stat-val">{val}</div>
                <div className="stat-lbl">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--navy-800)", marginBottom: 16 }}>
              Members &amp; Contributions
              {selectedPeriod && (
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", marginLeft: 10 }}>
                  — {selectedPeriod.label}
                </span>
              )}
            </h2>
            {!selectedPeriod ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <p>No contribution period selected. Please choose a period above.</p>
              </div>
            ) : contributions.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 0" }}>
                <div className="empty-icon">💳</div>
                <p>No paid contributions for {selectedPeriod.label} yet.</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    {["#", "Member Name", "Type", "Amount", "Date & Time", "Status"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--gray-500)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid var(--gray-100)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((c, i) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: "1px solid var(--gray-100)" }}
                    >
                      <td style={{ padding: "11px 12px", color: "var(--gray-500)" }}>{i + 1}</td>
                      <td style={{ padding: "11px 12px", fontWeight: 600 }}>
                        {c.contributorName}
                        {c.member?.district && (
                          <span style={{ fontSize: 11, color: "var(--gray-500)", display: "block" }}>
                            📍 {c.member.district}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "11px 12px", color: "var(--gray-700)" }}>{c.contributionType}</td>
                      <td style={{ padding: "11px 12px", fontWeight: 700, color: "var(--green-700)" }}>
                        {money(Number(c.amount))}
                      </td>
                      <td style={{ padding: "11px 12px", color: "var(--gray-500)", fontSize: 12 }}>
                        {c.paidAt ? new Date(c.paidAt).toLocaleString() : "—"}
                      </td>
                      <td style={{ padding: "11px 12px" }}>
                        <span className="badge PAID">Paid</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
