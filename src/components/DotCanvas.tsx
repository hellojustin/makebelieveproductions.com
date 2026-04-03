"use client";

import { useEffect, useRef } from "react";
import type { ImageToDotsResult } from "@/lib/image-to-dots";

const STIFFNESS = 0.06;
const DAMPING = 0.82;
const REPULSION_RADIUS = 120;
const REPULSION_STRENGTH = 6;

interface DotState {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  g: number;
  b: number;
  size: number;
}

interface DotCanvasProps {
  className?: string;
}

export default function DotCanvas({ className }: DotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let dots: DotState[] = [];
    let mouseX = -9999;
    let mouseY = -9999;

    function buildDots(data: ImageToDotsResult, canvasW: number, canvasH: number) {
      // Cover scaling: always fill the canvas, crop overflow edges (like CSS background-size: cover)
      const scale = Math.max(canvasW / data.canvasWidth, canvasH / data.canvasHeight);
      const offsetX = (canvasW - data.canvasWidth * scale) / 2;
      const offsetY = (canvasH - data.canvasHeight * scale) / 2;

      dots = data.dots.map((d) => {
        const hx = d.x * data.canvasWidth * scale + offsetX;
        const hy = d.y * data.canvasHeight * scale + offsetY;
        return {
          homeX: hx,
          homeY: hy,
          x: hx,
          y: hy,
          vx: 0,
          vy: 0,
          r: d.r,
          g: d.g,
          b: d.b,
          size: d.size * scale,
        };
      });
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

    function tick() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      ctx!.clearRect(0, 0, w, h);

      for (const dot of dots) {
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

        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, Math.max(dot.size, 0.5), 0, Math.PI * 2);
        ctx!.fillStyle = `rgb(${dot.r},${dot.g},${dot.b})`;
        ctx!.fill();
      }

      animationId = requestAnimationFrame(tick);
    }

    let data: ImageToDotsResult | null = null;

    // Start animation immediately (empty canvas until data loads)
    resize(null);
    animationId = requestAnimationFrame(tick);

    // Fetch dot data non-blocking
    fetch("/data/hero-dots.json")
      .then((r) => r.json())
      .then((json: ImageToDotsResult) => {
        data = json;
        buildDots(data, canvas!.clientWidth, canvas!.clientHeight);
      });

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouseX = -9999;
      mouseY = -9999;
    }

    // Touch: passive listeners so the browser scrolls freely — we just read position
    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      const rect = canvas!.getBoundingClientRect();
      mouseX = touch.clientX - rect.left;
      mouseY = touch.clientY - rect.top;
    }

    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0];
      const rect = canvas!.getBoundingClientRect();
      mouseX = touch.clientX - rect.left;
      mouseY = touch.clientY - rect.top;
    }

    function onTouchEnd() {
      mouseX = -9999;
      mouseY = -9999;
    }

    function onTouchCancel() {
      mouseX = -9999;
      mouseY = -9999;
    }

    function onResize() {
      resize(data);
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchCancel);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
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
