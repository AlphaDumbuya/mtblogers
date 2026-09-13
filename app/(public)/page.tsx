import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home — Maseray Temne Blogger Community Fund",
  description:
    "A self-reliant community fund — members pool contributions so that whenever anyone faces hardship, the fund can step in and help. Built by the community, for the community.",
};

export const dynamic = "force-dynamic";

function money(n: number) {
  return `SLE ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default async function HomePage() {
  const [
    memberCount,
    paidAgg,
    payoutAgg,
    announcements,
    upcomingEvents,
    latestNews,
    recentContributions,
    activePeriod,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.contribution.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.payout.aggregate({ _sum: { amount: true } }),
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.post.findMany({
      where: { published: true, kind: "EVENT" },
      orderBy: { eventDate: "asc" },
      take: 3,
    }),
    prisma.post.findMany({
      where: { published: true, kind: "NEWS" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.contribution.findMany({
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 5,
    }),
    prisma.contributionPeriod.findFirst({ where: { isActive: true } }),
  ]);

  const totalRaised = Number(paidAgg._sum.amount ?? 0);
  const totalPaidOut = Number(payoutAgg._sum.amount ?? 0);
  const balance = totalRaised - totalPaidOut;

  // Paid members this month (active period)
  let paidThisMonth = 0;
  let unpaidThisMonth = 0;
  if (activePeriod) {
    paidThisMonth = await prisma.member.count({
      where: {
        contributions: {
          some: { periodId: activePeriod.id, status: "PAID" },
        },
      },
    });
    unpaidThisMonth = memberCount - paidThisMonth;
  }

  const tagColors: Record<string, string> = {
    IMPORTANT: "#dc2626",
    EVENT: "#4338ca",
    UPDATE: "#0284c7",
  };

  const notifIcons: Record<string, string> = {
    CONTRIBUTION: "💸",
    EVENT: "📅",
    ANNOUNCEMENT: "📢",
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-eyebrow">🤝 Community Mutual Support Fund</div>
            <h1>
              Stronger Together
              <br />
              for a <em>Better Tomorrow</em>
            </h1>
            <p>
              Members pool their contributions so that whenever anyone among us faces
              hardship, we step in and help — a self-reliant initiative built by the
              community, for the community.
            </p>
            <div className="hero-btns">
              <Link href="/contribute" className="btn-primary">
                💳 Contribute Now
              </Link>
              <Link href="/member/login" className="btn-outline">
                👤 Member Portal
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <b>{memberCount}</b>
                <span>Total Members</span>
              </div>
              <div className="hero-stat">
                <b>{money(totalRaised)}</b>
                <span>Total Raised</span>
              </div>
              <div className="hero-stat">
                <b>{money(balance)}</b>
                <span>Fund Balance</span>
              </div>
            </div>
          </div>

          {/* Side card — recent payments */}
          <div className="hero-card-side">
            <div className="hero-side-card">
              <h3>💳 Recent Contributions</h3>
              {recentContributions.length === 0 ? (
                <p style={{ color: "var(--navy-200)", fontSize: 13 }}>No contributions yet.</p>
              ) : (
                recentContributions.map((c) => (
                  <div key={c.id} className="hero-side-row">
                    <span>{c.contributorName}</span>
                    <strong>{money(Number(c.amount))}</strong>
                  </div>
                ))
              )}
            </div>

            {activePeriod && (
              <div className="hero-side-card">
                <h3>📅 {activePeriod.label}</h3>
                <div className="hero-side-row">
                  <span>✅ Paid Members</span>
                  <strong style={{ color: "var(--green-400)" }}>{paidThisMonth}</strong>
                </div>
                <div className="hero-side-row">
                  <span>❌ Unpaid Members</span>
                  <strong style={{ color: "#f87171" }}>{unpaidThisMonth}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <div style={{ background: "var(--white)", borderBottom: "1px solid var(--gray-300)", padding: "0 24px" }}>
        <div className="container">
          <div className="stat-grid" style={{ margin: 0, padding: "20px 0" }}>
            {[
              { icon: "👥", label: "Total Members", val: memberCount, color: "blue" },
              { icon: "✅", label: "Paid This Month", val: paidThisMonth || "—", color: "green" },
              { icon: "❌", label: "Unpaid This Month", val: unpaidThisMonth || "—", color: "red" },
              { icon: "💰", label: "Total Collected", val: money(totalRaised), color: "amber" },
            ].map(({ icon, label, val, color }) => (
              <div key={label} className="stat-card-pub">
                <div className={`stat-icon ${color}`}>{icon}</div>
                <div>
                  <div className="stat-val">{val}</div>
                  <div className="stat-lbl">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Announcements ── */}
      {announcements.length > 0 && (
        <div className="section-sm">
          <div className="section-title">
            <h2>
              <span className="num-badge">3</span>
              Announcements
            </h2>
            <Link href="/announcements" className="view-all">View All →</Link>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {announcements.map((a) => (
              <div key={a.id} className="announce-card">
                <span className={`announce-tag ${a.tag}`}>{a.tag}</span>
                <div style={{ flex: 1 }}>
                  <div className="announce-title">{a.title}</div>
                  <div className="announce-body">{a.body}</div>
                  <div className="announce-time">{timeAgo(new Date(a.createdAt))}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Events + News ── */}
      <div style={{ background: "var(--gray-50)" }}>
        <div className="section">
          <div className="home-events-news-grid">
            {/* Events */}
            <div>
              <div className="section-title">
                <h2>📅 Upcoming Events</h2>
                <Link href="/events" className="view-all">View All →</Link>
              </div>
              {upcomingEvents.length === 0 ? (
                <div className="empty-state" style={{ padding: "44px 20px", background: "#ffffff", borderRadius: 14, border: "1.5px dashed #cbd5e1" }}>
                  <div className="empty-icon" style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#1e293b" }}>No upcoming events right now.</p>
                  <span style={{ fontSize: 13, color: "#64748b", marginTop: 4, display: "block" }}>Check back soon for community meetings and dates!</span>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {upcomingEvents.map((e) => (
                    <Link key={e.id} href={`/events/${e.slug}`} className="home-feed-card">
                      <div className="home-feed-card-img">
                        {e.imageUrl ? (
                          <img
                            src={e.imageUrl}
                            alt={e.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="home-feed-card-fallback">📅</div>
                        )}
                      </div>
                      <div className="home-feed-card-body">
                        <div className="home-feed-card-kind">📅 Event</div>
                        <div className="home-feed-card-title">{e.title}</div>
                        {e.summary && (
                          <div className="home-feed-card-summary">{e.summary}</div>
                        )}
                        {e.eventDate && (
                          <div className="home-feed-card-meta">
                            <span>🗓️ {new Date(e.eventDate).toLocaleDateString()}</span>
                            {e.eventVenue && <span>📍 {e.eventVenue}</span>}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* News */}
            <div>
              <div className="section-title">
                <h2>📰 Latest News</h2>
                <Link href="/news" className="view-all">View All →</Link>
              </div>
              {latestNews.length === 0 ? (
                <div className="empty-state" style={{ padding: "44px 20px", background: "#ffffff", borderRadius: 14, border: "1.5px dashed #cbd5e1" }}>
                  <div className="empty-icon" style={{ fontSize: 36, marginBottom: 8 }}>📰</div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#1e293b" }}>No news stories published yet.</p>
                  <span style={{ fontSize: 13, color: "#64748b", marginTop: 4, display: "block" }}>Stay tuned for updates from our community!</span>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {latestNews.map((n) => (
                    <Link key={n.id} href={`/news/${n.slug}`} className="home-feed-card">
                      <div className="home-feed-card-img">
                        {n.imageUrl ? (
                          <img
                            src={n.imageUrl}
                            alt={n.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="home-feed-card-fallback">📰</div>
                        )}
                      </div>
                      <div className="home-feed-card-body">
                        <div className="home-feed-card-kind">📰 News</div>
                        <div className="home-feed-card-title">{n.title}</div>
                        {n.summary && (
                          <div className="home-feed-card-summary">{n.summary}</div>
                        )}
                        {n.publishedAt && (
                          <div className="home-feed-card-meta">
                            <span>📅 {new Date(n.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Contribute CTA ── */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--navy-800), var(--green-800))",
          padding: "60px 24px",
          textAlign: "center",
          color: "var(--white)",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>
            Ready to contribute?
          </h2>
          <p style={{ fontSize: 16, color: "var(--navy-200)", marginBottom: 32, lineHeight: 1.7 }}>
            Every contribution, big or small, makes a difference. Join your fellow members
            in supporting the community fund today.
          </p>
          <Link href="/contribute" className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
            💳 Make a Contribution
          </Link>
        </div>
      </div>
    </>
  );
}
