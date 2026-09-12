"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../Toast";
import { Dialog } from "../../Dialog";

const TAGS = ["UPDATE", "IMPORTANT", "EVENT"];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [form, setForm] = useState({ tag: "UPDATE", title: "", body: "", published: true });
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.body) {
      showError("Title and body are required");
      return;
    }
    setShowDialog(true);
  }

  async function confirmSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      success("Announcement created successfully!");
      router.push("/admin/announcements");
      router.refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to create announcement");
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>New Announcement</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          <a href="/admin/announcements" style={{ color: "#1c9366", textDecoration: "none" }}>Announcements</a>
          <span style={{ color: "#94a3b8", margin: "0 6px" }}>/</span>
          <span style={{ color: "#64748b" }}>New</span>
        </p>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-card-header">
          <h2>Announcement details</h2>
          <p>Published announcements appear on the public site</p>
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
                <input value={form.title} onChange={e => set("title", e.target.value)}
                  placeholder="Announcement title" required />
              </div>
              <div className="field-group span-2">
                <label>Body *</label>
                <textarea rows={6} value={form.body} onChange={e => set("body", e.target.value)}
                  placeholder="Full announcement text…" required />
              </div>
              <div className="field-group">
                <label className="toggle-row">
                  <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
                  Publish immediately (visible on public site)
                </label>
              </div>
            </div>
          </div>

          <div className="admin-form-card-footer">
            <div className="afc-left">
              <button className="btn green" type="submit" disabled={loading}>
                {loading ? "Posting…" : "Post Announcement"}
              </button>
            </div>
            <div className="afc-right">
              <a href="/admin/announcements" className="btn ghost">Cancel</a>
            </div>
          </div>
        </form>
      </div>

      <Dialog
        isOpen={showDialog}
        title="Post Announcement?"
        message={`Are you sure you want to create this announcement? ${form.published ? "It will be posted immediately." : "It will be saved as a draft."}`}
        confirmText="Post"
        cancelText="Cancel"
        onConfirm={confirmSubmit}
        onCancel={() => setShowDialog(false)}
        isLoading={loading}
      />
    </>
  );
}
