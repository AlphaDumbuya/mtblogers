"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Payout {
  id: string;
  payoutCode: string;
  beneficiaryName: string;
  amount: number | string;
  method: string | null;
  paidAt: Date | string;
  proofUrl: string | null;
  request: { id: string; member?: { fullName: string } } | null;
}

export default function PayoutsPageClient({ 
  initialPayouts, 
  total, 
  withProof 
}: { 
  initialPayouts: any[];
  total: number;
  withProof: number;
}) {
  const [payouts, setPayouts] = useState(initialPayouts);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openMenu]);

  function money(n: number) {
    return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  async function deletePayout(id: string) {
    if (!confirm("Delete this payout record? This cannot be undone.")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/payouts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setPayouts(payouts.filter(p => p.id !== id));
      setOpenMenu(null);
    } catch (error) {
      alert("Error: " + (error as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Payouts</h1>
        <Link href="/admin/payouts/new" className="btn">+ Record Payout</Link>
      </div>
      <div className="stats">
        <div className="stat-card">
          <div className="label">Total Disbursed</div>
          <div className="value">{money(total)}</div>
        </div>
        <div className="stat-card blue">
          <div className="label">Payout Records</div>
          <div className="value">{payouts.length}</div>
        </div>
        <div className="stat-card green">
          <div className="label">With Proof</div>
          <div className="value">{withProof}</div>
        </div>
      </div>
      <div className="panel">
        <h2>Disbursements</h2>
        {payouts.length === 0 ? (
          <div className="empty">
            No payouts recorded yet. When the fund helps a member,{" "}
            <a href="/admin/payouts/new" style={{ color: "#1c9366" }}>record it here</a>{" "}
            to keep the balance transparent.
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Code</th><th>Beneficiary</th><th>Request / Member</th>
                    <th>Amount</th><th>Method</th><th>Date</th><th>Proof</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.payoutCode}</td>
                      <td style={{ fontWeight: 600 }}>{p.beneficiaryName}</td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>
                        {p.request ? (
                          <Link href={`/admin/requests/${p.request.id}`} style={{ color: "#1c9366", textDecoration: "none" }}>
                            {p.request.member?.fullName}
                          </Link>
                        ) : "—"}
                      </td>
                      <td style={{ fontWeight: 800, color: "#1c9366" }}>{money(Number(p.amount))}</td>
                      <td>{p.method || "—"}</td>
                      <td style={{ fontSize: 12 }}>{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: "center" }}>
                        {p.proofUrl ? (
                          <a
                            href={p.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Click to view full receipt / proof"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              textDecoration: "none",
                              transition: "transform 0.15s, box-shadow 0.15s",
                            }}
                          >
                            <img
                              src={p.proofUrl}
                              alt="Receipt"
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 4,
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#166534" }}>Receipt ↗</span>
                          </a>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td style={{ position: "relative", textAlign: "center" }}>
                        <div ref={openMenu === p.id ? menuRef : null}>
                          <button 
                            className="btn-more"
                            onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                            disabled={deleting === p.id}
                          >
                            ⋮
                          </button>
                          {openMenu === p.id && (
                            <div className="action-menu">
                              <Link href={`/admin/payouts/${p.id}/edit`}>Edit</Link>
                              <div className="divider"></div>
                              <button 
                                className="delete"
                                onClick={() => deletePayout(p.id)}
                                disabled={deleting === p.id}
                              >
                                {deleting === p.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
