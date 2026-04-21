"use client";

import { useEffect, type RefObject } from "react";

/**
 * Pins a `position: fixed` element to the visual viewport (rather than
 * the layout viewport) so it stays aligned with the visible top edge on
 * iOS Safari, where the two coordinate spaces diverge during URL-bar
 * transitions, dynamic-island shifts, and momentum overscroll.
 *
 * Applies `transform: translateY(window.visualViewport.offsetTop)` on
 * every visual-viewport scroll/resize. The transform owns the
 * element's `transform` property — don't set it from CSS or other
 * code on the same element.
 *
 * Older browsers without the Visual Viewport API silently no-op (the
 * element behaves the same as it would have without this hook).
 */
export function useVisualViewportPin(
  ref: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const el = ref.current;
    const vv = window.visualViewport;
    if (!el || !vv) return;

    const sync = () => {
      el.style.transform = `translateY(${vv.offsetTop}px)`;
    };
    sync();
    vv.addEventListener("scroll", sync);
    vv.addEventListener("resize", sync);
    return () => {
      vv.removeEventListener("scroll", sync);
      vv.removeEventListener("resize", sync);
    };
  }, [ref]);
}