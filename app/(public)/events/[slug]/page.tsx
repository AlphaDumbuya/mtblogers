import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "Event Not Found" };
  return {
    title: `${post.title} | MTB Community Events`,
    description: post.summary || post.body?.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.summary || post.body?.slice(0, 160),
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await prisma.post.findUnique({ where: { slug, kind: "EVENT" } });
  if (!event || !event.published) notFound();

  // Fetch other upcoming events
  const otherEvents = await prisma.post.findMany({
    where: {
      published: true,
      kind: "EVENT",
      id: { not: event.id },
    },
    orderBy: { eventDate: "asc" },
    take: 3,
  });

  const formattedEventDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const formattedEventTime = event.eventDate
    ? new Date(event.eventDate).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      {/* Event Header */}
      <div
        className="page-header"
        style={{
          background: "linear-gradient(135deg, #06131f 0%, #0d2847 100%)",
          padding: "48px 24px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="page-header-inner" style={{ maxWidth: 860, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              marginBottom: 16,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <Link href="/" style={{ color: "#38bdf8", textDecoration: "none" }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/events" style={{ color: "#38bdf8", textDecoration: "none" }}>
              Events
            </Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
              {event.title}
            </span>
          </nav>

          {/* Category Tag */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <span
              style={{
                background: "rgba(28, 147, 102, 0.2)",
                color: "#34d399",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              📅 Community Event
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(26px, 4.5vw, 42px)",
              lineHeight: 1.25,
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: 16,
              letterSpacing: "-0.5px",
            }}
          >
            {event.title}
          </h1>

          {/* Quick Info Bar */}
          {formattedEventDate && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                fontSize: 14,
                color: "rgba(255,255,255,0.85)",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(6px)",
                padding: "8px 16px",
                borderRadius: 10,
                flexWrap: "wrap",
              }}
            >
              <span>🗓️ {formattedEventDate}</span>
              {formattedEventTime && <span>⏰ {formattedEventTime}</span>}
              {event.eventVenue && <span>📍 {event.eventVenue}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="section" style={{ maxWidth: 860, margin: "0 auto", padding: "36px 20px 60px" }}>
        {/* Back Link */}
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/events"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              color: "var(--green-600)",
              textDecoration: "none",
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 8,
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              transition: "all 0.2s",
            }}
          >
            ← Back to All Events
          </Link>
        </div>

        {/* Featured Event Poster / Image */}
        {event.imageUrl && (
          <div
            style={{
              marginBottom: 32,
              borderRadius: 16,
              overflow: "hidden",
              background: "#0f172a",
              boxShadow: "0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <img
              src={event.imageUrl}
              alt={event.title}
              style={{
                width: "100%",
                maxHeight: 520,
                minHeight: 280,
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        )}

        {/* Event Schedule Info Box */}
        {(formattedEventDate || event.eventVenue) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 32,
              padding: "20px 24px",
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: 12,
            }}
          >
            {formattedEventDate && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 4 }}>
                  Date &amp; Time
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                  {formattedEventDate}
                </div>
                {formattedEventTime && (
                  <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>
                    Starting at {formattedEventTime}
                  </div>
                )}
              </div>
            )}
            {event.eventVenue && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 4 }}>
                  Location / Venue
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                  📍 {event.eventVenue}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Event Summary */}
        {event.summary && (
          <div
            style={{
              marginBottom: 28,
              padding: "20px 24px",
              background: "#f0fdf4",
              borderLeft: "5px solid #1c9366",
              borderRadius: "0 12px 12px 0",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: "#166534",
                lineHeight: 1.6,
              }}
            >
              {event.summary}
            </p>
          </div>
        )}

        {/* Full Event Body */}
        <div
          style={{
            fontSize: 17,
            lineHeight: 1.9,
            color: "#334155",
            whiteSpace: "pre-wrap",
            letterSpacing: "0.1px",
            wordBreak: "break-word",
          }}
        >
          {event.body}
        </div>

        {/* Other Events */}
        {otherEvents.length > 0 && (
          <div style={{ marginTop: 60, paddingTop: 32, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f2a47", margin: 0 }}>
                📅 More Community Events
              </h2>
              <Link href="/events" style={{ fontSize: 13, color: "#1c9366", fontWeight: 700, textDecoration: "none" }}>
                Browse all →
              </Link>
            </div>
            <div className="card-grid card-grid-3">
              {otherEvents.map((item) => (
                <Link key={item.id} href={`/events/${item.slug}`} className="post-card">
                  <div
                    className="post-card-img"
                    style={{
                      height: 160,
                      position: "relative",
                      overflow: "hidden",
                      background: "#0f172a",
                    }}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, var(--navy-700), var(--green-800))",
                        fontSize: 32,
                        color: "var(--navy-200)",
                      }}>
                        📅
                      </div>
                    )}
                  </div>
                  <div className="post-card-body" style={{ padding: 14 }}>
                    <div className="post-card-kind" style={{ fontSize: 10 }}>Event</div>
                    <div className="post-card-title" style={{ fontSize: 14, marginBottom: 4 }}>
                      {item.title}
                    </div>
                    {item.eventDate && (
                      <div className="post-card-meta" style={{ fontSize: 12 }}>
                        📅 {new Date(item.eventDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
