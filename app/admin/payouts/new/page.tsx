"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../Toast";
import { Dialog } from "../../Dialog";

function PayoutFormContent() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const sp = useSearchParams();
  const [form, setForm] = useState({
    beneficiaryName: sp.get("name")      || "",
    amount:          sp.get("amount")    || "",
    method:          "Mobile Money",
    requestId:       sp.get("requestId") || "",
    note:            "",
    paidAt:          new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.beneficiaryName || !form.amount) {
      showError("Beneficiary name and amount are required");
      return;
    }
    setShowDialog(true);
  }

  async function confirmSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      success("Payout recorded successfully!");
      router.push("/admin/payouts");
      router.refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to record payout");
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#060d1f" }}>Record Payout</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          <a href="/admin/payouts" style={{ color: "#1c9366", textDecoration: "none" }}>Payouts</a>
          <span style={{ color: "#94a3b8", margin: "0 6px" }}>/</span>
          <span style={{ color: "#64748b" }}>Record payout</span>
        </p>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-card-header">
          <h2>Payout details</h2>
          <p>Record a fund disbursement to a member</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-card-body">
            <div className="form-grid">
              <div className="field-group">
                <label>Beneficiary Name *</label>
                <input value={form.beneficiaryName} onChange={e => set("beneficiaryName", e.target.value)}
                  placeholder="Full name of recipient" required />
              </div>
              <div className="field-group">
                <label>Amount (SLE) *</label>
                <input type="number" min="1" step="0.01" value={form.amount}
                  onChange={e => set("amount", e.target.value)} placeholder="e.g. 500" required />
              </div>
              <div className="field-group">
                <label>Payment Method</label>
                <select value={form.method} onChange={e => set("method", e.target.value)}>
                  <option>Mobile Money</option>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field-group">
                <label>Date of Payout</label>
                <input type="date" value={form.paidAt} onChange={e => set("paidAt", e.target.value)} />
              </div>
              <div className="field-group span-2">
                <label>Assistance Request ID <span style={{ fontWeight: 400, textTransform: "none" }}>(optional — links this payout)</span></label>
                <input value={form.requestId} onChange={e => set("requestId", e.target.value)}
                  placeholder="Leave blank if not linked to a request" />
              </div>
              <div className="field-group span-2">
                <label>Notes</label>
                <textarea rows={3} value={form.note} onChange={e => set("note", e.target.value)}
                  placeholder="Any relevant notes…" />
              </div>
            </div>
          </div>

          <div className="admin-form-card-footer">
            <div className="afc-left">
              <button className="btn green" type="submit" disabled={loading}>
                {loading ? "Recording…" : "Record Payout"}
              </button>
            </div>
            <div className="afc-right">
              <a href="/admin/payouts" className="btn ghost">Cancel</a>
            </div>
          </div>
        </form>
      </div>

      <Dialog
        isOpen={showDialog}
        title="Record Payout?"
        message={`Are you sure you want to record a payout of SLE ${parseFloat(form.amount).toLocaleString() || "0"} to ${form.beneficiaryName}?`}
        confirmText="Record"
        cancelText="Cancel"
        onConfirm={confirmSubmit}
        onCancel={() => setShowDialog(false)}
        isLoading={loading}
      />
    </>
  );
}

export default function NewPayoutPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "24px" }}>
        <div style={{ fontSize: 14, color: "#64748b" }}>Loading…</div>
      </div>
    }>
      <PayoutFormContent />
    </Suspense>
  );
}
