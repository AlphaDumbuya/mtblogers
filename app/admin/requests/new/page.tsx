"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../Toast";
import { Dialog } from "../../Dialog";

const CATEGORIES = [
  "Medical / Sickness","Funeral / Bereavement","Education / School",
  "Emergency","Wedding / Marriage","Housing / Shelter",
  "Business Support","Community Project","General Welfare","Other",
];

export default function NewRequestPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [members, setMembers] = useState<{ id: string; fullName: string; memberCode: string }[]>([]);
  const [form, setForm] = useState({
    memberId: "", category: "", title: "", description: "", amountRequested: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetch("/api/admin/members").then(r => r.json()).then(d => {
      if (d.members) setMembers(d.members);
    }).catch(() => {});
  }, []);

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.memberId || !form.category || !form.title || !form.amountRequested) {
      showError("Member, category, title, and amount are required");
      return;
    }
    setShowDialog(true);
  }

  async function confirmSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      success("Assistance request created successfully!");
      router.push("/admin/requests");
      router.refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to create request");
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>New Assistance Request</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          <a href="/admin/requests" style={{ color: "#1c9366", textDecoration: "none" }}>Requests</a>
          <span style={{ color: "#94a3b8", margin: "0 6px" }}>/</span>
          <span style={{ color: "#64748b" }}>New</span>
        </p>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-card-header">
          <h2>Request details</h2>
          <p>All fields are required unless noted</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-card-body">
            <div className="form-grid">
              <div className="field-group">
                <label>Member *</label>
                <select value={form.memberId} onChange={e => set("memberId", e.target.value)} required>
                  <option value="">— Select member —</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.memberCode})</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>Category *</label>
                <select value={form.category} onChange={e => set("category", e.target.value)} required>
                  <option value="">— Select category —</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field-group span-2">
                <label>Title *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Brief title of the request" required />
              </div>
              <div className="field-group">
                <label>Amount Requested (SLE) *</label>
                <input type="number" min="1" step="0.01" value={form.amountRequested}
                  onChange={e => set("amountRequested", e.target.value)} placeholder="e.g. 1000" required />
              </div>
              <div className="field-group span-2">
                <label>Description *</label>
                <textarea rows={6} value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Describe the situation and why assistance is needed…" required />
              </div>
            </div>
          </div>

          <div className="admin-form-card-footer">
            <div className="afc-left">
              <button className="btn green" type="submit" disabled={loading}>
                {loading ? "Submitting…" : "Submit Request"}
              </button>
            </div>
            <div className="afc-right">
              <a href="/admin/requests" className="btn ghost">Cancel</a>
            </div>
          </div>
        </form>
      </div>

      <Dialog
        isOpen={showDialog}
        title="Submit Request?"
        message="Are you sure you want to create this assistance request? It will be marked as SUBMITTED and ready for review."
        confirmText="Submit"
        cancelText="Cancel"
        onConfirm={confirmSubmit}
        onCancel={() => setShowDialog(false)}
        isLoading={loading}
      />
    </>
  );
}
