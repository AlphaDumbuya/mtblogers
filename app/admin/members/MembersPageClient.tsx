"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Member {
  id: string;
  memberCode: string;
  fullName: string;
  phone: string;
  email: string | null;
  district: string | null;
  photoUrl?: string | null;
  status: string;
  _count: { contributions: number; requests: number };
}

export default function MembersPageClient({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState(initialMembers);
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

  async function deleteMember(id: string) {
    if (!confirm("Are you sure you want to delete this member? This action cannot be undone.")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setMembers(members.filter(m => m.id !== id));
      setOpenMenu(null);
    } catch (error) {
      alert("Error deleting member: " + (error as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Members</h1>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: "#64748b" }}>{members.length} registered member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/members/new" className="btn">+ Add Member</Link>
      </div>

      <div className="panel">
        {members.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">👥</span>
            No members yet.{" "}
            <Link href="/admin/members/new" style={{ color: "var(--green)" }}>Add the first one.</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>District</th>
                  <th>Status</th>
                  <th>Contributions</th>
                  <th>Requests</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="mono">
                      <Link href={`/admin/members/${m.id}`} style={{ color: "var(--green)", textDecoration: "none" }}>
                        {m.memberCode}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/members/${m.id}`} style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, textDecoration: "none", color: "var(--navy)" }}>
                        {m.photoUrl ? (
                          <img
                            src={m.photoUrl}
                            alt={m.fullName}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1.5px solid #d5dee8",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                            color: "#475569",
                            fontSize: 12,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {m.fullName ? m.fullName.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                        <span>{m.fullName}</span>
                      </Link>
                    </td>
                    <td>{m.phone}</td>
                    <td style={{ color: "var(--slate)" }}>{m.email || "—"}</td>
                    <td style={{ color: "var(--slate)" }}>{m.district || "—"}</td>
                    <td><span className={`badge ${m.status}`}>{m.status}</span></td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>{m._count.contributions}</td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>{m._count.requests}</td>
                    <td style={{ position: "relative", textAlign: "center" }}>
                      <div ref={openMenu === m.id ? menuRef : null}>
                        <button 
                          className="btn-more"
                          onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                          disabled={deleting === m.id}
                        >
                          ⋮
                        </button>
                        {openMenu === m.id && (
                          <div className="action-menu">
                            <Link href={`/admin/members/${m.id}/edit`}>Edit</Link>
                            <div className="divider"></div>
                            <button 
                              className="delete"
                              onClick={() => deleteMember(m.id)}
                              disabled={deleting === m.id}
                            >
                              {deleting === m.id ? "Deleting..." : "Delete"}
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
        )}
      </div>
    </>
  );
}
