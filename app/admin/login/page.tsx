"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #060d1f 0%, #0f1f3d 55%, #1a3464 100%)",
      padding: "24px",
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative glow orbs */}
      <div style={{
        position: "absolute", top: "-80px", right: "-80px",
        width: 320, height: 320,
        background: "radial-gradient(circle, rgba(232,101,10,0.18) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", left: "-60px",
        width: 260, height: 260,
        background: "radial-gradient(circle, rgba(26,52,100,0.6) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 20,
        backdropFilter: "blur(16px)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Card header */}
        <div style={{
          background: "linear-gradient(135deg, rgba(232,101,10,0.22), rgba(26,52,100,0.4))",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "32px 32px 28px",
          textAlign: "center",
        }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: "50%",
            background: "#e8650a",
            border: "3px solid #fb923c",
            boxShadow: "0 0 24px rgba(232,101,10,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 16px",
          }}>
            🛡️
          </div>
          <h1 style={{
            color: "#ffffff", fontSize: 22, fontWeight: 900,
            margin: "0 0 6px", letterSpacing: "-0.3px",
          }}>
            Admin Sign In
          </h1>
          <p style={{ color: "#a8bfe0", fontSize: 13.5, margin: 0 }}>
            MTB Fund · Secure Dashboard Access
          </p>
        </div>

        {/* Form body */}
        <div style={{ padding: "28px 32px 32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{
                display: "block", fontSize: 12.5, fontWeight: 700,
                color: "#a8bfe0", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.5px",
              }}>
                Email Address
              </label>
              <div style={{
                display: "flex", alignItems: "center",
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                borderRadius: 10, overflow: "hidden",
                transition: "border-color 0.2s",
              }}
                onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "#e8650a"}
                onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"}
              >
                <span style={{
                  padding: "12px 14px", fontSize: 16, color: "#a8bfe0",
                  borderRight: "1.5px solid rgba(255,255,255,0.08)", lineHeight: 1,
                }}>✉️</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mtb.fund"
                  required
                  style={{
                    flex: 1, border: "none", background: "transparent", outline: "none",
                    color: "#ffffff", fontSize: 14.5, padding: "12px 14px",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{
                display: "block", fontSize: 12.5, fontWeight: 700,
                color: "#a8bfe0", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.5px",
              }}>
                Password
              </label>
              <div style={{
                display: "flex", alignItems: "center",
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                borderRadius: 10, overflow: "hidden",
                transition: "border-color 0.2s",
              }}
                onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "#e8650a"}
                onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"}
              >
                <span style={{
                  padding: "12px 14px", fontSize: 16, color: "#a8bfe0",
                  borderRight: "1.5px solid rgba(255,255,255,0.08)", lineHeight: 1,
                }}>🔒</span>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    flex: 1, border: "none", background: "transparent", outline: "none",
                    color: "#ffffff", fontSize: 14.5, padding: "12px 14px",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#a8bfe0", padding: "12px 14px", fontSize: 14,
                    borderLeft: "1.5px solid rgba(255,255,255,0.08)",
                  }}
                  title={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.35)",
                color: "#fca5a5", borderRadius: 10, padding: "11px 14px",
                fontSize: 13.5, fontWeight: 600,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(232,101,10,0.5)" : "linear-gradient(135deg, #e8650a, #f97316)",
                color: "#ffffff", fontSize: 15, fontWeight: 800,
                border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.5px", boxShadow: "0 6px 20px rgba(232,101,10,0.4)",
                transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s",
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(232,101,10,0.5)"; }}}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(232,101,10,0.4)"; }}
            >
              {loading ? "SIGNING IN..." : "SIGN IN →"}
            </button>
          </form>

          {/* Footer note */}
          <p style={{
            marginTop: 20, textAlign: "center", fontSize: 12,
            color: "rgba(168,191,224,0.6)",
          }}>
            Restricted to authorised administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
