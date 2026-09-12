import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PostsAdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

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
          <table className="data">
            <thead>
              <tr>
                <th>Type</th><th>Title</th><th>Event Date</th><th>Published</th><th>Author</th><th>Created</th><th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p: typeof posts[number]) => (
                <tr key={p.id}>
                  <td>
                    <span className="badge" style={{ background: "#d8e4f4", color: p.kind === "NEWS" ? "#1e40af" : "#0f1f3d" }}>
                      {p.kind}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 280 }}>{p.title}</td>
                  <td style={{ fontSize: 12, color: "#64748b" }}>
                    {p.eventDate ? new Date(p.eventDate).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    {p.published
                      ? <span style={{ color: "#e8650a", fontWeight: 700, fontSize: 13 }}>✅ Yes</span>
                      : <span style={{ color: "#d97706", fontWeight: 700, fontSize: 13 }}>⏳ Draft</span>}
                  </td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>{p.admin?.name || p.admin?.email || "—"}</td>
                  <td style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/posts/${p.id}/edit`} className="btn secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
