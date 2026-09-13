import { prisma } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "News" };
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: { published: true, kind: "NEWS" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <h1>📰 News</h1>
          <p>Latest stories, updates and highlights from the Maseray Temne Blogger community.</p>
        </div>
      </div>

      <div className="section">
        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <p>No news articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="card-grid card-grid-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/news/${p.slug}`} className="post-card">
                <div
                  className="post-card-img"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    background: "#0f172a",
                    height: 200,
                  }}
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
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
                        background: "linear-gradient(135deg, var(--navy-700), var(--green-800))",
                        fontSize: 36,
                        color: "var(--navy-200)",
                      }}
                    >
                      📰
                    </div>
                  )}
                </div>
                <div className="post-card-body">
                  <div className="post-card-kind">News</div>
                  <div className="post-card-title">{p.title}</div>
                  {p.summary && <div className="post-card-summary">{p.summary}</div>}
                  <div className="post-card-meta">
                    {p.publishedAt && (
                      <span>
                        📅 {new Date(p.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
