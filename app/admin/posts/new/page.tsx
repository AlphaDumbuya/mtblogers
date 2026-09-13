"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../Toast";
import { Dialog } from "../../Dialog";
import { ImageUploader } from "@/app/components/ImageUploader";

export default function NewPostPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [form, setForm] = useState({
    kind: "NEWS", title: "", summary: "", body: "",
    imageUrl: "", eventDate: "", eventVenue: "", published: false,
  });
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
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      success(`${form.kind === "EVENT" ? "Event" : "News article"} created successfully!`);
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to create post");
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>New {form.kind === "EVENT" ? "Event" : "News Article"}</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          <a href="/admin/posts" style={{ color: "#1c9366", textDecoration: "none" }}>News &amp; Events</a>
          <span style={{ color: "#94a3b8", margin: "0 6px" }}>/</span>
          <span style={{ color: "#64748b" }}>New</span>
        </p>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-card-header">
          <h2>Post details</h2>
          <p>Fields marked * are required</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-card-body">
            <div className="form-grid">
              <div className="field-group span-2">
                <label>Type *</label>
                <div className="type-toggle">
                  {["NEWS", "EVENT"].map(k => (
                    <button key={k} type="button" onClick={() => set("kind", k)}
                      className={form.kind === k ? "selected" : ""}>
                      {k === "NEWS" ? "📰 News Article" : "📅 Event"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group span-2">
                <label>Title *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)}
                  placeholder="Post title" required />
              </div>

              <div className="field-group span-2">
                <label>Summary <span style={{ fontWeight: 400, textTransform: "none" }}>(shown in cards)</span></label>
                <input value={form.summary} onChange={e => set("summary", e.target.value)}
                  placeholder="Short description…" />
              </div>

              {form.kind === "EVENT" && (
                <>
                  <div className="field-group">
                    <label>Event Date &amp; Time</label>
                    <input type="datetime-local" value={form.eventDate}
                      onChange={e => set("eventDate", e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>Venue</label>
                    <input value={form.eventVenue} onChange={e => set("eventVenue", e.target.value)}
                      placeholder="Location or Online" />
                  </div>
                </>
              )}

              <div className="field-group span-2">
                <ImageUploader 
                  value={form.imageUrl}
                  onChange={url => set("imageUrl", url)}
                  uploaderType="imageUploader"
                  label="Cover Image"
                  hint="Recommended: at least 1200×600 pixels for best display on all devices"
                />
              </div>

              <div className="field-group span-2">
                <label>Body *</label>
                <textarea rows={10} value={form.body} onChange={e => set("body", e.target.value)}
                  placeholder="Full content…" required />
              </div>

              <div className="field-group">
                <label className="toggle-row">
                  <input type="checkbox" checked={form.published}
                    onChange={e => set("published", e.target.checked)} />
                  Publish immediately
                </label>
              </div>
            </div>
          </div>

          <div className="admin-form-card-footer">
            <div className="afc-left">
              <button className="btn green" type="submit" disabled={loading}>
                {loading ? "Saving…" : "Create Post"}
              </button>
            </div>
            <div className="afc-right">
              <a href="/admin/posts" className="btn ghost">Cancel</a>
            </div>
          </div>
        </form>
      </div>

      <Dialog
        isOpen={showDialog}
        title="Create Post?"
        message={`Are you sure you want to create this ${form.kind === "EVENT" ? "event" : "news article"}? ${form.published ? "It will be published immediately." : "It will be saved as a draft."}`}
        confirmText="Create"
        cancelText="Cancel"
        onConfirm={confirmSubmit}
        onCancel={() => setShowDialog(false)}
        isLoading={loading}
      />
    </>
  );
}
