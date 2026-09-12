import type { Metadata } from "next";
import Link from "next/link";
import { getMemberSession } from "@/lib/member-auth";

export const metadata: Metadata = { title: { default: "Member Portal", template: "%s | MTB Member Portal" } };

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await getMemberSession();

  if (!session) {
    // Login page will handle redirect logic itself
    return <>{children}</>;
  }

  const initials = session.fullName
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="member-shell">
      <aside className="member-sidebar">
        <div className="member-sidebar-brand">
          <div
            className="member-avatar"
            style={{ width: 44, height: 44, fontSize: 16, flexShrink: 0 }}
          >
            {initials}
          </div>
          <div>
            <strong>{session.fullName}</strong>
            <span>{session.memberCode}</span>
          </div>
        </div>

        <nav>
          <Link href="/member/dashboard">🏠 Dashboard</Link>
          <Link href="/member/history">💳 My Payments</Link>
          <Link href="/member/notifications">🔔 Notifications</Link>
          <Link href="/contributions">📊 Contribution Board</Link>
          <Link href="/">🌐 Public Site</Link>
        </nav>

        <div className="member-sidebar-logout">
          <form action="/api/member/logout" method="post">
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>

      <div className="member-main">
        <header className="member-header">
          <span style={{ fontSize: 14, color: "var(--gray-500)" }}>
            Welcome back, <strong style={{ color: "var(--navy-800)" }}>{session.fullName}</strong>
          </span>
          <span style={{ fontSize: 13, color: "var(--gray-500)" }}>
            {session.memberCode}
          </span>
        </header>
        <div className="member-content">{children}</div>
      </div>
    </div>
  );
}
