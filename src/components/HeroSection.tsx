"use client";

import { useRef, useState, useCallback } from "react";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import DotCanvas from "./DotCanvas";
import type { DotCanvasHandle } from "./DotCanvas";
import styles from "./HeroSection.module.scss";

const controlButtonSx = {
  color: "rgba(255, 255, 255, 0.3)",
  minHeight: "auto",
  minWidth: "auto",
  p: 0,
  background: "transparent",
  "&:hover": {
    color: "rgba(255, 255, 255, 0.6)",
    background: "transparent",
  },
  transition: "color 200ms",
};

export default function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<DotCanvasHandle>(null);
  const [isPaused, setIsPaused] = useState(false);

  const togglePause = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    if (c.isPaused()) {
      c.play();
      setIsPaused(false);
    } else {
      c.pause();
      setIsPaused(true);
    }
  }, []);

  const prev = useCallback(() => canvasRef.current?.prev(), []);
  const next = useCallback(() => canvasRef.current?.next(), []);

  return (
    <Box component="section" className={styles.heroSection}>
      <div className={styles.heroSpacer}>
        <DotCanvas ref={canvasRef} className={styles.heroCanvas} textRef={textRef} />
      </div>

      <div ref={textRef} className={styles.heroText}>
        <h1 className={styles.heroHeading}>
          MAKE BELIEVE
          <br />
          PRODUCTIONS
        </h1>
        <p className={styles.heroTagline}>Magical software for visionaries</p>
      </div>

      <div className={styles.controls}>
        <IconButton variant="plain" sx={controlButtonSx} onClick={prev} aria-label="Previous image">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>
        <IconButton
          variant="plain"
          sx={controlButtonSx}
          onClick={togglePause}
          aria-label={isPaused ? "Play" : "Pause"}
        >
          {isPaused ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 1.5L12 7L3 12.5V1.5Z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="1.5" width="3.5" height="11" rx="0.75" fill="currentColor" />
              <rect x="8.5" y="1.5" width="3.5" height="11" rx="0.75" fill="currentColor" />
            </svg>
          )}
        </IconButton>
        <IconButton variant="plain" sx={controlButtonSx} onClick={next} aria-label="Next image">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>
      </div>
    </Box>
  );
}
