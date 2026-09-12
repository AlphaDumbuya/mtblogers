import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  return { title: post?.title ?? "Event" };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await prisma.post.findUnique({ where: { slug, kind: "EVENT" } });
  if (!event || !event.published) notFound();

  return (
    <>
      <div
        className="page-header"
        style={{
          background: event.imageUrl
            ? `linear-gradient(rgba(6,19,31,0.75),rgba(6,19,31,0.85)), url(${event.imageUrl}) center/cover`
            : "linear-gradient(135deg, var(--navy-800), var(--navy-700))",
        }}
      >
        <div className="page-header-inner">
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-400)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            📅 Event
          </div>
          <h1 style={{ fontSize: "clamp(24px,4vw,42px)" }}>{event.title}</h1>
          {event.eventDate && (
            <p>
              {new Date(event.eventDate).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {event.eventVenue && ` · ${event.eventVenue}`}
            </p>
          )}
        </div>
      </div>

      <div className="section" style={{ maxWidth: 800 }}>
        <Link href="/events" style={{ fontSize: 14, color: "var(--green-600)", textDecoration: "none", fontWeight: 600 }}>
          ← Back to Events
        </Link>
        <div
          style={{
            marginTop: 32,
            fontSize: 16,
            lineHeight: 1.8,
            color: "var(--gray-700)",
            whiteSpace: "pre-wrap",
          }}
        >
          {event.body}
        </div>
      </div>
    </>
  );
}
