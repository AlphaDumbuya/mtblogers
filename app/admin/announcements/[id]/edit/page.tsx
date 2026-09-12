"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TAGS = ["UPDATE", "IMPORTANT", "EVENT"];

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [form, setForm] = useState({ tag: "UPDATE", title: "", body: "", published: true });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id: rid }) => setId(rid));
  }, []);

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/announcements");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this announcement? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    router.push("/admin/announcements");
    router.refresh();
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>Edit Announcement</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          <a href="/admin/announcements" style={{ color: "#1c9366", textDecoration: "none" }}>Announcements</a>
          <span style={{ color: "#94a3b8", margin: "0 6px" }}>/</span>
          <span style={{ color: "#64748b" }}>Edit</span>
        </p>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-card-header">
          <h2>Announcement details</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-card-body">
            <div className="form-grid">
              <div className="field-group">
                <label>Tag *</label>
                <div className="type-toggle">
                  {TAGS.map(t => (
                    <button key={t} type="button" onClick={() => set("tag", t)}
                      className={form.tag === t ? "selected" : ""}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field-group span-2">
                <label>Title *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)} required />
              </div>
              <div className="field-group span-2">
                <label>Body *</label>
                <textarea rows={6} value={form.body} onChange={e => set("body", e.target.value)} required />
              </div>
              <div className="field-group">
                <label className="toggle-row">
                  <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
                  Published (visible on public site)
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
              <a href="/admin/announcements" className="btn ghost">Cancel</a>
            </div>
            <div className="afc-right">
              <button type="button" className="btn danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
