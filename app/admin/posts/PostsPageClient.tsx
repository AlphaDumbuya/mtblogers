"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function PostsPageClient({ 
  initialPosts, 
  error 
}: { 
  initialPosts: any[];
  error?: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openMenu]);

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setPosts(posts.filter(p => p.id !== id));
      setOpenMenu(null);
    } catch (error) {
      alert("Error: " + (error as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  if (error) {
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
          {posts.map((p) => (
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
                  overflow: "hidden",
                  background: p.imageUrl ? "#0f172a" : "linear-gradient(135deg, #1c9366, #0f7652)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  color: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                className="post-thumbnail"
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  p.kind === "EVENT" ? "📅" : "📰"
                )}
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
              <div style={{ position: "relative", display: "flex", gap: 8, alignItems: "center" }} ref={openMenu === p.id ? menuRef : null}>
                <Link href={`/admin/posts/${p.id}/edit`} className="btn secondary" style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }}>
                  Edit
                </Link>
                <button 
                  className="btn-more"
                  onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                  disabled={deleting === p.id}
                >
                  ⋮
                </button>
                {openMenu === p.id && (
                  <div className="action-menu">
                    <Link href={`/admin/posts/${p.id}/edit`}>Edit</Link>
                    <Link href={p.kind === "NEWS" ? `/news/${p.slug}` : `/events/${p.slug}`} target="_blank">View Live</Link>
                    <div className="divider"></div>
                    <button 
                      className="delete"
                      onClick={() => deletePost(p.id)}
                      disabled={deleting === p.id}
                    >
                      {deleting === p.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
