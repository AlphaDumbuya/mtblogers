"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/news", label: "News", icon: "📰" },
  { href: "/events", label: "Events", icon: "📅" },
  { href: "/contributions", label: "Contributions", icon: "💳" },
  { href: "/members", label: "Members", icon: "👥" },
  { href: "/about", label: "About", icon: "ℹ️" },
];

export default function PublicNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [path]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav className="pub-nav">
        <div className="pub-nav-inner">
          <Link href="/" className="pub-nav-brand">
            <img src="/logo.png" alt="MTB" />
            <div className="pub-nav-brand-text">
              <strong>MASERAY TEMNE BLOGGER</strong>
              <span>Our People · Our Culture · Our Future</span>
            </div>
          </Link>

          {/* Desktop links */}
          <ul className="pub-nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={path === l.href || (l.href !== "/" && path.startsWith(l.href)) ? "active" : ""}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="pub-nav-actions">
            <Link
              href="/member/login"
              className="nav-icon-btn"
              title="Member Portal"
              style={{
                background: "#e8650a",
                border: "2px solid #fb923c",
                color: "#ffffff",
                fontSize: 18,
                boxShadow: "0 0 12px rgba(232,101,10,0.5)",
              }}
            >
              👤
            </Link>
            <Link href="/contribute" className="pub-nav-cta pub-nav-links a">
              Contribute Now
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="pub-nav-hamburger"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(6,13,31,0.6)",
            zIndex: 199,
            backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* Mobile drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(300px, 85vw)",
          background: "var(--navy-900)",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Drawer header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span style={{ color: "var(--white)", fontWeight: 800, fontSize: 15 }}>
            Menu
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              color: "var(--white)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer nav links */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {NAV_LINKS.map((l) => {
            const isActive = path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 20px",
                  color: isActive ? "var(--white)" : "var(--navy-200)",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? "rgba(232,101,10,0.15)" : "transparent",
                  borderLeft: isActive ? "3px solid #e8650a" : "3px solid transparent",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <span style={{ fontSize: 18 }}>{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer CTA */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            href="/contribute"
            style={{
              display: "block",
              width: "100%",
              padding: "12px",
              background: "#e8650a",
              color: "#fff",
              borderRadius: "var(--radius-sm)",
              textAlign: "center",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(232,101,10,0.35)",
            }}
          >
            💳 Contribute Now
          </Link>
          <Link
            href="/member/login"
            style={{
              display: "block",
              width: "100%",
              padding: "11px",
              marginTop: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              color: "var(--navy-100)",
              borderRadius: "var(--radius-sm)",
              textAlign: "center",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            👤 Member Portal
          </Link>
        </div>
      </div>
    </>
  );
}
