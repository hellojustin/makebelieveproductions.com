"use client";

import { useRef } from "react";
import DotCanvas from "./DotCanvas";

export default function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative h-[calc(100vh+100px)] w-full z-100">
      <div className="h-[calc(100vh+100px)]">
        <DotCanvas className="fixed inset-0 w-full h-full" textRef={textRef} />
      </div>

      <div
        ref={textRef}
        className="absolute inset-0 flex flex-col items-center justify-end pb-42 pointer-events-none"
      >
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-[0.2em] text-white text-center leading-tight">
          MAKE BELIEVE
          <br />
          PRODUCTIONS
        </h1>
        <p className="mt-5 text-xs tracking-[0.3em] text-violet-300/70 uppercase">
          Magical software for visionaries
        </p>
        {/* <span className="mt-10 text-violet-300/40 text-sm animate-bounce">↓</span> */}
      </div>
    </section>
  );
}
