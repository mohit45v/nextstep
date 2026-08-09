"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * True when the user has asked the OS to minimise animation.
 *
 * `useSyncExternalStore` rather than useState + useEffect: a media query is an
 * external store, and reading it this way avoids a setState during the first
 * effect (which would render the animated state for one frame before
 * correcting itself). The third argument is the server snapshot — assume no
 * preference during SSR and let the client correct on hydration.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * Fires once when an element first scrolls into view.
 *
 * IntersectionObserver rather than scroll listeners: the browser does the work
 * off the main thread, so this costs nothing while scrolling. It also
 * disconnects after the first hit — reveal animations should never replay and
 * re-trigger as the user scrolls back up.
 *
 * Users who ask for reduced motion are reported as in-view immediately, so
 * content is never hidden from them waiting on an animation that will not run.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const ref = useRef<T>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px" } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, reducedMotion]);

  return { ref, inView: hasEntered || reducedMotion };
}
