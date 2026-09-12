"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../Toast";
import { Dialog } from "../../Dialog";

const DISTRICTS = [
  "Freetown","Bo","Kenema","Makeni","Koidu","Bonthe","Moyamba",
  "Port Loko","Kailahun","Kono","Tonkolili","Bombali","Kambia",
  "Karene","Falaba","Koinadugu",
];

export default function NewMemberPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", gender: "", dateOfBirth: "",
    district: "", occupation: "", isDiaspora: false, pin: "",
  });

  function set(k: string, v: unknown) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.pin) {
      showError("Full name, phone, and PIN are required");
      return;
    }
    if (form.pin.length !== 6) {
      showError("PIN must be 6 digits");
      return;
    }
    setShowDialog(true);
  }

  async function confirmSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      success(`Member ${form.fullName} added successfully!`);
      router.push("/admin/members");
      router.refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to add member");
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>Add Member</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          <a href="/admin/members" style={{ color: "#1c9366", textDecoration: "none" }}>Members</a>
          <span style={{ color: "#94a3b8", margin: "0 6px" }}>/</span>
          <span style={{ color: "#64748b" }}>New member</span>
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
                <input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Full name" required />
              </div>
              <div className="field-group">
                <label>Phone (Mobile Money) *</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="076 123 456" required />
              </div>
              <div className="field-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="Optional" />
              </div>
              <div className="field-group">
                <label>Gender</label>
                <select value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option value="">— Select —</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="field-group">
                <label>Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} />
              </div>
              <div className="field-group">
                <label>District</label>
                <select value={form.district} onChange={e => set("district", e.target.value)}>
                  <option value="">— Select —</option>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Occupation</label>
                <input value={form.occupation} onChange={e => set("occupation", e.target.value)} placeholder="Optional" />
              </div>
              <div className="field-group">
                <label>Portal PIN <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(6 digits)</span></label>
                <input type="password" maxLength={6} pattern="[0-9]{6}" inputMode="numeric"
                  value={form.pin} onChange={e => set("pin", e.target.value)} placeholder="Set member login PIN" required />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label className="toggle-row">
                <input type="checkbox" checked={form.isDiaspora} onChange={e => set("isDiaspora", e.target.checked)} />
                Diaspora member (based outside Sierra Leone)
              </label>
            </div>
          </div>

          <div className="admin-form-card-footer">
            <div className="afc-left">
              <button className="btn green" type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create Member"}
              </button>
            </div>
            <div className="afc-right">
              <a href="/admin/members" className="btn ghost">Cancel</a>
            </div>
          </div>
        </form>
      </div>

      <Dialog
        isOpen={showDialog}
        title="Add Member?"
        message={`Are you sure you want to add ${form.fullName} as a member? They will receive member code and can access their portal with the PIN.`}
        confirmText="Add Member"
        cancelText="Cancel"
        onConfirm={confirmSubmit}
        onCancel={() => setShowDialog(false)}
        isLoading={loading}
      />
    </>
  );
}
