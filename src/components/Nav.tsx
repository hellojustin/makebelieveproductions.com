"use client";

import { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";

// Fraction of the viewport height the user must scroll past before the nav
// fades in. The hero text is positioned near the bottom of a 100svh hero
// section; by the time we've scrolled ~90% of a viewport, the hero text is
// fully past the nav strip and it's safe to reveal nav contents without
// visual overlap. Tweak as needed.
const NAV_REVEAL_SCROLL_FRACTION = 0.9;

export default function Nav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      setVisible(window.scrollY > window.innerHeight * NAV_REVEAL_SCROLL_FRACTION);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

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
        opacity: visible ? 1 : 0,
        transition: "opacity 250ms ease-out",
        // Don't catch clicks on the invisible nav while it's hidden — the
        // mailto link in particular shouldn't be focusable behind the hero.
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-hidden={!visible}
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
