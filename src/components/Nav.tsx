"use client";

import Box from "@mui/joy/Box";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";

export default function Nav() {
  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 101,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 5,
        py: 3,
      }}
    >
      <Typography
        level="body-sm"
        sx={{
          color: "common.white",
          fontWeight: 300,
          letterSpacing: "0.15em",
        }}
      >
        MAKE BELIEVE
      </Typography>
      <Link
        href="mailto:justin@makebelieveproductions.com"
        underline="none"
        sx={{
          fontSize: "sm",
          letterSpacing: "0.05em",
          color: "rgba(196, 181, 253, 0.7)",
          "&:hover": { color: "var(--mbp-color-violet-300)" },
          transition: "color 200ms",
        }}
      >
        Get in touch →
      </Link>
    </Box>
  );
}
