"use client";

import { useEffect, useState } from "react";
import { ImageUploader } from "@/app/components/ImageUploader";

const FIELDS = [
  { key: "founder_name",      label: "Founder Name",     type: "text" },
  { key: "founder_title",     label: "Founder Title",    type: "text" },
  { key: "founder_bio",       label: "Biography",        type: "textarea" },
  { key: "founder_photo_url", label: "Founder Photo",    type: "image" },
  { key: "founder_why",       label: "Why Created",      type: "textarea" },
  { key: "founder_vision",    label: "Vision",           type: "textarea" },
  { key: "founder_mission",   label: "Mission",          type: "textarea" },
  { key: "founder_message",   label: "Message",          type: "textarea" },
];

export default function SiteSettingsPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/site").then(r => r.json()).then(d => setConfig(d.config || {}));
  }, []);

  function set(k: string, v: string) { setConfig(c => ({ ...c, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError("");
    try {
      const res = await fetch("/api/admin/site", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Save failed.");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally { setSaving(false); }
  }

  const F: React.CSSProperties = { width: "100%", padding: "10px 13px", border: "1.5px solid #d5dee8", borderRadius: 9, fontSize: 14, background: "#f8fafc" };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>Site Settings — Founder Page</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          Manage founder biography, photo, and mission statements displayed on the public About page.
        </p>
      </div>

      <div className="panel">
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 18 }}>
            {FIELDS.map(({ key, label, type }) => (
              <div key={key}>
                {type === "image" ? (
                  <ImageUploader
                    value={config[key] || ""}
                    onChange={(url) => set(key, url)}
                    uploaderType="avatarUploader"
                    label={label}
                    hint="Upload or paste a profile photo for the Founder profile (square 400×400+ recommended)"
                    maxHeight={220}
                  />
                ) : (
                  <>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5 }}>
                      {label}
                    </label>
                    {type === "textarea" ? (
                      <textarea
                        rows={3}
                        style={{ ...F, resize: "vertical" }}
                        value={config[key] || ""}
                        onChange={e => set(key, e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                      />
                    ) : (
                      <input
                        style={F}
                        value={config[key] || ""}
                        onChange={e => set(key, e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 9, marginTop: 16 }}>{error}</div>}
          {saved && <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 14px", borderRadius: 9, marginTop: 16, fontWeight: 700 }}>✅ Saved successfully!</div>}

          <div style={{ marginTop: 20 }}>
            <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
