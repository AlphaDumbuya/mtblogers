import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnnouncementsAdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const items = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true, email: true } } },
  });

  const tagColor: Record<string, string> = {
    IMPORTANT: "#fee2e2",
    EVENT: "#dbeafe",
    UPDATE: "#e0f2fe",
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Announcements</h1>
        <Link href="/admin/announcements/new" className="btn">+ New Announcement</Link>
      </div>

      <div className="panel">
        <h2>{items.length} announcement{items.length !== 1 ? "s" : ""}</h2>
        {items.length === 0 ? (
          <div className="empty">No announcements yet. <a href="/admin/announcements/new" style={{ color: "#1c9366" }}>Create one.</a></div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: "16px 18px",
                  border: "1px solid #e6eef5",
                  borderRadius: 12,
                  background: a.published ? "#fff" : "#f8fafc",
                }}
              >
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    background: tagColor[a.tag] || "#f1f5f9",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {a.tag}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f2a47" }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, lineHeight: 1.5 }}>{a.body}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                    {new Date(a.createdAt).toLocaleString()} · by {a.admin?.name || a.admin?.email || "Admin"}
                    {!a.published && <span style={{ marginLeft: 8, color: "#d97706", fontWeight: 700 }}>UNPUBLISHED</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Link href={`/admin/announcements/${a.id}/edit`} className="btn secondary" style={{ padding: "7px 14px", fontSize: 13 }}>
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
