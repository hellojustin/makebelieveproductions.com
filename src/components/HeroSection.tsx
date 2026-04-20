"use client";

import { useRef, useState, useCallback } from "react";
import DotCanvas from "./DotCanvas";
import type { DotCanvasHandle } from "./DotCanvas";

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
    <section className="relative h-[calc(100vh+100px)] w-full z-100">
      <div className="h-[calc(100vh+100px)]">
        <DotCanvas ref={canvasRef} className="fixed inset-0 w-full h-full" textRef={textRef} />
      </div>

      <div
        ref={textRef}
        className="absolute bottom-32 right-0 pr-6 sm:pr-8 md:pr-12 flex flex-col items-center sm:items-end pointer-events-none"
      >
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-[0.2em] text-white text-right leading-tight uppercase">
          MAKE BELIEVE
          <br />
          PRODUCTIONS
        </h1>
        <p className="mt-5 text-xs tracking-[0.3em] text-violet-300/70 uppercase sm:pr-4">
          Magical software for visionaries
        </p>
      </div>

      <div className="fixed bottom-6 left-6 flex items-center gap-3 z-100">
        <button onClick={prev} className="text-white/30 hover:text-white/60 transition-colors cursor-pointer" aria-label="Previous image">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button onClick={togglePause} className="text-white/30 hover:text-white/60 transition-colors cursor-pointer" aria-label={isPaused ? "Play" : "Pause"}>
          {isPaused ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1.5L12 7L3 12.5V1.5Z" fill="currentColor"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1.5" width="3.5" height="11" rx="0.75" fill="currentColor"/><rect x="8.5" y="1.5" width="3.5" height="11" rx="0.75" fill="currentColor"/></svg>
          )}
        </button>
        <button onClick={next} className="text-white/30 hover:text-white/60 transition-colors cursor-pointer" aria-label="Next image">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </section>
  );
}
