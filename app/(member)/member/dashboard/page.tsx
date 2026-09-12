import { getMemberSession } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Dashboard" };
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
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function MemberDashboard() {
  const session = await getMemberSession();
  if (!session) redirect("/member/login");

  const [member, recentContribs, notifications, activePeriod] = await Promise.all([
    prisma.member.findUnique({
      where: { id: session.id },
      include: {
        _count: { select: { contributions: true, requests: true } },
      },
    }),
    prisma.contribution.findMany({
      where: { memberId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { memberId: session.id, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.contributionPeriod.findFirst({ where: { isActive: true } }),
  ]);

  if (!member) redirect("/member/login");

  const totalPaid = await prisma.contribution.aggregate({
    _sum: { amount: true },
    where: { memberId: session.id, status: "PAID" },
  });

  const paidThisPeriod = activePeriod
    ? await prisma.contribution.count({
        where: { memberId: session.id, periodId: activePeriod.id, status: "PAID" },
      })
    : 0;

  const kindIcon: Record<string, string> = {
    CONTRIBUTION: "💸",
    EVENT: "📅",
    ANNOUNCEMENT: "📢",
  };

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-800)", marginBottom: 6 }}>
        Welcome back, {session.fullName.split(" ")[0]}! 👋
      </h1>
      <p style={{ fontSize: 14, color: "var(--gray-500)", marginBottom: 28 }}>
        {session.memberCode} · {member.district || member.country}
        {member.isDiaspora && " · 🌍 Diaspora"}
      </p>

      {/* Stat cards */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {[
          { icon: "💰", label: "Total Contributed", val: money(Number(totalPaid._sum.amount ?? 0)), color: "green" },
          { icon: "📊", label: "Contributions Made", val: member._count.contributions, color: "blue" },
          { icon: "📋", label: "Assistance Requests", val: member._count.requests, color: "amber" },
          {
            icon: activePeriod ? (paidThisPeriod ? "✅" : "❌") : "📅",
            label: activePeriod ? `${activePeriod.label} Status` : "No Active Period",
            val: activePeriod ? (paidThisPeriod ? "Paid" : "Unpaid") : "—",
            color: paidThisPeriod ? "green" : "red",
          },
        ].map(({ icon, label, val, color }) => (
          <div key={label} className="stat-card-pub">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div>
              <div className="stat-val" style={{ fontSize: 20 }}>{val}</div>
              <div className="stat-lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent Payments */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--navy-800)" }}>💳 Recent Payments</h2>
              <Link href="/member/history" style={{ fontSize: 13, color: "var(--green-600)", fontWeight: 700, textDecoration: "none" }}>
                View All →
              </Link>
            </div>
            {recentContribs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--gray-500)", fontSize: 14 }}>
                No contributions yet.{" "}
                <Link href="/contribute" style={{ color: "var(--green-600)", fontWeight: 700 }}>
                  Contribute now →
                </Link>
              </div>
            ) : (
              recentContribs.map((c) => (
                <div key={c.id} className="member-row">
                  <div className="member-avatar" style={{ width: 38, height: 38, fontSize: 16, background: c.status === "PAID" ? "var(--green-100)" : "var(--gold-100)" }}>
                    {c.status === "PAID" ? "✅" : "⏳"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="member-name" style={{ fontSize: 13 }}>{c.contributionType}</div>
                    <div className="member-sub">{timeAgo(new Date(c.createdAt))}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--green-700)" }}>
                      {money(Number(c.amount))}
                    </div>
                    <span className={`badge ${c.status}`} style={{ fontSize: 10 }}>{c.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--navy-800)" }}>
                🔔 Notifications
                {notifications.length > 0 && (
                  <span style={{ marginLeft: 8, background: "var(--green-500)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999 }}>
                    {notifications.length}
                  </span>
                )}
              </h2>
              <Link href="/member/notifications" style={{ fontSize: 13, color: "var(--green-600)", fontWeight: 700, textDecoration: "none" }}>
                View All →
              </Link>
            </div>
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--gray-500)", fontSize: 14 }}>
                You're all caught up! No new notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="notif-item">
                  <div className={`notif-icon ${n.kind}`}>{kindIcon[n.kind] ?? "🔔"}</div>
                  <div>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-body">{n.body}</div>
                    <div className="notif-time">{timeAgo(new Date(n.createdAt))}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick CTA */}
      <div
        style={{
          marginTop: 24,
          background: "linear-gradient(135deg, var(--navy-800), var(--green-800))",
          borderRadius: "var(--radius-lg)",
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          color: "var(--white)",
        }}
      >
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>
            {activePeriod && !paidThisPeriod
              ? `📅 ${activePeriod.label} contribution is due!`
              : "💪 Keep supporting the community"}
          </div>
          <div style={{ fontSize: 13, color: "var(--navy-200)" }}>
            {activePeriod && !paidThisPeriod
              ? "Your fellow members are counting on you."
              : "Every contribution makes a difference."}
          </div>
        </div>
        <Link href="/contribute" className="btn-primary" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
          💳 Contribute Now
        </Link>
      </div>
    </>
  );
}
