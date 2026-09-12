import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function money(n: number) {
  return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Params = { params: Promise<{ id: string }> };

export default async function MemberDetailPage({ params }: Params) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      contributions: { orderBy: { createdAt: "desc" }, take: 20 },
      requests:      { orderBy: { createdAt: "desc" }, take: 10 },
      _count:        { select: { contributions: true, requests: true } },
    },
  });
  if (!member) redirect("/admin/members");

  const totalPaid = member.contributions
    .filter(c => c.status === "PAID")
    .reduce((s, c) => s + Number(c.amount), 0);

  const rows: [string, string][] = [
    ["Member Code",    member.memberCode],
    ["Phone",          member.phone],
    ["Email",          member.email     || "—"],
    ["Gender",         member.gender    || "—"],
    ["Date of Birth",  member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : "—"],
    ["District",       member.district  || "—"],
    ["Occupation",     member.occupation || "—"],
    ["Diaspora",       member.isDiaspora ? "Yes 🌍" : "No"],
    ["Portal PIN",     member.pin ? "Set ✅" : "Not set"],
    ["Joined",         new Date(member.createdAt).toLocaleDateString()],
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>{member.fullName}</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
            <a href="/admin/members" style={{ color: "#1c9366", textDecoration: "none" }}>Members</a>
            <span style={{ color: "#94a3b8", margin: "0 6px" }}>/</span>
            <span style={{ color: "#64748b" }}>{member.memberCode}</span>
          </p>
          <div style={{ marginTop: 8 }}>
            <span className={`badge ${member.status}`}>{member.status}</span>
          </div>
        </div>
        <Link href={`/admin/members/${id}/edit`} className="btn" style={{ alignSelf: "flex-start" }}>Edit Member</Link>
      </div>

      <div className="detail-grid">
        {/* Left column */}
        <div>
          <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            <div className="stat-card blue">
              <div className="label">Total Contributed</div>
              <div className="value">{money(totalPaid)}</div>
            </div>
            <div className="stat-card">
              <div className="label">Contributions</div>
              <div className="value">{member._count.contributions}</div>
            </div>
            <div className="stat-card amber">
              <div className="label">Requests</div>
              <div className="value">{member._count.requests}</div>
            </div>
          </div>

          {/* Contribution history */}
          <div className="panel">
            <h2>Contribution History</h2>
            {member.contributions.length === 0 ? (
              <div className="empty"><span className="empty-icon">💳</span>No contributions yet.</div>
            ) : (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.contributions.map(c => (
                      <tr key={c.id}>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>{c.contributionType}</td>
                        <td style={{ fontWeight: 700 }}>{money(Number(c.amount))}</td>
                        <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                        <td className="mono">{c.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Requests */}
          {member.requests.length > 0 && (
            <div className="panel">
              <h2>Assistance Requests</h2>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr><th>Code</th><th>Category</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {member.requests.map(r => (
                      <tr key={r.id}>
                        <td className="mono">
                          <Link href={`/admin/requests/${r.id}`} style={{ color: "var(--green)" }}>{r.requestCode}</Link>
                        </td>
                        <td>{r.category}</td>
                        <td style={{ fontWeight: 700 }}>{money(Number(r.amountRequested))}</td>
                        <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right column — profile */}
        <div>
          <div className="panel">
            <h2>Profile</h2>
            <div className="detail-list">
              {rows.map(([k, v]) => (
                <div className="detail-row" key={k}>
                  <span className="key">{k}</span>
                  <span className="val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
