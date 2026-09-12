import { getMemberSession } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const kindIcon: Record<string, string> = {
  CONTRIBUTION: "💸",
  EVENT: "📅",
  ANNOUNCEMENT: "📢",
};

export default async function MemberNotificationsPage() {
  const session = await getMemberSession();
  if (!session) redirect("/member/login");

  const notifications = await prisma.notification.findMany({
    where: { memberId: session.id },
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-800)", marginBottom: 4 }}>
            🔔 Notifications
          </h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} · {notifications.length} total
          </p>
        </div>
        {unreadCount > 0 && (
          <form action="/api/member/notifications/read-all" method="post">
            <button
              type="submit"
              style={{
                padding: "9px 18px",
                border: "1.5px solid var(--gray-300)",
                borderRadius: "var(--radius-sm)",
                background: "var(--white)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                color: "var(--gray-700)",
              }}
            >
              ✓ Mark all read
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <p>No notifications yet. You'll be notified when members contribute, events are posted, and more.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`notif-item${!n.read ? " unread" : ""}`}>
                <div className={`notif-icon ${n.kind}`}>
                  {kindIcon[n.kind] ?? "🔔"}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-body">{n.body}</div>
                  <div className="notif-time">{timeAgo(new Date(n.createdAt))}</div>
                </div>
                {!n.read && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--green-500)",
                      flexShrink: 0,
                      marginTop: 6,
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
