import type { Metadata } from "next";
import PublicNav from "./PublicNav";

export const metadata: Metadata = {
  title: { default: "Maseray Temne Blogger — Community Fund", template: "%s | MTB Fund" },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pub-page">
      <PublicNav />
      <main className="pub-main">{children}</main>
      <footer className="pub-footer">
        <div className="pub-footer-inner">
          <div className="pub-footer-grid">
            <div className="pub-footer-brand">
              <img src="/logo.png" alt="MTB" />
              <strong>MASERAY TEMNE BLOGGER</strong>
              <p>
                A community mutual-support fund built by us, for us. Members pool their
                contributions so that whenever anyone faces hardship, we step in and help.
              </p>
            </div>
            <div className="pub-footer-col">
              <h4>Navigate</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/news">News</a></li>
                <li><a href="/events">Events</a></li>
                <li><a href="/announcements">Announcements</a></li>
              </ul>
            </div>
            <div className="pub-footer-col">
              <h4>Community</h4>
              <ul>
                <li><a href="/members">Members</a></li>
                <li><a href="/contribute">Contribute</a></li>
                <li><a href="/about">About the Founder</a></li>
                <li><a href="/member/login">Member Portal</a></li>
              </ul>
            </div>
            <div className="pub-footer-col">
              <h4>Admin</h4>
              <ul>
                <li><a href="/admin">Dashboard</a></li>
                <li><a href="/admin/contributions">Contributions</a></li>
                <li><a href="/admin/members">Members</a></li>
              </ul>
            </div>
          </div>

          <div className="pub-footer-bottom">
            <span>© {new Date().getFullYear()} Maseray Temne Blogger · Secure payments by Monime</span>
            <div className="footer-trust">
              {[
                ["🛡️", "Secure"],
                ["📱", "Mobile Friendly"],
                ["⚡", "Fast"],
                ["🤝", "Community Built"],
              ].map(([icon, label]) => (
                <div key={label} className="footer-trust-item">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
