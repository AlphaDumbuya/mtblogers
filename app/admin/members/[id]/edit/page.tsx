"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/app/components/ImageUploader";

const DISTRICTS = [
  "Freetown","Bo","Kenema","Makeni","Koidu","Bonthe","Moyamba",
  "Port Loko","Kailahun","Kono","Tonkolili","Bombali","Kambia",
  "Karene","Falaba","Koinadugu",
];

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string,unknown> | null>(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    params.then(({ id: rid }) => {
      setId(rid);
      fetch(`/api/admin/members/${rid}`).then(r => r.json()).then(d => {
        const m = d.member;
        setForm({
          fullName: m.fullName, phone: m.phone, email: m.email || "",
          gender: m.gender || "", district: m.district || "",
          occupation: m.occupation || "", isDiaspora: m.isDiaspora,
          status: m.status, photoUrl: m.photoUrl || "",
          dateOfBirth: m.dateOfBirth ? m.dateOfBirth.slice(0, 10) : "",
        });
      });
    });
  }, []);

  function set(k: string, v: unknown) { setForm((f) => f ? { ...f, [k]: v } : f); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const body = { ...form, ...(pin ? { pin } : {}) };
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/admin/members/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
      setSaving(false);
    }
  }

  if (!form) return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>Edit Member</h1>
      </div>
      <div className="panel"><p style={{ color: "var(--slate)" }}>Loading…</p></div>
    </>
  );

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>Edit Member</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          <a href="/admin/members" style={{ color: "#1c9366", textDecoration: "none" }}>Members</a>
          <span style={{ color: "#94a3b8", margin: "0 6px" }}>/</span>
          <a href={`/admin/members/${id}`} style={{ color: "#1c9366", textDecoration: "none" }}>Profile</a>
          <span style={{ color: "#94a3b8", margin: "0 6px" }}>/</span>
          <span style={{ color: "#64748b" }}>Edit</span>
        </p>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-card-header">
          <h2>Member details</h2>
          <p>Fields marked * are required</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-card-body">
            <div className="form-grid">
              <div className="field-group">
                <label>Full Name *</label>
                <input value={String(form.fullName || "")} onChange={e => set("fullName", e.target.value)} required />
              </div>
              <div className="field-group">
                <label>Phone *</label>
                <input value={String(form.phone || "")} onChange={e => set("phone", e.target.value)} required />
              </div>
              <div className="field-group">
                <label>Email</label>
                <input type="email" value={String(form.email || "")} onChange={e => set("email", e.target.value)} />
              </div>
              <div className="field-group">
                <label>Gender</label>
                <select value={String(form.gender || "")} onChange={e => set("gender", e.target.value)}>
                  <option value="">—</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="field-group">
                <label>Date of Birth</label>
                <input type="date" value={String(form.dateOfBirth || "")} onChange={e => set("dateOfBirth", e.target.value)} />
              </div>
              <div className="field-group">
                <label>District</label>
                <select value={String(form.district || "")} onChange={e => set("district", e.target.value)}>
                  <option value="">—</option>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Occupation</label>
                <input value={String(form.occupation || "")} onChange={e => set("occupation", e.target.value)} />
              </div>
              <div className="field-group">
                <label>Status</label>
                <select value={String(form.status || "")} onChange={e => set("status", e.target.value)}>
                  <option>ACTIVE</option><option>INACTIVE</option><option>SUSPENDED</option>
                </select>
              </div>
              <div className="field-group">
                <label>Reset PIN <span style={{ fontWeight: 400, textTransform: "none" }}>(leave blank to keep)</span></label>
                <input type="password" maxLength={6} pattern="[0-9]{6}" inputMode="numeric"
                  value={pin} onChange={e => setPin(e.target.value)} placeholder="New 6-digit PIN" />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label className="toggle-row">
                <input type="checkbox" checked={Boolean(form.isDiaspora)} onChange={e => set("isDiaspora", e.target.checked)} />
                Diaspora member (based outside Sierra Leone)
              </label>
            </div>

            <div style={{ marginTop: 24 }}>
              <ImageUploader
                value={String(form.photoUrl || "")}
                onChange={url => set("photoUrl", url)}
                uploaderType="avatarUploader"
                label="Profile Photo (Optional)"
                hint="Recommended: square image at least 400×400 pixels"
                maxHeight={200}
              />
            </div>

            {error && <div className="alert error" style={{ marginTop: 18 }}>⚠️ {error}</div>}
          </div>

          <div className="admin-form-card-footer">
            <div className="afc-left">
              <button className="btn green" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
            <div className="afc-right">
              <a href={`/admin/members/${id}`} className="btn ghost">Cancel</a>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
