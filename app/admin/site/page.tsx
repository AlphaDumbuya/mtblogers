"use client";

import { useEffect, useState } from "react";

const FIELDS = [
  { key: "founder_name",      label: "Founder Name",     type: "text" },
  { key: "founder_title",     label: "Founder Title",    type: "text" },
  { key: "founder_bio",       label: "Biography",        type: "textarea" },
  { key: "founder_photo_url", label: "Photo URL",        type: "text" },
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
      <h1>Site Settings — Founder Page</h1>
      <div className="panel">
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 18 }}>
            {FIELDS.map(({ key, label, type }) => (
              <div key={key}>
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
                    placeholder={key === "founder_photo_url" ? "https://..." : `Enter ${label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}
          </div>

          {config["founder_photo_url"] && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5 }}>Preview</label>
              <img
                src={config["founder_photo_url"]}
                alt="Founder preview"
                style={{ width: 100, height: 100, borderRadius: 12, objectFit: "cover", border: "2px solid #d5dee8" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

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
