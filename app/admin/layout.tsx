import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminNav from "./AdminNav";
import AdminMenuToggle from "./AdminMenuToggle";
import { ToastProvider } from "./Toast";
import "./admin.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <div className="admin">
        {/* Mobile overlay (click to close sidebar) */}
        <div className="admin-overlay" aria-hidden="true" />

        {/* Sidebar */}
        <aside className="admin-nav">
          <div className="admin-brand">
            <img src="/logo.png" alt="MTB logo" />
            <div>
              <strong>MTB Fund</strong>
              <span>Admin Panel</span>
            </div>
          </div>

          <AdminNav />

          <form action="/api/admin/logout" method="post" className="admin-logout">
            <button type="submit">↩ Sign out</button>
          </form>
        </aside>

        {/* Main content */}
        <main className="admin-main">
          <header className="admin-header">
            {/* Hamburger — only visible on mobile */}
            <AdminMenuToggle />

            <div className="admin-header-user">
              <span>{session.name || session.email}</span>
              <span className="admin-header-badge">{session.role}</span>
            </div>

            <Link href="/" className="admin-header-link">
              ← Public site
            </Link>
          </header>

          <div className="admin-content">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
