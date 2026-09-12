"use client";

import { useState } from "react";

const STATUSES = ["", "PENDING", "PAID", "FAILED", "CANCELLED"];

interface ContributionsFilterProps {
  q: string;
  status: string;
}

export default function ContributionsFilter({ q, status }: ContributionsFilterProps) {
  const [searchValue, setSearchValue] = useState(q);
  const [statusValue, setStatusValue] = useState(status);

  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--line)",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: 24,
      boxShadow: "0 2px 8px rgba(15,42,71,0.04)",
    }}>
      <form method="get" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        alignItems: "flex-end",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="q" style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}>Search</label>
          <input 
            id="q" 
            name="q" 
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Name, phone or reference…"
            style={{
              padding: "11px 14px",
              border: "1.5px solid #d5dee8",
              borderRadius: "9px",
              fontSize: "14px",
              background: "#f8fafc",
              color: "#060d1f",
              fontFamily: "inherit",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onFocus={e => {
              (e.target as HTMLElement).style.borderColor = "#1c9366";
              (e.target as HTMLElement).style.background = "#fff";
            }}
            onBlur={e => {
              (e.target as HTMLElement).style.borderColor = "#d5dee8";
              (e.target as HTMLElement).style.background = "#f8fafc";
            }}
          />
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="status" style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}>Status</label>
          <select 
            id="status" 
            name="status" 
            value={statusValue}
            onChange={e => setStatusValue(e.target.value)}
            style={{
              padding: "11px 14px",
              border: "1.5px solid #d5dee8",
              borderRadius: "9px",
              fontSize: "14px",
              background: "#f8fafc",
              color: "#060d1f",
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onFocus={e => {
              (e.target as HTMLElement).style.borderColor = "#1c9366";
              (e.target as HTMLElement).style.background = "#fff";
            }}
            onBlur={e => {
              (e.target as HTMLElement).style.borderColor = "#d5dee8";
              (e.target as HTMLElement).style.background = "#f8fafc";
            }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || "All statuses"}</option>
            ))}
          </select>
        </div>

        <button 
          className="btn green" 
          type="submit"
          style={{ padding: "11px 22px" }}
        >
          🔍 Filter
        </button>
      </form>
    </div>
  );
}
