import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Announcements" };
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

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <h1>📢 Announcements</h1>
          <p>Important updates, events and news from the Maseray Temne Blogger community.</p>
        </div>
      </div>

      <div className="section">
        {announcements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📢</div>
            <p>No announcements yet. Check back soon for community updates.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {announcements.map((a) => (
              <div key={a.id} className="announce-card" style={{ padding: "20px 24px" }}>
                <span className={`announce-tag ${a.tag}`}>{a.tag}</span>
                <div style={{ flex: 1 }}>
                  <div className="announce-title" style={{ fontSize: 16 }}>{a.title}</div>
                  <div className="announce-body" style={{ marginTop: 6 }}>{a.body}</div>
                  <div className="announce-time" style={{ marginTop: 8 }}>
                    🕒 {timeAgo(new Date(a.createdAt))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
