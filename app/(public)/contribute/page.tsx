"use client";

import { useState } from "react";
import type { Metadata } from "next";

const CONTRIBUTION_TYPES = [
  "Monthly Contribution",
  "Birthday Contribution",
  "Wedding Contribution",
  "Emergency Contribution",
  "Sickness / Medical Support",
  "Special Project Contribution",
  "Funeral / Bereavement Support",
  "Education / School Support",
  "Community / Welfare Support",
  "General Contribution",
  "Other",
];

export default function ContributePage() {
  const [type, setType] = useState("");
  const [other, setOther] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const contributionType = type === "Other" ? other.trim() : type;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contributionType,
          amount: Number(form.get("amount")),
          name: String(form.get("name") || "").trim(),
          phone: String(form.get("phone") || "").trim(),
          email: String(form.get("email") || "").trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to start payment.");
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment.");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <h1>💳 Make a Contribution</h1>
          <p>Support your community — every gift helps members through hardship.</p>
        </div>
      </div>

      <div className="pub-form-shell">
        {/* Hero side */}
        <div className="pub-form-hero">
          <div className="eyebrow">🤝 Community Contribution Portal</div>
          <h1>
            We rise by <span>lifting</span> each other
          </h1>
          <p className="lead">
            A fund built by us, for us. Members pool their contributions so that whenever
            anyone among us faces hardship, we can step in and help — standing on our own,
            together.
          </p>

          <ul className="features">
            {[
              "Contribute any amount securely with mobile money",
              "Funds go directly to members in need",
              "Every gift is tracked and reconciled — full transparency",
            ].map((f) => (
              <li key={f}>
                <span className="tick">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <div className="trust">
            <div className="stat">
              <b>100%</b>
              <span>Reconciled</span>
            </div>
            <div className="stat">
              <b>SLE</b>
              <span>Local currency</span>
            </div>
            <div className="stat">
              <b>Secure</b>
              <span>Encrypted checkout</span>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="form-card">
          <div className="form-card-header">
            <h2>Contribution Details</h2>
            <p>Fill in the details below to continue to secure payment.</p>
          </div>
          <div className="form-card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="field-label" htmlFor="type">
                  What are you contributing for?
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="">— Select contribution type —</option>
                  {CONTRIBUTION_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              {type === "Other" && (
                <div className="form-group">
                  <label className="field-label" htmlFor="other">
                    Please describe the contribution
                  </label>
                  <input
                    id="other"
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    placeholder="e.g. Family support"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="field-label" htmlFor="amount">
                  Contribution amount
                </label>
                <div className="amount-row">
                  <span className="cur">SLE</span>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter any amount"
                    required
                  />
                </div>
                <p className="form-help">You can contribute any amount.</p>
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="name">
                  Your full name
                </label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid var(--gray-300)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--gray-50)",
                  overflow: "hidden",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                  onFocusCapture={e => {
                    const wrap = e.currentTarget as HTMLElement;
                    wrap.style.borderColor = "var(--green-500)";
                    wrap.style.background = "#fff";
                    wrap.style.boxShadow = "0 0 0 3px rgba(232,101,10,0.15)";
                  }}
                  onBlurCapture={e => {
                    const wrap = e.currentTarget as HTMLElement;
                    wrap.style.borderColor = "var(--gray-300)";
                    wrap.style.background = "var(--gray-50)";
                    wrap.style.boxShadow = "none";
                  }}
                >
                  <span style={{
                    padding: "11px 13px",
                    fontSize: 18,
                    color: "var(--navy-400)",
                    background: "var(--navy-50)",
                    borderRight: "1.5px solid var(--gray-300)",
                    userSelect: "none",
                    lineHeight: 1,
                  }}>👤</span>
                  <input
                    id="name"
                    name="name"
                    placeholder="e.g. Aminata Koroma"
                    required
                    style={{
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      flex: 1,
                      padding: "11px 14px",
                      fontSize: 14.5,
                      color: "var(--gray-900)",
                      fontFamily: "var(--font)",
                    }}
                  />
                </div>
                <p className="form-help">Enter the name to appear on your contribution record.</p>
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="phone">
                  Mobile money number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. 076 123 456"
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="email">
                  Email address <span style={{ color: "var(--gray-500)", fontWeight: 400 }}>(optional — for receipt)</span>
                </label>
                <input id="email" name="email" type="email" placeholder="your@email.com" />
              </div>

              <button className="btn-submit" type="submit" disabled={loading || !type}>
                {loading ? "CONNECTING TO PAYMENT..." : "CONTINUE TO PAYMENT →"}
              </button>

              <div className="form-notice">
                <span>🔒</span>
                <span>
                  Your contribution type, amount and details are attached to the payment
                  record so every gift can be reconciled and directed to members in need.
                </span>
              </div>

              {error && <div className="form-error">{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
