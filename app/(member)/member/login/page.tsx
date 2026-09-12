"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MemberLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/member/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setLoading(false);
    }
  }

  return (
    <div className="member-login-shell">
      <div className="member-login-card">
        <div className="member-login-top">
          <img src="/logo.png" alt="MTB" />
          <h1>Member Portal</h1>
          <p>Sign in with your phone number and PIN to access your account.</p>
        </div>
        <div className="member-login-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="field-label" htmlFor="phone">Mobile Money Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 076 123 456"
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: "1.5px solid var(--gray-300)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 14.5,
                  outline: "none",
                }}
              />
            </div>
            <div className="form-group">
              <label className="field-label" htmlFor="pin">6-Digit PIN</label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: "1.5px solid var(--gray-300)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 14.5,
                  outline: "none",
                  letterSpacing: "0.3em",
                }}
              />
              <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 5 }}>
                Your PIN was set by the admin. Contact them if you haven't received it.
              </p>
            </div>

            {error && (
              <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>
            )}

            <button
              className="btn-submit"
              type="submit"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? "SIGNING IN..." : "SIGN IN →"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <a href="/" style={{ fontSize: 13, color: "var(--gray-500)", textDecoration: "none" }}>
              ← Back to Community Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
