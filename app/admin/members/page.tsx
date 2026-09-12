import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contributions: true, requests: true } } },
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Members</h1>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: "#64748b" }}>{members.length} registered member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/members/new" className="btn">+ Add Member</Link>
      </div>

      <div className="panel">
        {members.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">👥</span>
            No members yet.{" "}
            <Link href="/admin/members/new" style={{ color: "var(--green)" }}>Add the first one.</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>District</th>
                  <th>Status</th>
                  <th>Contributions</th>
                  <th>Requests</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="mono">
                      <Link href={`/admin/members/${m.id}`} style={{ color: "var(--green)", textDecoration: "none" }}>
                        {m.memberCode}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/members/${m.id}`} style={{ fontWeight: 600, textDecoration: "none", color: "var(--navy)" }}>
                        {m.fullName}
                      </Link>
                    </td>
                    <td>{m.phone}</td>
                    <td style={{ color: "var(--slate)" }}>{m.email || "—"}</td>
                    <td style={{ color: "var(--slate)" }}>{m.district || "—"}</td>
                    <td><span className={`badge ${m.status}`}>{m.status}</span></td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>{m._count.contributions}</td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>{m._count.requests}</td>
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
