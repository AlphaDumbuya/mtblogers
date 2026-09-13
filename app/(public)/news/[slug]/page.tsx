import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "News Article Not Found" };
  return {
    title: `${post.title} | Maseray Temne Blogger`,
    description: post.summary || post.body?.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.summary || post.body?.slice(0, 160),
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug, kind: "NEWS" } });
  if (!post || !post.published) notFound();

  // Fetch 3 other latest published news posts for the bottom section
  const morePosts = await prisma.post.findMany({
    where: {
      published: true,
      kind: "NEWS",
      id: { not: post.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  // Calculate approximate reading time
  const wordCount = (post.body || "").trim().split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      {/* Article Header */}
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
            <Link href="/news" style={{ color: "#38bdf8", textDecoration: "none" }}>
              News
            </Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
              {post.title}
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
              📰 Community News
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>•</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
              ⏱️ {readTimeMinutes} min read
            </span>
          </div>

          {/* Headline */}
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
            {post.title}
          </h1>

          {/* Byline / Date */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 14,
              color: "rgba(255,255,255,0.7)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1c9366, #0f7652)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                M
              </div>
              <span style={{ fontWeight: 600, color: "#ffffff" }}>MTB Editorial Team</span>
            </div>
            {formattedDate && (
              <>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                <span>📅 Published {formattedDate}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Article Section */}
      <div className="section" style={{ maxWidth: 860, margin: "0 auto", padding: "36px 20px 60px" }}>
        {/* Back Link */}
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/news"
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
            ← Back to All News
          </Link>
        </div>

        {/* Featured Image - Prominent, Large, Crisp */}
        {post.imageUrl && (
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
              src={post.imageUrl}
              alt={post.title}
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

        {/* Lead Summary */}
        {post.summary && (
          <div
            style={{
              marginBottom: 28,
              padding: "20px 24px",
              background: "#f8fafc",
              borderLeft: "5px solid #1c9366",
              borderRadius: "0 12px 12px 0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: "#1e293b",
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              {post.summary}
            </p>
          </div>
        )}

        {/* Full Article Body */}
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
          {post.body}
        </div>

        {/* Article Footer & Action Bar */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <Link
            href="/news"
            style={{
              fontSize: 14,
              color: "#1c9366",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← View all community updates
          </Link>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Share this story:</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + " - " + (typeof window !== "undefined" ? window.location.href : ""))}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "#25d366",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              💬 WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "#1877f2",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Facebook
            </a>
          </div>
        </div>

        {/* More Stories */}
        {morePosts.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f2a47", margin: 0 }}>
                📰 More Recent Stories
              </h2>
              <Link href="/news" style={{ fontSize: 13, color: "#1c9366", fontWeight: 700, textDecoration: "none" }}>
                Browse all →
              </Link>
            </div>
            <div className="card-grid card-grid-3">
              {morePosts.map((item) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="post-card">
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
                        📰
                      </div>
                    )}
                  </div>
                  <div className="post-card-body" style={{ padding: 14 }}>
                    <div className="post-card-kind" style={{ fontSize: 10 }}>News</div>
                    <div className="post-card-title" style={{ fontSize: 14, marginBottom: 4 }}>
                      {item.title}
                    </div>
                    {item.summary && (
                      <div className="post-card-summary" style={{ fontSize: 12, lineHeight: 1.4 }}>
                        {item.summary}
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
