import Link from "next/link";
import NextImage from "next/image";
import { Box, Typography } from "@mui/joy";
import { formatPostDate } from "@/lib/blog";
import type { BlogManifestEntry } from "@/data/blog-manifest";

interface BlogCardProps {
  post: BlogManifestEntry;
}

/**
 * One row of the blog index. Each card occupies roughly a third of the
 * viewport on desktop so three are visible at once. The thumbnail is
 * the static dot PNG generated at build time — much cheaper than
 * spinning up an animated canvas per card while preserving the dot-art
 * visual identity.
 *
 * The whole card is wrapped in a Next.js `<Link>` (rendering an `<a>`)
 * so client-side navigation prefetch works. We don't pass `Link` as a
 * `component` prop to a Joy primitive because that would forward a
 * function across the server/client boundary, which Next forbids.
 */
export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 4 },
          alignItems: { xs: "stretch", md: "center" },
          py: { xs: 3, md: 4 },
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          transition:
            "transform 280ms ease, background-color 280ms ease, box-shadow 280ms ease",
          "&:hover": {
            // Subtle violet halo to echo the lit-from-within treatment used
            // throughout the homepage cards/buttons.
            backgroundColor: "rgba(196, 181, 253, 0.04)",
            boxShadow:
              "0 0 64px rgba(167, 139, 250, 0.08), 0 0 12px rgba(167, 139, 250, 0.08)",
          },
          "&:hover .mbp-blog-card-arrow": {
            transform: "translateX(4px)",
            color: "common.white",
          },
          "&:hover .mbp-blog-card-title": {
            color: "common.white",
          },
        }}
      >
      <Box
        sx={{
          flex: { xs: "0 0 auto", md: "0 0 14rem" },
          width: { xs: "100%", md: "14rem" },
          aspectRatio: "1 / 1",
          position: "relative",
          borderRadius: "1rem",
          overflow: "hidden",
          // Soft inset so the dot art reads as a card rather than a flat
          // image; matches the surface tone of the homepage cards.
          backgroundColor: "var(--mbp-palette-background-surface)",
          boxShadow:
            "inset 0 0 0 1px rgba(196, 181, 253, 0.08), 0 0 24px rgba(0, 0, 0, 0.35)",
        }}
      >
        <NextImage
          src={post.squareImagePath}
          alt={post.heroAlt || post.title}
          fill
          sizes="(min-width: 768px) 14rem, 100vw"
          style={{ objectFit: "cover" }}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component="time"
          dateTime={post.date}
          level="body-sm"
          sx={{
            display: "block",
            color: "rgba(196, 181, 253, 0.7)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: "0.7rem",
            mb: 1.5,
          }}
        >
          {formatPostDate(post.date)} · {post.readingTimeMinutes} min read
        </Typography>
        <Typography
          component="h2"
          level="h2"
          className="mbp-blog-card-title"
          sx={{
            fontFamily: "var(--mbp-fontFamily-display)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.92)",
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            lineHeight: 1.1,
            transition: "color 280ms ease",
            mb: 1.5,
          }}
        >
          {post.title}
        </Typography>
        {post.description && (
          <Typography
            level="body-lg"
            sx={{
              color: "rgba(196, 181, 253, 0.8)",
              lineHeight: 1.5,
              maxWidth: "40rem",
              mb: 2,
            }}
          >
            {post.description}
          </Typography>
        )}
        <Typography
          component="span"
          className="mbp-blog-card-arrow"
          level="body-sm"
          sx={{
            display: "inline-block",
            color: "rgba(196, 181, 253, 0.7)",
            letterSpacing: "0.05em",
            transition: "transform 280ms ease, color 280ms ease",
          }}
        >
          Read →
        </Typography>
      </Box>
      </Box>
    </Link>
  );
}
