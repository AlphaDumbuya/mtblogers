// Server component wrapper
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getPostsData() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true, email: true } } },
  });
}

import PostsPageClient from "./PostsPageClient";

export default async function PostsAdminPage() {
  try {
    const posts = await getPostsData();
    return <PostsPageClient initialPosts={posts} />;
  } catch (error) {
    console.error("Failed to load posts:", error);
    return <PostsPageClient initialPosts={[]} error={true} />;
  }
}
