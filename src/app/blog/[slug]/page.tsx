import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@mui/joy";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

import Nav from "@/components/Nav";
import DotCanvasShell from "@/components/DotCanvasShell";
import PostHero from "@/components/blog/PostHero";
import PostHeader from "@/components/blog/PostHeader";
import { mdxComponents } from "@/components/blog/MdxComponents";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog";
import {
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  siteUrl,
} from "@/lib/site";

interface RouteParams {
  slug: string;
}

interface PageProps {
  params: Promise<RouteParams>;
}

/**
 * Pre-render every published post. Drafts are intentionally excluded so
 * they never have a public URL.
 */
export async function generateStaticParams(): Promise<RouteParams[]> {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = post.canonical ?? siteUrl(`/blog/${post.slug}`);
  const title = post.title;
  const description = post.description;
  const ogImageUrl = siteUrl(post.ogImagePath);

  return {
    title,
    description,
    keywords: post.tags.length > 0 ? [...post.tags] : undefined,
    authors: [{ name: post.author }],
    category: post.tags[0],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      publishedTime: post.date,
      modifiedTime: post.sourceMtime,
      authors: [post.author],
      tags: [...post.tags],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.heroAlt || title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    other: {
      "article:published_time": post.date,
      "article:modified_time": post.sourceMtime,
      "article:author": post.author,
      ...(post.tags[0] ? { "article:section": post.tags[0] } : {}),
      ...(post.tags.length > 0 ? { "article:tag": post.tags.join(",") } : {}),
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = post.canonical ?? siteUrl(`/blog/${post.slug}`);
  const ogImageUrl = siteUrl(post.ogImagePath);

  // schema.org Article. Search engines (and most LLMs) prefer JSON-LD
  // over microdata; we inject it as a script tag in the page body so it
  // ships statically with the HTML.
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: [ogImageUrl],
    datePublished: post.date,
    dateModified: post.sourceMtime,
    author: [{ "@type": "Person", name: post.author }],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: post.tags.length > 0 ? post.tags.join(", ") : undefined,
  };

  return (
    <Box component="main" sx={{ position: "relative" }}>
      {/* DotCanvasShell is a SIBLING of <PostHero/>, not a child of it.
          The shell renders its canvas at z-index:1 (fixed); the hero
          section sits at z-index:2 in the same stacking context (main).
          Nesting the shell inside the hero would put the canvas above
          the title because in-flow descendants stack below positioned
          descendants with explicit z-index — see PostHero.tsx for the
          full note. */}
      <DotCanvasShell
        heightSvh={50}
        dataSource={{ kind: "single", url: post.dotsPath }}
      />

      <Nav alwaysVisible />

      <PostHero
        title={post.title}
        date={post.date}
        description={post.description}
      />

      <Box className="contentStack">
        <Box
          component="article"
          sx={{
            position: "relative",
            // ~38rem yields roughly 55–65 characters per line at the
            // larger body font size used by MdxComponents — the classic
            // readability sweet spot for long-form prose. We deliberately
            // do NOT use the global `.contentSection` class here because
            // its `max-width: 100rem` rule ties on specificity with
            // Emotion's sx-generated class and wins by source order in
            // production, blowing the reading column out to full width.
            maxWidth: "38rem",
            mx: "auto",
            px: { xs: 2, md: 3 },
            // Pull the article slightly up so the first paragraph sits
            // close to the hero's lower edge, but leave room for the
            // strip-fade transition.
            pt: { xs: 4, md: 6 },
            pb: 8,
          }}
        >
          <PostHeader
            title={post.title}
            date={post.date}
            author={post.author}
            readingTimeMinutes={post.readingTimeMinutes}
            tags={post.tags}
          />
          <MDXRemote
            source={post.body}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  [
                    rehypePrettyCode,
                    {
                      // `github-dark` matches the deep-indigo palette
                      // without competing with the violet accent. Tokens
                      // are emitted as inline-styled spans, so no
                      // additional CSS is required for syntax color.
                      theme: "github-dark",
                      keepBackground: false,
                    },
                  ],
                ],
              },
            }}
          />
        </Box>
      </Box>

      {/* JSON-LD lives in the body to avoid hitting the Metadata API's
          (limited) script-injection surface. Search crawlers parse it
          regardless of position. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
    </Box>
  );
}
