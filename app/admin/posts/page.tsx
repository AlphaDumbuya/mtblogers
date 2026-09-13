import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PostsAdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true, email: true } } },
    });

    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ margin: 0 }}>News &amp; Events</h1>
          <Link href="/admin/posts/new" className="btn">+ New Post</Link>
        </div>

        <div className="panel">
          <h2>{posts.length} post{posts.length !== 1 ? "s" : ""}</h2>
          {posts.length === 0 ? (
            <div className="empty">No posts yet. <a href="/admin/posts/new" style={{ color: "#1c9366" }}>Create one.</a></div>
          ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {posts.map((p: typeof posts[number]) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: "12px",
                  border: "1px solid #e6eef5",
                  borderRadius: 12,
                  background: "#fff",
                  transition: "background 0.2s",
                }}
              >
                {/* Image Thumbnail */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: p.imageUrl
                      ? `url(${p.imageUrl}) center/cover`
                      : "linear-gradient(135deg, #1c9366, #0f7652)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    color: "#fff",
                    overflow: "hidden",
                  }}
                >
                  {!p.imageUrl && (p.kind === "EVENT" ? "📅" : "📰")}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span
                      className="badge"
                      style={{
                        background: "#d8e4f4",
                        color: p.kind === "NEWS" ? "#1e40af" : "#0f1f3d",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {p.kind}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: p.published ? "#059669" : "#d97706",
                      }}
                    >
                      {p.published ? "✅ Published" : "⏳ Draft"}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#0f2a47", marginBottom: 4 }}>{p.title}</div>
                  {p.summary && (
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>{p.summary}</div>
                  )}
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    by {p.admin?.name || p.admin?.email || "Admin"} · {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <Link href={`/admin/posts/${p.id}/edit`} className="btn secondary" style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }}>
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
    );
  } catch (error) {
    console.error("Failed to load posts:", error);
    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ margin: 0 }}>News &amp; Events</h1>
          <Link href="/admin/posts/new" className="btn">+ New Post</Link>
        </div>
        <div className="panel" style={{ padding: "30px", textAlign: "center" }}>
          <p style={{ color: "#dc2626", fontWeight: 600 }}>Error loading posts. Please try refreshing the page.</p>
        </div>
      </>
    );
  }
}
