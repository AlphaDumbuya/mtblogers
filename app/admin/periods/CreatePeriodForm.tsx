"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CreatePeriodForm({
  defaultYear,
  defaultMonth,
}: {
  defaultYear: number;
  defaultMonth: number;
}) {
  const router = useRouter();
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [label, setLabel] = useState(`${MONTHS[defaultMonth - 1]} ${defaultYear}`);
  const [amountExpected, setAmountExpected] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleMonthChange(newMonth: number) {
    setMonth(newMonth);
    setLabel(`${MONTHS[newMonth - 1]} ${year}`);
  }

  function handleYearChange(newYear: number) {
    setYear(newYear);
    setLabel(`${MONTHS[month - 1]} ${newYear}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          label,
          dueDate: dueDate || null,
          amountExpected: amountExpected ? Number(amountExpected) : null,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save period.");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save period.");
    } finally {
      setLoading(false);
    }
  }

  const F: React.CSSProperties = {
    width: "100%",
    padding: "10px 13px",
    border: "1.5px solid #d5dee8",
    borderRadius: 9,
    fontSize: 14,
    background: "#f8fafc",
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, alignItems: "end" }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5 }}>Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            style={F}
            required
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5 }}>Month</label>
          <select
            value={month}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            style={F}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5 }}>Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={F}
            required
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5 }}>Expected Amount (SLE)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 500"
            value={amountExpected}
            onChange={(e) => setAmountExpected(e.target.value)}
            style={F}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5 }}>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={F}
          />
        </div>
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Set as active period
          </label>
          <button className="btn" type="submit" disabled={loading} style={{ width: "100%", height: 42 }}>
            {loading ? "Saving..." : "Create / Update"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 9, marginTop: 12, fontSize: 13 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 14px", borderRadius: 9, marginTop: 12, fontSize: 13, fontWeight: 700 }}>
          ✅ Period saved successfully!
        </div>
      )}
    </form>
  );
}
