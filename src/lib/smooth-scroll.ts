import type Lenis from "lenis";

/**
 * Site-wide inertia scrolling (Lenis). Desktop mouse/trackpad only: touch devices keep the
 * phone's own native scrolling, and visitors who ask for reduced motion get plain scrolling.
 * Lenis drives the real window scroll position, so existing scroll listeners,
 * IntersectionObservers and position: sticky keep working unchanged.
 */
let lenis: Lenis | null = null;

export function getLenis() {
  return lenis;
}

export async function startSmoothScroll(): Promise<() => void> {
  if (typeof window === "undefined" || lenis) return () => {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchOnly = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (reduce || touchOnly) return () => {};
  const { default: LenisCtor } = await import("lenis");
  const instance = new LenisCtor({
    lerp: 0.085,
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    anchors: true,
    autoRaf: true,
    // Let scrollable inner panels (mobile menu, dropdowns, dialogs) scroll on their own.
    prevent: (node) => node.closest?.("[data-lenis-prevent], .qn-drawer-panel, [role='dialog']") != null,
  });
  lenis = instance;
  return () => {
    instance.destroy();
    if (lenis === instance) lenis = null;
  };
}

/** Smoothly scroll to the top (falls back to native smooth scroll). */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.2 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}
