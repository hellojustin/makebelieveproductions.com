"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import type { ImageToDotsResult } from "@/lib/image-to-dots";
import { heroManifest } from "@/data/manifest";

const STIFFNESS = 0.06;
const DAMPING = 0.82;
const REPULSION_RADIUS = 120;
const REPULSION_STRENGTH = 6;
const CYCLE_INTERVAL = 10000;   // ms between image transitions
const CASCADE_DURATION = 1500; // ms for the arc wavefront to sweep across the canvas
const MORPH_SPEED = 0.12;      // exponential approach per frame — ~99% done in 0.5s

const OSC_AMPLITUDE = 2;               // px of gentle drift
const OSC_PERIOD = 4000;               // ms for one full oscillation cycle

// Persistent dot strip at the top of the viewport once the hero has been
// scrolled past. Dots above STRIP_HEIGHT_PX always render; dots below
// FADE_BAND_PX past that always drop; dots in the band drop probabilistically
// (each dot's stable `roll` is compared against a falloff that ramps from 1
// to 0 across the band). The strip's bottom edge slides up as the user
// scrolls — at scroll=0 the cutoff is below the canvas (no dots dropped),
// and by the time the page has scrolled one viewport-height the cutoff has
// reached STRIP_HEIGHT_PX, leaving only the header band visible.
const STRIP_HEIGHT_PX = 55;
const FADE_BAND_PX = 15;

// Page background color, drawn behind the dots so content scrolling under
// the dot region dissolves to invisibility before it can show through the
// gaps between sparse dots. Must match --mbp-color-bg in globals.scss.
const BG_R = 8;
const BG_G = 5;
const BG_B = 26;
const BG_OPAQUE = `rgb(${BG_R},${BG_G},${BG_B})`;
const BG_TRANSPARENT = `rgba(${BG_R},${BG_G},${BG_B},0)`;

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
  // Per-dot oscillation
  oscDx: number;
  oscDy: number;
  oscPhase: number;
  // Per-dot mouse reaction variation
  repMul: number;
  stiffMul: number;
}

export interface DotCanvasHandle {
  pause: () => void;
  play: () => void;
  next: () => void;
  prev: () => void;
  isPaused: () => boolean;
}

interface DotCanvasProps {
  className?: string;
  style?: React.CSSProperties;
}

interface ArcCurve {
  p0x: number; p0y: number;
  p1x: number; p1y: number;
  p2x: number; p2y: number;
}

function edgePoint(edge: number, w: number, h: number): [number, number] {
  const t = 0.1 + Math.random() * 0.8;
  switch (edge) {
    case 0: return [t * w, 0];
    case 1: return [w, t * h];
    case 2: return [t * w, h];
    case 3: return [0, t * h];
    default: return [0, 0];
  }
}

function generateRandomArc(w: number, h: number): ArcCurve {
  const startEdge = Math.floor(Math.random() * 4);
  const r = Math.random();
  const endEdge = r < 0.6
    ? (startEdge + 2) % 4
    : r < 0.8
      ? (startEdge + 1) % 4
      : (startEdge + 3) % 4;

  const [p0x, p0y] = edgePoint(startEdge, w, h);
  const [p2x, p2y] = edgePoint(endEdge, w, h);

  const mx = (p0x + p2x) / 2;
  const my = (p0y + p2y) / 2;
  const dx = p2x - p0x;
  const dy = p2y - p0y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;
  const offset = (0.3 + Math.random() * 0.5) * Math.max(w, h)
    * (Math.random() < 0.5 ? 1 : -1);

  return {
    p0x, p0y,
    p1x: mx + perpX * offset,
    p1y: my + perpY * offset,
    p2x, p2y,
  };
}

function evalQuadBezier(arc: ArcCurve, t: number): [number, number] {
  const u = 1 - t;
  return [
    u * u * arc.p0x + 2 * u * t * arc.p1x + t * t * arc.p2x,
    u * u * arc.p0y + 2 * u * t * arc.p1y + t * t * arc.p2y,
  ];
}

function closestOnArc(
  arc: ArcCurve, px: number, py: number,
): { t: number; dist: number } {
  const SAMPLES = 80;
  let bestT = 0;
  let bestD2 = Infinity;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const [bx, by] = evalQuadBezier(arc, t);
    const d2 = (px - bx) ** 2 + (py - by) ** 2;
    if (d2 < bestD2) {
      bestD2 = d2;
      bestT = t;
    }
  }
  return { t: bestT, dist: Math.sqrt(bestD2) };
}

const DotCanvas = forwardRef<DotCanvasHandle, DotCanvasProps>(
  function DotCanvas({ className, style }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<DotCanvasHandle>({
    pause() {}, play() {}, next() {}, prev() {}, isPaused() { return false; },
  });

  useImperativeHandle(ref, () => ({
    pause:    () => controlsRef.current.pause(),
    play:     () => controlsRef.current.play(),
    next:     () => controlsRef.current.next(),
    prev:     () => controlsRef.current.prev(),
    isPaused: () => controlsRef.current.isPaused(),
  }), []);

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
    let paused = false;
    // The manifest is bundled at build time via scripts/process-images.ts,
    // so the image list is available synchronously and can never fail with
    // a runtime "Load failed". The hero JSONs themselves are still fetched
    // lazily because they're large (~3MB each).
    const imageFiles = heroManifest.images;

    function loadImage(index: number): Promise<ImageToDotsResult> {
      const filename = imageFiles[index];
      return fetch(`/data/${filename}`).then((r) => r.json());
    }

    function buildDots(data: ImageToDotsResult, canvasW: number, canvasH: number) {
      const scale = Math.max(canvasW / data.canvasWidth, canvasH / data.canvasHeight);
      const offsetX = (canvasW - data.canvasWidth * scale) / 2;
      const offsetY = (canvasH - data.canvasHeight * scale) / 2;

      dots = data.dots.map((d) => {
        const hx = d.x * data.canvasWidth * scale + offsetX;
        const hy = d.y * data.canvasHeight * scale + offsetY;
        const sz = d.size * scale;
        const angle = Math.random() * Math.PI * 2;
        return {
          homeX: hx, homeY: hy,
          x: hx, y: hy,
          vx: 0, vy: 0,
          r: d.r, g: d.g, b: d.b, size: sz,
          tr: d.r, tg: d.g, tb: d.b, ts: sz,
          morphAt: 0,
          roll: Math.random(),
          oscDx: Math.cos(angle),
          oscDy: Math.sin(angle),
          oscPhase: Math.random() * Math.PI * 2,
          repMul: 0.3 + Math.random() * 2.2,
          stiffMul: 0.3 + Math.random() * 1.0,
        };
      });
    }

    function applyTransition(data: ImageToDotsResult, canvasW: number, canvasH: number) {
      const scale = Math.max(canvasW / data.canvasWidth, canvasH / data.canvasHeight);
      const now = performance.now();
      const n = Math.min(dots.length, data.dots.length);

      const arc = generateRandomArc(canvasW, canvasH);
      const maxDiag = Math.sqrt(canvasW * canvasW + canvasH * canvasH);

      for (let i = 0; i < n; i++) {
        const d = data.dots[i];
        dots[i].tr = d.r;
        dots[i].tg = d.g;
        dots[i].tb = d.b;
        dots[i].ts = d.size * scale;

        const { t, dist } = closestOnArc(arc, dots[i].homeX, dots[i].homeY);
        const arcDelay = t * CASCADE_DURATION;
        const distDelay = (dist / maxDiag) * CASCADE_DURATION * 0.7;
        dots[i].morphAt = now + arcDelay + distDelay + Math.random() * 100;
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
      if (imageFiles.length < 2) return;
      const nextIndex = (currentImageIndex + 1) % imageFiles.length;
      loadImage(nextIndex).then((data) => {
        preloadedData = data;
      });
    }

    function cycleImage() {
      if (paused || !preloadedData || dots.length === 0 || imageFiles.length < 2) return;
      currentImageIndex = (currentImageIndex + 1) % imageFiles.length;
      applyTransition(preloadedData, canvas!.clientWidth, canvas!.clientHeight);
      preloadedData = null;
      preloadNext();
    }

    function goToImage(index: number) {
      if (dots.length === 0 || imageFiles.length === 0) return;
      loadImage(index).then((data) => {
        currentImageIndex = index;
        applyTransition(data, canvas!.clientWidth, canvas!.clientHeight);
        preloadedData = null;
        preloadNext();
      });
    }

    function resetTimer() {
      clearInterval(cycleTimer);
      if (imageFiles.length > 1) {
        cycleTimer = setInterval(cycleImage, CYCLE_INTERVAL);
      }
    }

    controlsRef.current = {
      pause() { paused = true; },
      play()  { paused = false; resetTimer(); },
      isPaused() { return paused; },
      next() {
        if (imageFiles.length === 0) return;
        goToImage((currentImageIndex + 1) % imageFiles.length);
        if (!paused) resetTimer();
      },
      prev() {
        if (imageFiles.length === 0) return;
        goToImage((currentImageIndex - 1 + imageFiles.length) % imageFiles.length);
        if (!paused) resetTimer();
      },
    };

    function tick() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      ctx!.clearRect(0, 0, w, h);

      // Slide the fade region upward as the page scrolls. At scrollY=0 the
      // fade starts at the canvas's bottom edge (so nothing is dropped); by
      // the time the user has scrolled one full viewport, it's reached
      // STRIP_HEIGHT_PX from the top. The canvas is fixed at the top of the
      // viewport, so dot.homeY is in viewport coordinates.
      const scrollProgress = Math.min(window.scrollY / h, 1);
      const fadeStart = h - (h - STRIP_HEIGHT_PX) * scrollProgress;

      // Cover content scrolling behind the dot region with the page bg:
      // opaque above the fade band, fading to transparent across the band.
      // Without this, content text would peek through the gaps between
      // sparse dots and look muddy. The cover and the per-dot fade share
      // fadeStart, so they always dissolve in lockstep.
      ctx!.fillStyle = BG_OPAQUE;
      ctx!.fillRect(0, 0, w, fadeStart);
      const cover = ctx!.createLinearGradient(0, fadeStart, 0, fadeStart + FADE_BAND_PX);
      cover.addColorStop(0, BG_OPAQUE);
      cover.addColorStop(1, BG_TRANSPARENT);
      ctx!.fillStyle = cover;
      ctx!.fillRect(0, fadeStart, w, FADE_BAND_PX);

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
          const force = (1 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH * dot.repMul;
          dot.vx += (dx / dist) * force;
          dot.vy += (dy / dist) * force;
        }
        const osc = Math.sin(now * (Math.PI * 2 / OSC_PERIOD) + dot.oscPhase) * OSC_AMPLITUDE;
        const stiff = STIFFNESS * dot.stiffMul;
        dot.vx += (dot.homeX + dot.oscDx * osc - dot.x) * stiff;
        dot.vy += (dot.homeY + dot.oscDy * osc - dot.y) * stiff;
        dot.vx *= DAMPING;
        dot.vy *= DAMPING;
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Probabilistic drop: dots above the fade band always render, dots
        // past the band never render, dots inside the band render based on
        // their stable per-dot roll vs. a linear keep-probability. This
        // produces "fewer dots" rather than "fainter dots" through the seam.
        if (dot.homeY > fadeStart) {
          const t = Math.min((dot.homeY - fadeStart) / FADE_BAND_PX, 1);
          if (dot.roll > 1 - t) continue;
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

    // Boot: start animation immediately so the canvas is alive while the
    // first image streams in, then begin cycling.
    resize(null);
    animationId = requestAnimationFrame(tick);

    if (imageFiles.length === 0) {
      console.warn("[DotCanvas] heroManifest contained no images");
    } else {
      loadImage(0)
        .then((data) => {
          currentData = data;
          buildDots(data, canvas!.clientWidth, canvas!.clientHeight);
          preloadNext();
          if (imageFiles.length > 1) {
            cycleTimer = setInterval(cycleImage, CYCLE_INTERVAL);
          }
        })
        .catch((err) => {
          console.error("[DotCanvas] failed to load first image", err);
        });
    }

    // Pointer tracking lives on `window` rather than the canvas itself so
    // the canvas can stay `pointer-events: none` (it never intercepts taps,
    // scrolls, or clicks meant for content below). Coordinates are raw
    // viewport coords because the canvas is fixed and fills the viewport.
    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    function onPointerLeave() { mouseX = -9999; mouseY = -9999; }

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      mouseX = t.clientX;
      mouseY = t.clientY;
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      mouseX = t.clientX;
      mouseY = t.clientY;
    }
    function onTouchEnd() { mouseX = -9999; mouseY = -9999; }
    function onTouchCancel() { mouseX = -9999; mouseY = -9999; }

    function onResize() { resize(currentData); }

    window.addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchCancel);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(cycleTimer);
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={style} />;
});

export default DotCanvas;
