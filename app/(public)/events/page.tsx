import { prisma } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.post.findMany({
    where: { published: true, kind: "EVENT" },
    orderBy: { eventDate: "asc" },
  });

  const now = new Date();
  const upcoming = events.filter((e) => !e.eventDate || e.eventDate >= now);
  const past = events.filter((e) => e.eventDate && e.eventDate < now);

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <h1>📅 Events</h1>
          <p>Community meetings, gatherings and celebrations — stay connected.</p>
        </div>
      </div>

      <div className="section">
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--navy-800)", marginBottom: 20 }}>
          Upcoming Events
        </h2>
        {upcoming.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 0" }}>
            <div className="empty-icon">📅</div>
            <p>No upcoming events at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="card-grid card-grid-3">
            {upcoming.map((e) => (
              <Link key={e.id} href={`/events/${e.slug}`} className="post-card">
                <div
                  className="post-card-img"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    background: "#0f172a",
                    height: 200,
                  }}
                >
                  {e.imageUrl ? (
                    <img
                      src={e.imageUrl}
                      alt={e.title}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, var(--navy-700), var(--navy-600))",
                        fontSize: 36,
                        color: "var(--navy-200)",
                      }}
                    >
                      📅
                    </div>
                  )}
                </div>
                <div className="post-card-body">
                  <div className="post-card-kind">Event</div>
                  <div className="post-card-title">{e.title}</div>
                  {e.summary && <div className="post-card-summary">{e.summary}</div>}
                  <div className="post-card-meta">
                    {e.eventDate && (
                      <span>
                        📅 {new Date(e.eventDate).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {e.eventVenue && <span>📍 {e.eventVenue}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <hr className="divider" style={{ margin: "40px 0" }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-500)", marginBottom: 20 }}>
              Past Events
            </h2>
            <div className="card-grid card-grid-3" style={{ opacity: 0.75 }}>
              {past.map((e) => (
                <Link key={e.id} href={`/events/${e.slug}`} className="post-card">
                  <div
                    className="post-card-img"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      background: "#1e293b",
                      height: 180,
                    }}
                  >
                    {e.imageUrl ? (
                      <img
                        src={e.imageUrl}
                        alt={e.title}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(135deg, var(--gray-500), var(--gray-700))",
                          fontSize: 36,
                          color: "var(--navy-200)",
                        }}
                      >
                        📅
                      </div>
                    )}
                  </div>
                  <div className="post-card-body">
                    <div className="post-card-kind" style={{ color: "var(--gray-500)" }}>Past Event</div>
                    <div className="post-card-title">{e.title}</div>
                    <div className="post-card-meta">
                      {e.eventDate && <span>📅 {new Date(e.eventDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
