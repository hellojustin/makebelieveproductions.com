"use client";

import React, { useEffect, useRef } from "react";
import type { ImageToDotsResult } from "@/lib/image-to-dots";

const STIFFNESS = 0.06;
const DAMPING = 0.82;
const REPULSION_RADIUS = 120;
const REPULSION_STRENGTH = 6;
const IMAGE_COUNT = 6;
const CYCLE_INTERVAL = 5000;   // ms between image transitions
const CASCADE_DURATION = 1500; // ms over which dots stagger their transition start
const MORPH_SPEED = 0.12;      // exponential approach per frame — ~99% done in 0.5s

const TEXT_EXCLUSION_PADDING_SIDE = 72; // px on left and right of text block
const TEXT_EXCLUSION_PADDING_TOP  = 64; // px above text block
const TEXT_EXCLUSION_PADDING_BTM  = 64; // px below text block

interface DotState {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Current rendered values
  r: number;
  g: number;
  b: number;
  size: number;
  // Morph targets
  tr: number;
  tg: number;
  tb: number;
  ts: number;
  // Cascade: timestamp after which this dot starts morphing
  morphAt: number;
  // Stable random roll [0,1] used for per-frame probabilistic exclusion
  roll: number;
}

interface DotCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  textRef?: React.RefObject<HTMLDivElement | null>;
}

export default function DotCanvas({ className, style, textRef }: DotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let cycleTimer: ReturnType<typeof setInterval>;
    let dots: DotState[] = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let currentImageIndex = 0;
    let currentData: ImageToDotsResult | null = null;
    let preloadedData: ImageToDotsResult | null = null;

    function loadImage(index: number): Promise<ImageToDotsResult> {
      return fetch(`/data/dots-${index + 1}.json`).then((r) => r.json());
    }

    function buildDots(data: ImageToDotsResult, canvasW: number, canvasH: number) {
      const scale = Math.max(canvasW / data.canvasWidth, canvasH / data.canvasHeight);
      const offsetX = (canvasW - data.canvasWidth * scale) / 2;
      const offsetY = (canvasH - data.canvasHeight * scale) / 2;

      dots = data.dots.map((d) => {
        const hx = d.x * data.canvasWidth * scale + offsetX;
        const hy = d.y * data.canvasHeight * scale + offsetY;
        const sz = d.size * scale;
        return {
          homeX: hx, homeY: hy,
          x: hx, y: hy,
          vx: 0, vy: 0,
          r: d.r, g: d.g, b: d.b, size: sz,
          tr: d.r, tg: d.g, tb: d.b, ts: sz,
          morphAt: 0,
          roll: Math.random(),
        };
      });
    }

    function applyTransition(data: ImageToDotsResult, canvasW: number, canvasH: number) {
      const scale = Math.max(canvasW / data.canvasWidth, canvasH / data.canvasHeight);
      const now = performance.now();
      const n = Math.min(dots.length, data.dots.length);
      for (let i = 0; i < n; i++) {
        const d = data.dots[i];
        dots[i].tr = d.r;
        dots[i].tg = d.g;
        dots[i].tb = d.b;
        dots[i].ts = d.size * scale;
        dots[i].morphAt = now + Math.random() * CASCADE_DURATION;
      }
    }

    function resize(data: ImageToDotsResult | null) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.scale(dpr, dpr);
      if (data) buildDots(data, w, h);
    }

    function preloadNext() {
      const nextIndex = (currentImageIndex + 1) % IMAGE_COUNT;
      loadImage(nextIndex).then((data) => {
        preloadedData = data;
      });
    }

    function cycleImage() {
      if (!preloadedData || dots.length === 0) return;
      currentImageIndex = (currentImageIndex + 1) % IMAGE_COUNT;
      applyTransition(preloadedData, canvas!.clientWidth, canvas!.clientHeight);
      preloadedData = null;
      preloadNext();
    }

    function tick() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      ctx!.clearRect(0, 0, w, h);

      // Measure text exclusion zone each frame using live viewport coordinates.
      // Because the canvas is fixed (inset-0), viewport coords == canvas coords.
      let hasExclusion = false;
      let exCx = 0, exCy = 0, exHw = 0, exHh = 0, exR = 0, exScale = 0;
      if (textRef?.current) {
        const children = Array.from(textRef.current.children) as HTMLElement[];
        const elements = children.length > 0 ? children : [textRef.current];
        let exLeft = Infinity, exTop = Infinity, exRight = -Infinity, exBottom = -Infinity;
        for (const el of elements) {
          const r = el.getBoundingClientRect();
          exLeft   = Math.min(exLeft,   r.left);
          exTop    = Math.min(exTop,    r.top);
          exRight  = Math.max(exRight,  r.right);
          exBottom = Math.max(exBottom, r.bottom);
        }
        exLeft   -= TEXT_EXCLUSION_PADDING_SIDE;
        exTop    -= TEXT_EXCLUSION_PADDING_TOP;
        exRight  += TEXT_EXCLUSION_PADDING_SIDE;
        exBottom += TEXT_EXCLUSION_PADDING_BTM;

        if (exRight > exLeft && exBottom > exTop) {
          hasExclusion = true;
          exCx   = (exLeft + exRight) / 2;
          exCy   = (exTop + exBottom) / 2;
          exHw   = (exRight - exLeft) / 2;
          exHh   = (exBottom - exTop) / 2;
          exR    = Math.min(exHw, exHh) * 0.7;
          exScale = Math.min(exHw, exHh);
        }
      }

      const now = performance.now();
      for (const dot of dots) {
        // Morph toward target color and size (cascade: wait until morphAt)
        if (now >= dot.morphAt) {
          dot.r += (dot.tr - dot.r) * MORPH_SPEED;
          dot.g += (dot.tg - dot.g) * MORPH_SPEED;
          dot.b += (dot.tb - dot.b) * MORPH_SPEED;
          dot.size += (dot.ts - dot.size) * MORPH_SPEED;
        }

        // Spring physics + mouse repulsion
        const dx = dot.x - mouseX;
        const dy = dot.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPULSION_RADIUS && dist > 0) {
          const force = (1 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH;
          dot.vx += (dx / dist) * force;
          dot.vy += (dy / dist) * force;
        }
        dot.vx += (dot.homeX - dot.x) * STIFFNESS;
        dot.vy += (dot.homeY - dot.y) * STIFFNESS;
        dot.vx *= DAMPING;
        dot.vy *= DAMPING;
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Bottom fade: 100px band, reaches 0% at 10px before the content edge
        // HeroSection is calc(100vh + 100px), so services start 100px below the fold
        const contentTopY = window.innerHeight + 100 - Math.min(window.scrollY, window.innerHeight);
        if (dot.homeY > contentTopY - 100) {
          const t = Math.min((dot.homeY - (contentTopY - 100)) / 90, 1);
          if (dot.roll > 1 - t) continue;
        }

        // Per-frame exclusion: test home position against the live text zone
        if (hasExclusion) {
          const qx = Math.abs(dot.homeX - exCx) - exHw + exR;
          const qy = Math.abs(dot.homeY - exCy) - exHh + exR;
          const sdf = Math.min(Math.max(qx, qy), 0)
                    + Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2)
                    - exR;
          if (sdf < 0) {
            const depth = -sdf / exScale;
            let keepProb: number;
            if (depth < 0.1) {
              keepProb = 1 - (0.6 * depth / 0.1);            // 1.0 → 0.30
            } else if (depth < 0.3) {
              keepProb = 0.3 - (0.25 * (depth - 0.1) / 0.2); // 0.30 → 0.05
            } else {
              keepProb = 0.0;
            }
            if (dot.roll > keepProb) continue;
          }
        }

        const radius = Math.max(dot.size, 0.3);
        if (radius < 0.1) continue;

        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgb(${Math.round(dot.r)},${Math.round(dot.g)},${Math.round(dot.b)})`;
        ctx!.fill();
      }

      animationId = requestAnimationFrame(tick);
    }

    // Boot: start animation immediately, load first image, then begin cycling
    resize(null);
    animationId = requestAnimationFrame(tick);

    loadImage(0).then((data) => {
      currentData = data;
      buildDots(data, canvas!.clientWidth, canvas!.clientHeight);
      preloadNext();
      cycleTimer = setInterval(cycleImage, CYCLE_INTERVAL);
    });

    // Mouse
    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }
    function onMouseLeave() { mouseX = -9999; mouseY = -9999; }

    // Touch
    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      const rect = canvas!.getBoundingClientRect();
      mouseX = t.clientX - rect.left;
      mouseY = t.clientY - rect.top;
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      const rect = canvas!.getBoundingClientRect();
      mouseX = t.clientX - rect.left;
      mouseY = t.clientY - rect.top;
    }
    function onTouchEnd() { mouseX = -9999; mouseY = -9999; }
    function onTouchCancel() { mouseX = -9999; mouseY = -9999; }

    function onResize() { resize(currentData); }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchCancel);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(cycleTimer);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={style} />;
}
