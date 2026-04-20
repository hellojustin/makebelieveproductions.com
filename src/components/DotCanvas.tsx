"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import type { ImageToDotsResult } from "@/lib/image-to-dots";

const STIFFNESS = 0.06;
const DAMPING = 0.82;
const REPULSION_RADIUS = 120;
const REPULSION_STRENGTH = 6;
const CYCLE_INTERVAL = 10000;   // ms between image transitions
const CASCADE_DURATION = 1500; // ms for the arc wavefront to sweep across the canvas
const MORPH_SPEED = 0.12;      // exponential approach per frame — ~99% done in 0.5s

const OSC_AMPLITUDE = 2;               // px of gentle drift
const OSC_PERIOD = 4000;               // ms for one full oscillation cycle

const TEXT_EXCLUSION_PADDING_LEFT = 100; // px on left and right of text block
const TEXT_EXCLUSION_PADDING_RIGHT = 100; // px on left and right of text block
const TEXT_EXCLUSION_PADDING_TOP  = 64; // px above text block
const TEXT_EXCLUSION_PADDING_BTM  = 200; // px below text block

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
  textRef?: React.RefObject<HTMLDivElement | null>;
}

interface Manifest {
  generatedAt: string;
  images: string[];
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
  function DotCanvas({ className, style, textRef }, ref) {
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
    let imageFiles: string[] = [];

    function loadImage(index: number): Promise<ImageToDotsResult> {
      const filename = imageFiles[index];
      return fetch(`/data/${filename}`).then((r) => r.json());
    }

    function loadManifest(): Promise<Manifest> {
      return fetch("/data/manifest.json").then((r) => r.json());
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
        exLeft   -= TEXT_EXCLUSION_PADDING_LEFT;
        exTop    -= TEXT_EXCLUSION_PADDING_TOP;
        exRight  += TEXT_EXCLUSION_PADDING_RIGHT;
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

    // Boot: start animation immediately so the canvas is alive while the
    // manifest + first image stream in, then begin cycling.
    resize(null);
    animationId = requestAnimationFrame(tick);

    loadManifest()
      .then((manifest) => {
        imageFiles = manifest.images ?? [];
        if (imageFiles.length === 0) {
          console.warn("[DotCanvas] manifest contained no images");
          return;
        }
        return loadImage(0).then((data) => {
          currentData = data;
          buildDots(data, canvas!.clientWidth, canvas!.clientHeight);
          preloadNext();
          if (imageFiles.length > 1) {
            cycleTimer = setInterval(cycleImage, CYCLE_INTERVAL);
          }
        });
      })
      .catch((err) => {
        console.error("[DotCanvas] failed to load manifest", err);
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
});

export default DotCanvas;
