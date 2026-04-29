import { Box, Typography } from "@mui/joy";
import { formatPostDate } from "@/lib/blog";

interface PostHeroProps {
  title: string;
  date: string;
  description: string;
}

/**
 * Title overlay rendered above the page-wide animated dot field.
 *
 * Important: this component does NOT mount the `DotCanvasShell` itself.
 * The shell is rendered at the page level (a sibling of this section)
 * so the canvas and the hero text live in the same stacking context.
 * If the canvas were nested inside this section, its `z-index: 1` would
 * paint on top of the (z-index auto) title because in-flow descendants
 * stack below positioned descendants with explicit z-index — see the
 * commit that introduced this hero for the gory details.
 *
 * This section is sized to 50svh and the title is anchored to the
 * bottom of it so it reads against the canvas's lower band, where the
 * dots are typically darker (since dot size is luminance-driven and
 * hero photos tend to put their subject up top).
 */
export default function PostHero({
  title,
  date,
  description,
}: PostHeroProps) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        // Reserves a half-viewport's worth of scroll room for the title
        // overlay; the actual dot canvas is mounted at the page level
        // (DotCanvasShell) and is fixed to the top of the viewport.
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
      <Box
        sx={{
          position: "relative",
          maxWidth: "60rem",
          // Wide so the title can breathe at its featured size. Legibility
          // against the dot field is handled per-element below using the
          // `-webkit-text-stroke` + `paint-order: stroke fill` technique
          // borrowed from HeroSection — the stroke is painted first in a
          // near-black so the fill sits cleanly on top regardless of what
          // dot color is underneath.
        }}
      >
        <Typography
          component="time"
          dateTime={date}
          level="body-sm"
          sx={{
            display: "block",
            color: "rgba(196, 181, 253, 0.85)",
            WebkitTextFillColor: "rgba(196, 181, 253, 0.85)",
            WebkitTextStroke: "0.4rem #08051a",
            paintOrder: "stroke fill",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontSize: "0.8rem",
            mb: { xs: 2, md: 3 },
          }}
        >
          {formatPostDate(date)}
        </Typography>
        <Typography
          component="h1"
          level="h1"
          sx={{
            color: "common.white",
            WebkitTextFillColor: "#fff",
            // 0.8rem keeps the stroke proportional across the title's
            // viewport-clamped range — heavier than the description's
            // stroke, lighter than the homepage hero wordmark (which
            // sits at 1rem on a much larger sans heading). Italic Fraunces
            // has finer letterform detail, so we don't want to drown it.
            WebkitTextStroke: "0.8rem #08051a",
            paintOrder: "stroke fill",
            fontFamily: "var(--mbp-fontFamily-display)",
            fontStyle: "italic",
            fontWeight: 400,
            lineHeight: 1,
            fontSize: "clamp(2.75rem, 9vw, 6rem)",
            letterSpacing: "-0.01em",
            mb: description ? { xs: 3, md: 4 } : 0,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            level="body-lg"
            sx={{
              color: "rgba(196, 181, 253, 0.9)",
              WebkitTextFillColor: "rgba(196, 181, 253, 0.9)",
              WebkitTextStroke: "0.4rem #08051a",
              paintOrder: "stroke fill",
              fontSize: "clamp(1.05rem, 2vw, 1.35rem)",
              lineHeight: 1.45,
              maxWidth: "40rem",
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
