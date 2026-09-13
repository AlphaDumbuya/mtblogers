"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin",                  label: "📊 Dashboard" },
  { href: "/admin/contributions",    label: "💳 Contributions" },
  { href: "/admin/periods",          label: "📅 Periods" },
  { href: "/admin/members",          label: "👥 Members" },
  { href: "/admin/requests",         label: "📋 Requests" },
  { href: "/admin/payouts",          label: "💰 Payouts" },
];

const NAV_ITEMS_SECONDARY = [
  { href: "/admin/announcements",    label: "📢 Announcements" },
  { href: "/admin/posts",            label: "📰 News & Events" },
  { href: "/admin/site",             label: "⚙️ Site Settings" },
];

export default function AdminNav() {
  const path = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return path === "/admin";
    return path.startsWith(href);
  }

  function linkStyle(href: string): React.CSSProperties {
    const active = isActive(href);
    return {
      display: "block",
      color: active ? "#ffffff" : "#cfe0ef",
      textDecoration: "none",
      padding: "11px 13px",
      borderRadius: 10,
      fontSize: 14,
      fontWeight: active ? 700 : 600,
      background: active ? "rgba(232,101,10,0.22)" : "transparent",
      borderLeft: active ? "3px solid #e8650a" : "3px solid transparent",
      transition: "background 0.15s, color 0.15s, border-color 0.15s",
    };
  }

  function closeMobileNav() {
    // Close the mobile navigation when a link is clicked
    document.body.classList.remove("nav-open");
  }

  return (
    <nav>
      {NAV_ITEMS.map((item) => (
        <Link 
          key={item.href} 
          href={item.href} 
          style={linkStyle(item.href)}
          onClick={closeMobileNav}
        >
          {item.label}
        </Link>
      ))}

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "10px 0", paddingTop: 10 }}>
        {NAV_ITEMS_SECONDARY.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            style={linkStyle(item.href)}
            onClick={closeMobileNav}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
