"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STEPS = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "DISBURSED", "REJECTED"];

function money(n: number) {
  return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RequestDetailClient({ request }: { request: any }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(request.status);
  const [notes, setNotes] = useState<string>(request.decisionNotes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate() {
    setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/admin/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, decisionNotes: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally { setSaving(false); }
  }

  return (
    <div className="detail-grid">
      {/* Left — details */}
      <div>
        <div className="panel">
          <h2>Request Details</h2>
          <div className="detail-list">
            {[
              ["Category",         request.category],
              ["Amount Requested", <strong style={{ color: "var(--green)" }}>{money(Number(request.amountRequested))}</strong>],
              ["Member",           <a href={`/admin/members/${request.memberId}`} style={{ color: "var(--green)", fontWeight: 700 }}>{request.member.fullName}</a>],
              ["Phone",            request.member.phone],
              ["Submitted",        new Date(request.createdAt).toLocaleString()],
              ...(request.reviewedBy ? [["Reviewed by", request.reviewedBy]] : []),
            ].map(([k, v]) => (
              <div className="detail-row" key={String(k)}>
                <span className="key">{k}</span>
                <span className="val">{v}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, padding: "16px 18px", background: "#f8fafc", borderRadius: 10, fontSize: 14, lineHeight: 1.8, color: "#334155", border: "1px solid var(--line)" }}>
            {request.description}
          </div>
        </div>

        {/* Supporting documents */}
        {request.documents.length > 0 && (
          <div className="panel">
            <h2>Documents</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {request.documents.map((d: any) => {
                const isImage = d.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(d.url);
                return (
                  <div key={d.id}>
                    {isImage ? (
                      <div style={{
                        borderRadius: 10,
                        overflow: "hidden",
                        border: "1px solid var(--line)",
                        background: "#f1f5f9",
                        display: "flex",
                        flexDirection: "column",
                      }}>
                        <img
                          src={d.url}
                          alt={d.name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: 300,
                            width: "auto",
                            height: "auto",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                        <a href={d.url} target="_blank" rel="noreferrer"
                          style={{
                            padding: "8px 14px",
                            textAlign: "center",
                            borderTop: "1px solid var(--line)",
                            textDecoration: "none",
                            color: "var(--green)",
                            fontWeight: 600,
                            fontSize: 12,
                            background: "#f8fafc",
                          }}>
                          📥 Download
                        </a>
                      </div>
                    ) : (
                      <a href={d.url} target="_blank" rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          border: "1px solid var(--line)",
                          borderRadius: 10,
                          textDecoration: "none",
                          color: "var(--navy)",
                          fontSize: 14,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}>
                        <span style={{ fontSize: 20 }}>📎</span>
                        <span style={{ flex: 1 }}>{d.name}</span>
                        <span style={{ fontSize: 12, color: "var(--slate)" }}>↗ Open</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payouts */}
        {request.payouts.length > 0 && (
          <div className="panel">
            <h2>Payouts</h2>
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>Code</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead>
                <tbody>
                  {request.payouts.map((p: any) => (
                    <tr key={p.id}>
                      <td className="mono">{p.payoutCode}</td>
                      <td style={{ fontWeight: 700, color: "var(--green)" }}>{money(Number(p.amount))}</td>
                      <td>{p.method || "—"}</td>
                      <td>{new Date(p.paidAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Right — actions */}
      <div>
        <div className="panel">
          <h2>Update Status</h2>

          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 4, fontSize: 12, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Current status
            </div>
            <span className={`badge ${request.status}`} style={{ fontSize: 13, padding: "5px 14px" }}>
              {request.status.replace("_", " ")}
            </span>
          </div>

          <div style={{ display: "grid", gap: 6, marginBottom: 18 }}>
            {STATUS_STEPS.map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                style={{
                  padding: "10px 14px",
                  border: `2px solid ${status === s ? "var(--green)" : "var(--line)"}`,
                  borderRadius: 9,
                  background: status === s ? "var(--green-lt)" : "#fff",
                  color: status === s ? "#12694a" : "var(--navy)",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  textAlign: "left", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: status === s ? "var(--green)" : "var(--line)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, flexShrink: 0 }}>
                  {status === s ? "✓" : ""}
                </span>
                {s.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="field-group" style={{ marginBottom: 16 }}>
            <label>Decision Notes</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes about the decision…" />
          </div>

          {error && <div className="alert error" style={{ marginBottom: 12 }}>⚠️ {error}</div>}

          <button className="btn green" onClick={handleUpdate} disabled={saving}
            style={{ width: "100%", justifyContent: "center" }}>
            {saving ? "Updating…" : "Update Status"}
          </button>

          {(status === "APPROVED" || status === "DISBURSED") && (
            <a href={`/admin/payouts/new?requestId=${request.id}&name=${encodeURIComponent(request.member.fullName)}&amount=${request.amountRequested}`}
              className="btn secondary"
              style={{ display: "flex", width: "100%", marginTop: 8, justifyContent: "center" }}>
              💰 Record Payout
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
