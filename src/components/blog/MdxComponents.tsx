import * as React from "react";
import NextImage from "next/image";
import { Box, Divider, Link as JoyLink, Typography } from "@mui/joy";
import type { MDXComponents } from "mdx/types";

const headingSx = {
  fontFamily: "var(--mbp-fontFamily-display)",
  fontStyle: "italic" as const,
  fontWeight: 400,
  color: "common.white",
  scrollMarginTop: "5rem",
};

function isExternal(href?: string): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href) || href.startsWith("mailto:");
}

/**
 * Components used to render the MDX body of a blog post. Maps the
 * standard HTML element names that markdown emits to Joy UI primitives
 * styled to match the rest of the site.
 *
 * Imported by `src/app/blog/[slug]/page.tsx` and passed to the
 * `MDXRemote` component. Code blocks are styled in `globals.scss`
 * (`.shikiBlock`) — `rehype-pretty-code` sets inline styles for
 * per-token colors, so we only need to handle the wrapper aesthetics.
 */
export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <Typography
      level="h1"
      component="h1"
      sx={{ ...headingSx, mt: 6, mb: 3, fontSize: "clamp(2rem, 4.5vw, 2.75rem)" }}
      {...props}
    />
  ),
  h2: (props) => (
    <Typography
      level="h2"
      component="h2"
      sx={{ ...headingSx, mt: 6, mb: 2, fontSize: "clamp(1.65rem, 3.2vw, 2.15rem)" }}
      {...props}
    />
  ),
  h3: (props) => (
    <Typography
      level="h3"
      component="h3"
      sx={{ ...headingSx, mt: 5, mb: 2, fontSize: "clamp(1.35rem, 2.6vw, 1.65rem)" }}
      {...props}
    />
  ),
  h4: (props) => (
    <Typography
      level="h4"
      component="h4"
      sx={{ ...headingSx, mt: 3, mb: 1.5, fontStyle: "normal" }}
      {...props}
    />
  ),
  p: (props) => (
    <Typography
      level="body-lg"
      component="p"
      sx={{
        // Bigger and airier than `body-lg`'s defaults — the article
        // column was narrowed in the post page to ~38rem to keep the
        // characters-per-line count comfortable at this size.
        fontSize: "clamp(1.125rem, 1.6vw, 1.25rem)",
        lineHeight: 1.75,
        my: 3,
        color: "rgba(255, 255, 255, 0.88)",
      }}
      {...props}
    />
  ),
  a: ({ href, children, ...rest }) => {
    const external = isExternal(href);
    return (
      <JoyLink
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        sx={{
          color: "var(--mbp-palette-primary-300)",
          textDecorationColor: "rgba(196, 181, 253, 0.4)",
          "&:hover": {
            color: "common.white",
            textDecorationColor: "currentColor",
          },
        }}
        {...rest}
      >
        {children}
      </JoyLink>
    );
  },
  ul: (props) => (
    <Box
      component="ul"
      sx={{
        my: 3,
        pl: 3,
        color: "rgba(255, 255, 255, 0.88)",
        fontSize: "clamp(1.125rem, 1.6vw, 1.25rem)",
        "& > li": { my: 1, lineHeight: 1.7 },
      }}
      {...props}
    />
  ),
  ol: (props) => (
    <Box
      component="ol"
      sx={{
        my: 3,
        pl: 3,
        color: "rgba(255, 255, 255, 0.88)",
        fontSize: "clamp(1.125rem, 1.6vw, 1.25rem)",
        "& > li": { my: 1, lineHeight: 1.7 },
      }}
      {...props}
    />
  ),
  blockquote: (props) => (
    <Box
      component="blockquote"
      sx={{
        my: 4,
        pl: 3,
        borderLeft: "3px solid var(--mbp-palette-primary-400)",
        fontStyle: "italic",
        color: "rgba(196, 181, 253, 0.9)",
        // Inherit the slightly larger article body size so quotes don't
        // look diminutive next to the surrounding paragraphs.
        "& p": { color: "inherit", fontSize: "inherit" },
        fontSize: "clamp(1.125rem, 1.6vw, 1.25rem)",
      }}
      {...props}
    />
  ),
  hr: () => <Divider sx={{ my: 5 }} />,
  // Inline code. `rehype-pretty-code` does NOT touch inline backticks,
  // so we get a plain <code> here and can style it as a pill.
  code: ({ className, ...rest }) => {
    // Block-level code (inside <pre>) gets a className from rehype-pretty-code;
    // when present, fall through to the default styling so per-token spans render.
    if (className) return <code className={className} {...rest} />;
    return (
      <Box
        component="code"
        sx={{
          fontFamily: "var(--mbp-fontFamily-code)",
          fontSize: "0.9em",
          px: "0.4em",
          py: "0.15em",
          borderRadius: "4px",
          backgroundColor: "rgba(196, 181, 253, 0.12)",
          color: "var(--mbp-palette-primary-200)",
        }}
        {...rest}
      />
    );
  },
  // Block code wrapper. rehype-pretty-code wraps code in <pre><code> with
  // the `data-language` and `data-theme` attributes plus inline styles.
  pre: (props) => (
    <Box
      component="pre"
      className="shikiBlock"
      sx={{
        my: 3,
        p: 2,
        borderRadius: "0.75rem",
        overflowX: "auto",
        backgroundColor: "rgba(13, 10, 36, 0.85)",
        border: "1px solid rgba(196, 181, 253, 0.12)",
        fontSize: "0.9rem",
        lineHeight: 1.55,
        "& code": {
          fontFamily: "var(--mbp-fontFamily-code)",
          backgroundColor: "transparent",
          padding: 0,
          color: "inherit",
        },
      }}
      {...props}
    />
  ),
  img: ({ src, alt, width, height, ...rest }) => {
    if (!src || typeof src !== "string") return null;
    // Prefer next/image when we have explicit dimensions, otherwise fall
    // back to a plain <img> so authors don't have to handle every case.
    if (width && height) {
      return (
        <Box my={3}>
          <NextImage
            src={src}
            alt={alt ?? ""}
            width={Number(width)}
            height={Number(height)}
            sizes="(min-width: 768px) 44rem, 100vw"
            style={{ width: "100%", height: "auto", borderRadius: "0.75rem" }}
          />
        </Box>
      );
    }
    return (
      <Box
        component="img"
        src={src}
        alt={alt ?? ""}
        sx={{ width: "100%", height: "auto", borderRadius: "0.75rem", my: 3 }}
        {...rest}
      />
    );
  },
  table: (props) => (
    <Box
      sx={{ my: 3, overflowX: "auto" }}
    >
      <Box
        component="table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.95rem",
          color: "rgba(255, 255, 255, 0.85)",
          "& th, & td": {
            padding: "0.5rem 0.75rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            textAlign: "left",
          },
          "& th": {
            color: "common.white",
            fontWeight: 600,
          },
        }}
        {...props}
      />
    </Box>
  ),
};
