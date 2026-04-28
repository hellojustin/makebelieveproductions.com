import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/joy";

import Nav from "@/components/Nav";
import BlogCard from "@/components/blog/BlogCard";
import SectionHeader from "@/components/layout/SectionHeader";
import { getPublishedPosts } from "@/lib/blog";
import {
  SITE_LOCALE,
  SITE_NAME,
  siteUrl,
} from "@/lib/site";

export const dynamic = "force-static";

const PAGE_TITLE = "Writing";
const PAGE_DESCRIPTION =
  "Notes from Make Believe Productions on building software with artists and visionaries.";
const PAGE_URL = siteUrl("/blog");
const PAGE_OG_IMAGE = siteUrl("/og/default.png");

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | ${SITE_NAME}`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    images: [{ url: PAGE_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [PAGE_OG_IMAGE],
  },
};

export default function BlogIndexPage() {
  const posts = getPublishedPosts();

  return (
    <Box component="main" sx={{ position: "relative" }}>
      <Nav alwaysVisible />

      <Box
        component="section"
        className="contentSection noHeader fullHeight"
        sx={{ position: "relative", zIndex: 2 }}
      >
        <SectionHeader title={PAGE_TITLE}>
          <Typography level="body-lg" sx={{ mt: 2 }}>
            {PAGE_DESCRIPTION}
          </Typography>
        </SectionHeader>

        {posts.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "30vh" }}>
            <Typography
              level="body-lg"
              sx={{ color: "rgba(196, 181, 253, 0.7)", fontStyle: "italic" }}
            >
              Nothing here yet — check back soon.
            </Typography>
          </Stack>
        ) : (
          <Box
            sx={{
              maxWidth: "64rem",
              mx: "auto",
              px: { xs: 0, md: 2 },
            }}
          >
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
