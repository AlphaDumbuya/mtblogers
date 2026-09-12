import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Members Directory" };
export const dynamic = "force-dynamic";

type SearchParams = { [k: string]: string | string[] | undefined };

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const members = await prisma.member.findMany({
    where: {
      status: "ACTIVE",
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { district: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      memberCode: true,
      fullName: true,
      district: true,
      country: true,
      isDiaspora: true,
      photoUrl: true,
      status: true,
    },
  });

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <h1>👥 Member Directory</h1>
          <p>Active members of the Maseray Temne Blogger community fund.</p>
        </div>
      </div>

      <div className="section">
        {/* Search */}
        <form method="get" style={{ marginBottom: 28, display: "flex", gap: 10 }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or district..."
            style={{
              flex: 1,
              padding: "11px 16px",
              border: "1.5px solid var(--gray-300)",
              borderRadius: "var(--radius-sm)",
              fontSize: 14,
              background: "var(--white)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: "11px 24px", fontSize: 14 }}
          >
            🔍 Search
          </button>
          {q && (
            <a
              href="/members"
              style={{
                padding: "11px 20px",
                border: "1.5px solid var(--gray-300)",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                color: "var(--gray-700)",
                textDecoration: "none",
                background: "var(--white)",
                display: "flex",
                alignItems: "center",
              }}
            >
              Clear
            </a>
          )}
        </form>

        <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 20 }}>
          Showing {members.length} active member{members.length !== 1 ? "s" : ""}
          {q && ` matching "${q}"`}
        </p>

        {members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No members found{q ? ` matching "${q}"` : ""}.</p>
          </div>
        ) : (
          <div className="card-grid card-grid-4" style={{ gap: 16 }}>
            {members.map((m) => {
              const initials = m.fullName
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={m.id}
                  className="card"
                  style={{ padding: 20, textAlign: "center", cursor: "default" }}
                >
                  {m.photoUrl ? (
                    <img
                      src={m.photoUrl}
                      alt={m.fullName}
                      className="member-avatar"
                      style={{ width: 64, height: 64, margin: "0 auto 12px", fontSize: 20 }}
                    />
                  ) : (
                    <div
                      className="member-avatar"
                      style={{ width: 64, height: 64, margin: "0 auto 12px", fontSize: 20 }}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="member-name" style={{ fontSize: 15 }}>{m.fullName}</div>
                  <div className="member-sub" style={{ marginTop: 4 }}>
                    📍 {m.district || m.country}
                    {m.isDiaspora && " 🌍"}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <span className="badge ACTIVE">Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
