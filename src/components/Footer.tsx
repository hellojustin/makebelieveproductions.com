import { Box, Link, Sheet, Stack, Typography } from "@mui/joy";

// Plain hrefs (rather than `component={NextLink}`) keep this a server
// component — Joy's Link is a client component, and crossing the
// server/client boundary with a function-as-prop is forbidden. A footer
// link is low-traffic enough that we don't miss client-side prefetch.
const footerLinkSx = {
  fontSize: "0.8rem",
  color: "rgba(255, 255, 255, 0.6)",
  "&:hover": { color: "var(--mbp-color-violet-300)" },
  transition: "color 200ms",
} as const;

export default function Footer() {
  return (
    <Sheet component="footer" className="footer">
      <Stack
        className="footerContent"
        direction="column"
        justifyContent="space-between"
      >
        <Stack direction="column" spacing={1}>
          <Typography className="wordmark">Make Believe Productions</Typography>
          <Typography className="address">981 Mission Street</Typography>
          <Typography className="address">San Francisco, CA 94103</Typography>
          <Typography className="address">hello@makebelieveproductions.com</Typography>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
          flexWrap="wrap"
          gap={2}
          mt={3}
        >
          <Box sx={{ display: "flex", gap: 3 }}>
            <Link href="/blog" underline="none" sx={footerLinkSx}>
              Writing
            </Link>
            <Link href="/blog/rss.xml" underline="none" sx={footerLinkSx}>
              RSS
            </Link>
          </Box>
          <Typography className="address">
            &copy; {new Date().getFullYear()} Make Believe Productions, LLC. All Rights Reserved.
          </Typography>
        </Stack>
      </Stack>
    </Sheet>
  );
}
