import { Box, Chip, Typography } from "@mui/joy";
import { formatPostDate } from "@/lib/blog";

interface PostHeaderProps {
  title: string;
  date: string;
  author: string;
  readingTimeMinutes: number;
  tags: readonly string[];
}

/**
 * Lightweight header rendered above the article body. Repeats the
 * post title (the hero overlay version sits above on the dot canvas;
 * this version is in the document flow so it stays present after the
 * reader scrolls past the hero, and is more reliably crawled).
 */
export default function PostHeader({
  title,
  date,
  author,
  readingTimeMinutes,
  tags,
}: PostHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        // Visually hide the title at the top of the article since the
        // hero already shows it. We keep it in the DOM (visually-hidden)
        // for screen readers and crawlers that prefer the in-flow H1.
      }}
    >
      <Typography
        component="h1"
        level="h1"
        sx={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          color: "rgba(196, 181, 253, 0.7)",
          fontSize: "0.9rem",
          mb: 3,
        }}
      >
        <Typography
          component="time"
          dateTime={date}
          level="body-sm"
          sx={{ color: "inherit" }}
        >
          {formatPostDate(date)}
        </Typography>
        <Box component="span" sx={{ opacity: 0.5 }}>·</Box>
        <Typography level="body-sm" sx={{ color: "inherit" }}>
          {readingTimeMinutes} min read
        </Typography>
        <Box component="span" sx={{ opacity: 0.5 }}>·</Box>
        <Typography level="body-sm" sx={{ color: "inherit" }}>
          {author}
        </Typography>
      </Box>

      {tags.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              size="sm"
              variant="soft"
              sx={{
                "--Chip-radius": "999px",
                bgcolor: "rgba(196, 181, 253, 0.1)",
                color: "var(--mbp-palette-primary-300)",
              }}
            >
              {tag}
            </Chip>
          ))}
        </Box>
      )}
    </Box>
  );
}
