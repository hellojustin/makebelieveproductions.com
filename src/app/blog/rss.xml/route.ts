import { getPublishedPosts } from "@/lib/blog";
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
  siteUrl,
} from "@/lib/site";

export const dynamic = "force-static";

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS 2.0 feed at /blog/rss.xml. Generated statically from the same
 * manifest the blog index reads, so it ships with `next build` and
 * never has to hit a database.
 */
export function GET(): Response {
  const posts = getPublishedPosts();
  const lastBuildDate = (
    posts[0] ? new Date(posts[0].sourceMtime) : new Date()
  ).toUTCString();

  const items = posts
    .map((post) => {
      const url = post.canonical ?? siteUrl(`/blog/${post.slug}`);
      const pubDate = new Date(post.date).toUTCString();
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${escape(url)}</link>
      <guid isPermaLink="true">${escape(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escape(post.description)}</description>
      <author>${escape(`hello@makebelieveproductions.com (${post.author})`)}</author>
${post.tags
  .map((tag) => `      <category>${escape(tag)}</category>`)
  .join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${SITE_NAME} — Writing`)}</title>
    <link>${escape(siteUrl("/blog"))}</link>
    <description>${escape(SITE_DESCRIPTION)}</description>
    <language>${SITE_LANGUAGE}</language>
    <managingEditor>${escape(`hello@makebelieveproductions.com (${SITE_AUTHOR})`)}</managingEditor>
    <webMaster>${escape(`hello@makebelieveproductions.com (${SITE_AUTHOR})`)}</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escape(siteUrl("/blog/rss.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
