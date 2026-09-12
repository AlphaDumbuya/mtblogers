import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  return { title: post?.title ?? "News" };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug, kind: "NEWS" } });
  if (!post || !post.published) notFound();

  return (
    <>
      <div
        className="page-header"
        style={{
          background: post.imageUrl
            ? `linear-gradient(rgba(6,19,31,0.8),rgba(6,19,31,0.9)), url(${post.imageUrl}) center/cover`
            : "linear-gradient(135deg, var(--navy-800), var(--navy-700))",
        }}
      >
        <div className="page-header-inner">
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-400)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            📰 News
          </div>
          <h1 style={{ fontSize: "clamp(22px,4vw,40px)" }}>{post.title}</h1>
          {post.publishedAt && (
            <p>
              Published {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="section" style={{ maxWidth: 800 }}>
        <Link href="/news" style={{ fontSize: 14, color: "var(--green-600)", textDecoration: "none", fontWeight: 600 }}>
          ← Back to News
        </Link>
        {post.summary && (
          <p style={{ marginTop: 24, fontSize: 18, fontWeight: 600, color: "var(--gray-700)", lineHeight: 1.6 }}>
            {post.summary}
          </p>
        )}
        <div
          style={{
            marginTop: 24,
            fontSize: 16,
            lineHeight: 1.9,
            color: "var(--gray-700)",
            whiteSpace: "pre-wrap",
          }}
        >
          {post.body}
        </div>
      </div>
    </>
  );
}
