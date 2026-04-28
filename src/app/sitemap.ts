import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/site";

/**
 * Sitemap of all crawlable URLs. Drafts are deliberately excluded —
 * `getPublishedPosts` filters them — so they never appear in search
 * results before they're ready.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getPublishedPosts();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: siteUrl("/blog"),
      lastModified: posts[0] ? new Date(posts[0].sourceMtime) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  for (const post of posts) {
    entries.push({
      url: siteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.sourceMtime),
      changeFrequency: "yearly",
      priority: 0.7,
    });
  }

  return entries;
}
