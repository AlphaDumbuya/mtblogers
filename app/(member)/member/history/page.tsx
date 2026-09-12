import { getMemberSession } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Payment History" };
export const dynamic = "force-dynamic";

function money(n: number) {
  return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function MemberHistoryPage() {
  const session = await getMemberSession();
  if (!session) redirect("/member/login");

  const contributions = await prisma.contribution.findMany({
    where: { memberId: session.id },
    orderBy: { createdAt: "desc" },
    include: { period: true },
  });

  const totalPaid = contributions
    .filter((c) => c.status === "PAID")
    .reduce((s, c) => s + Number(c.amount), 0);

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-800)", marginBottom: 6 }}>
        💳 My Payment History
      </h1>
      <p style={{ fontSize: 14, color: "var(--gray-500)", marginBottom: 24 }}>
        All your contribution records — {contributions.length} total, {money(totalPaid)} paid.
      </p>

      <div className="card">
        <div className="card-body">
          {contributions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <p>You haven't made any contributions yet. <a href="/contribute" style={{ color: "var(--green-600)", fontWeight: 700 }}>Contribute now →</a></p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["Date", "Type", "Month/Period", "Amount", "Status", "Reference"].map((h) => (
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
                {contributions.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "12px 12px", color: "var(--gray-700)" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <br />
                      <span style={{ fontSize: 11, color: "var(--gray-500)" }}>
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px", fontWeight: 600 }}>{c.contributionType}</td>
                    <td style={{ padding: "12px 12px", color: "var(--gray-500)" }}>
                      {c.period?.label ?? "—"}
                    </td>
                    <td style={{ padding: "12px 12px", fontWeight: 800, color: "var(--green-700)" }}>
                      {money(Number(c.amount))}
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      <span className={`badge ${c.status}`}>{c.status}</span>
                    </td>
                    <td style={{ padding: "12px 12px", fontSize: 11, fontFamily: "monospace", color: "var(--gray-500)" }}>
                      {c.reference}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "var(--green-50)", borderTop: "2px solid var(--green-100)" }}>
                  <td colSpan={3} style={{ padding: "12px 12px", fontWeight: 800, color: "var(--navy-800)" }}>
                    Total Paid
                  </td>
                  <td style={{ padding: "12px 12px", fontWeight: 900, color: "var(--green-700)", fontSize: 16 }}>
                    {money(totalPaid)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
