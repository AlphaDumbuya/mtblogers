"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    params.then(({ id: rid }) => {
      setId(rid);
      fetch(`/api/admin/posts/${rid}`).then(r => r.json()).then(d => {
        const p = d.post;
        setForm({
          kind: p.kind, title: p.title, summary: p.summary || "",
          body: p.body || "", imageUrl: p.imageUrl || "",
          eventDate: p.eventDate ? p.eventDate.slice(0, 16) : "",
          eventVenue: p.eventVenue || "", published: p.published,
        });
      });
    });
  }, []);

  function set(k: string, v: unknown) { setForm(f => f ? { ...f, [k]: v } : f); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    router.push("/admin/posts");
    router.refresh();
  }

  if (!form) return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>Edit Post</h1>
      </div>
      <div className="panel"><p style={{ color: "var(--slate)" }}>Loading…</p></div>
    </>
  );

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>Edit {form.kind === "EVENT" ? "Event" : "News Article"}</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          <a href="/admin/posts" style={{ color: "#1c9366", textDecoration: "none" }}>News &amp; Events</a>
          <span style={{ color: "#94a3b8", margin: "0 6px" }}>/</span>
          <span style={{ color: "#64748b" }}>Edit</span>
        </p>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-card-header">
          <h2>Post details</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-card-body">
            <div className="form-grid">
              <div className="field-group span-2">
                <label>Type</label>
                <div className="type-toggle">
                  {["NEWS","EVENT"].map(k => (
                    <button key={k} type="button" onClick={() => set("kind", k)}
                      className={form.kind === k ? "selected" : ""}>
                      {k === "NEWS" ? "📰 News Article" : "📅 Event"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field-group span-2">
                <label>Title *</label>
                <input value={String(form.title || "")} onChange={e => set("title", e.target.value)} required />
              </div>
              <div className="field-group span-2">
                <label>Summary</label>
                <input value={String(form.summary || "")} onChange={e => set("summary", e.target.value)} />
              </div>
              {form.kind === "EVENT" && (
                <>
                  <div className="field-group">
                    <label>Event Date &amp; Time</label>
                    <input type="datetime-local" value={String(form.eventDate || "")} onChange={e => set("eventDate", e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>Venue</label>
                    <input value={String(form.eventVenue || "")} onChange={e => set("eventVenue", e.target.value)} />
                  </div>
                </>
              )}
              <div className="field-group span-2">
                <label>Cover Image URL</label>
                <input value={String(form.imageUrl || "")} onChange={e => set("imageUrl", e.target.value)} placeholder="https://…" />
              </div>
              <div className="field-group span-2">
                <label>Body *</label>
                <textarea rows={10} value={String(form.body || "")} onChange={e => set("body", e.target.value)} required />
              </div>
              <div className="field-group">
                <label className="toggle-row">
                  <input type="checkbox" checked={Boolean(form.published)} onChange={e => set("published", e.target.checked)} />
                  Published
                </label>
              </div>
            </div>

            {error && <div className="alert error" style={{ marginTop: 18 }}>⚠️ {error}</div>}
          </div>

          <div className="admin-form-card-footer">
            <div className="afc-left">
              <button className="btn green" type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save Changes"}
              </button>
              <a href="/admin/posts" className="btn ghost">Cancel</a>
            </div>
            <div className="afc-right">
              <button type="button" className="btn danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
