"use client";

import { useState } from "react";
import Link from "next/link";

interface Request {
  id: string;
  requestCode: string;
  title: string;
  category: string;
  amountRequested: number | string;
  status: string;
  memberId: string;
  member: { fullName: string };
  _count: { documents: number };
}

export default function RequestsPageClient({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function money(n: number) {
    return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const statusOrder: Record<string, number> = {
    SUBMITTED: 0, UNDER_REVIEW: 1, APPROVED: 2, DISBURSED: 3, REJECTED: 4,
  };
  const sorted = [...requests].sort(
    (a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
  );

  async function deleteRequest(id: string) {
    if (!confirm("Delete this request? This action cannot be undone.")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setRequests(requests.filter(r => r.id !== id));
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
        <h1 style={{ margin: 0 }}>Assistance Requests</h1>
        <Link href="/admin/requests/new" className="btn">+ New Request</Link>
      </div>
      <div className="panel">
        <h2>
          {requests.length} request{requests.length === 1 ? "" : "s"}
        </h2>
        {requests.length === 0 ? (
          <div className="empty">
            No assistance requests yet. When a member needs help, their request
            will appear here for review.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Member</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Requested</th>
                  <th>Docs</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{r.requestCode}</td>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={`/admin/members/${r.memberId}`} style={{ color: "#1c9366", textDecoration: "none" }}>
                        {r.member.fullName}
                      </Link>
                    </td>
                    <td>{r.category}</td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</td>
                    <td style={{ fontWeight: 700, color: "#1c9366" }}>{money(Number(r.amountRequested))}</td>
                    <td style={{ textAlign: "center" }}>{r._count.documents}</td>
                    <td>
                      <span className={`badge ${r.status}`}>{r.status.replace("_", " ")}</span>
                    </td>
                    <td style={{ position: "relative", textAlign: "center" }}>
                      <button 
                        className="btn-more"
                        onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}
                        disabled={deleting === r.id}
                      >
                        ⋮
                      </button>
                      {openMenu === r.id && (
                        <div className="action-menu">
                          <Link href={`/admin/requests/${r.id}`}>Review</Link>
                          <Link href={`/admin/requests/${r.id}/edit`}>Edit</Link>
                          <div className="divider"></div>
                          <button 
                            className="delete"
                            onClick={() => deleteRequest(r.id)}
                            disabled={deleting === r.id}
                          >
                            {deleting === r.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
