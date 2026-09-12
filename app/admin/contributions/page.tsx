import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import ContributionsFilter from "./ContributionsFilter";

export const dynamic = "force-dynamic";

function money(n: number) {
  return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUSES = ["", "PENDING", "PAID", "FAILED", "CANCELLED"];
type SearchParams = { [k: string]: string | string[] | undefined };

export default async function ContributionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const q      = typeof sp.q      === "string" ? sp.q      : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const page   = Math.max(1, Number(sp.page) || 1);
  const pageSize = 25;

  const where: Prisma.ContributionWhereInput = {};
  if (status) where.status = status as Prisma.EnumContributionStatusFilter;
  if (q) {
    where.OR = [
      { contributorName:  { contains: q, mode: "insensitive" } },
      { contributorPhone: { contains: q } },
      { reference:        { contains: q, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.contribution.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contribution.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const exportQuery = new URLSearchParams();
  if (q)      exportQuery.set("q",      q);
  if (status) exportQuery.set("status", status);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>Contributions</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>Track every payment made to the fund</p>
        </div>
        <a
          className="btn secondary"
          href={`/api/admin/contributions/export?${exportQuery.toString()}`}
          style={{ alignSelf: "flex-start" }}
        >
          ↓ Export CSV
        </a>
      </div>

      {/* Search & Filter Bar */}
      <ContributionsFilter q={q} status={status} />

      {/* Table */}
      <div className="panel">
        <div className="panel-actions">
          <h2>
            {total.toLocaleString()} result{total === 1 ? "" : "s"}
          </h2>
        </div>

        {rows.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">💳</span>
            No contributions match your filters.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>{c.contributorName}</td>
                    <td>{c.contributorPhone}</td>
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

      {totalPages > 1 && (
        <div className="pagination">
          {page > 1 && (
            <a className="btn secondary sm" href={`?q=${encodeURIComponent(q)}&status=${status}&page=${page - 1}`}>
              ← Prev
            </a>
          )}
          <span>Page {page} of {totalPages}</span>
          {page < totalPages && (
            <a className="btn secondary sm" href={`?q=${encodeURIComponent(q)}&status=${status}&page=${page + 1}`}>
              Next →
            </a>
          )}
        </div>
      )}
    </>
  );
}
