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
  // True if this dot sits inside the text exclusion zone — always kept invisible
  excluded: boolean;
}

interface DotCanvasProps {
  className?: string;
  textRef?: React.RefObject<HTMLDivElement | null>;
}

const TEXT_EXCLUSION_PADDING = 28; // px around the text block to keep clear

export default function DotCanvas({ className, textRef }: DotCanvasProps) {
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

      // Compute text exclusion zone in canvas-local coordinates
      let exLeft = Infinity, exTop = Infinity, exRight = -Infinity, exBottom = -Infinity;
      if (textRef?.current && canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const textRect = textRef.current.getBoundingClientRect();
        // The text block uses `inset-0 justify-end` so it spans the full width —
        // find the tight bounding box of actual text content (the last ~3 children)
        const children = Array.from(textRef.current.children) as HTMLElement[];
        if (children.length > 0) {
          let cLeft = Infinity, cTop = Infinity, cRight = -Infinity, cBottom = -Infinity;
          for (const child of children) {
            const r = child.getBoundingClientRect();
            cLeft   = Math.min(cLeft,   r.left);
            cTop    = Math.min(cTop,    r.top);
            cRight  = Math.max(cRight,  r.right);
            cBottom = Math.max(cBottom, r.bottom);
          }
          const pad = TEXT_EXCLUSION_PADDING;
          exLeft   = cLeft   - canvasRect.left - pad;
          exTop    = cTop    - canvasRect.top  - pad;
          exRight  = cRight  - canvasRect.left + pad;
          exBottom = cBottom - canvasRect.top  + pad;
        } else {
          // Fallback: use the full textRef rect width but only the bottom portion
          const pad = TEXT_EXCLUSION_PADDING;
          exLeft   = textRect.left  - canvasRect.left - pad;
          exTop    = textRect.top   - canvasRect.top  - pad;
          exRight  = textRect.right - canvasRect.left + pad;
          exBottom = textRect.bottom - canvasRect.top + pad;
        }
      }

      const hasExclusion = exRight > exLeft && exBottom > exTop;

      dots = data.dots.map((d) => {
        const hx = d.x * data.canvasWidth * scale + offsetX;
        const hy = d.y * data.canvasHeight * scale + offsetY;
        const excluded = hasExclusion && hx >= exLeft && hx <= exRight && hy >= exTop && hy <= exBottom;
        const sz = excluded ? 0 : d.size * scale;
        return {
          homeX: hx, homeY: hy,
          x: hx, y: hy,
          vx: 0, vy: 0,
          r: d.r, g: d.g, b: d.b, size: sz,
          tr: d.r, tg: d.g, tb: d.b, ts: sz,
          morphAt: 0,
          excluded,
        };
      });
    }

    function applyTransition(data: ImageToDotsResult, canvasW: number, canvasH: number) {
      const scale = Math.max(canvasW / data.canvasWidth, canvasH / data.canvasHeight);
      const now = performance.now();
      const n = Math.min(dots.length, data.dots.length);
      for (let i = 0; i < n; i++) {
        if (dots[i].excluded) continue;
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

        if (dot.excluded) continue;
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

  return <canvas ref={canvasRef} className={className} />;
}
