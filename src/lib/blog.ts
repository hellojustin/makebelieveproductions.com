import "server-only";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  blogManifest,
  type BlogManifestEntry,
} from "@/data/blog-manifest";

const BLOG_SOURCE_DIR = "content/blog";

export type BlogPost = BlogManifestEntry & {
  /** Raw MDX body (frontmatter stripped) ready for compilation. */
  body: string;
};

/**
 * All published posts (drafts excluded), newest first.
 *
 * The manifest is generated at build time by scripts/process-content.ts and
 * is already sorted newest-first, so this is essentially a draft filter.
 * Returning a fresh array keeps callers free to sort/slice without mutating
 * the imported value.
 */
export function getPublishedPosts(): BlogManifestEntry[] {
  return blogManifest.posts.filter((p) => !p.draft).map((p) => ({ ...p }));
}

/**
 * Returns every post (drafts included). Useful for sitemap generation
 * during preview builds, or for an internal "all posts" admin view if we
 * ever build one. Production callers should prefer `getPublishedPosts`.
 */
export function getAllPostMeta(): BlogManifestEntry[] {
  return blogManifest.posts.map((p) => ({ ...p }));
}

export function getPostMetaBySlug(slug: string): BlogManifestEntry | null {
  return blogManifest.posts.find((p) => p.slug === slug) ?? null;
}

/**
 * Loads a single post (frontmatter + raw MDX body) by URL slug. Returns
 * `null` if the slug is unknown or the post is a draft — callers should
 * pass that through to a 404 response rather than rendering a partial.
 *
 * The MDX body is read from disk on demand; we deliberately don't bake
 * the body into the manifest so editing a post during `next dev` picks
 * up immediately on the next request without a manifest rebuild.
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const meta = getPostMetaBySlug(slug);
  if (!meta || meta.draft) return null;

  const postPath = path.resolve(
    process.cwd(),
    BLOG_SOURCE_DIR,
    meta.folder,
    "post.mdx",
  );
  if (!fs.existsSync(postPath)) return null;

  const raw = fs.readFileSync(postPath, "utf-8");
  const parsed = matter(raw);
  return { ...meta, body: parsed.content };
}

/** Format a post date as e.g. "April 28, 2026". */
export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
