import { Box, Typography } from "@mui/joy";
import DotCanvasShell from "@/components/DotCanvasShell";
import { formatPostDate } from "@/lib/blog";

interface PostHeroProps {
  title: string;
  date: string;
  description: string;
  /** Path to the dot-data JSON for this post, e.g. /data/blog/<slug>.json */
  dotsUrl: string;
}

/**
 * Hero block for a single blog post. Renders the animated dot field at
 * 50svh (half the homepage hero), overlayed with the post's title, date,
 * and dek. The canvas is fixed-position via `DotCanvasShell` and uses
 * the same scroll-driven strip-fade as the homepage — so as the reader
 * scrolls into the article body, the dots compress into a thin band at
 * the top of the viewport.
 */
export default function PostHero({
  title,
  date,
  description,
  dotsUrl,
}: PostHeroProps) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        // The DotCanvasShell is fixed; this section just reserves 50svh
        // of scroll room so the title sits over the canvas while the
        // hero is in view.
        height: "50svh",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        textAlign: "center",
        px: 2,
        pb: { xs: 4, md: 6 },
      }}
    >
      <DotCanvasShell
        heightSvh={50}
        dataSource={{ kind: "single", url: dotsUrl }}
      />

      <Box
        sx={{
          position: "relative",
          maxWidth: "48rem",
          // Tight stacked text shadow so the title reads cleanly against
          // any dot color underneath, mirroring the HeroSection treatment
          // but without the full chunky stroke (this is a per-post hero,
          // not the brand wordmark).
          textShadow:
            "0 2px 24px rgba(10, 8, 26, 0.85), 0 0 6px rgba(10, 8, 26, 0.85)",
        }}
      >
        <Typography
          component="time"
          dateTime={date}
          level="body-sm"
          sx={{
            display: "block",
            color: "rgba(196, 181, 253, 0.8)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontSize: "0.75rem",
            mb: 2,
          }}
        >
          {formatPostDate(date)}
        </Typography>
        <Typography
          component="h1"
          level="h1"
          sx={{
            color: "common.white",
            fontFamily: "var(--mbp-fontFamily-display)",
            fontStyle: "italic",
            fontWeight: 400,
            lineHeight: 1.05,
            fontSize: "clamp(2rem, 6vw, 4rem)",
            mb: description ? 2 : 0,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            level="body-lg"
            sx={{
              color: "rgba(196, 181, 253, 0.85)",
              fontSize: "clamp(1rem, 2.2vw, 1.25rem)",
              lineHeight: 1.4,
              maxWidth: "36rem",
              mx: "auto",
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
