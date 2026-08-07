import { useEffect } from "react";

/** Lenis smooth scrolling wired into the GSAP ScrollTrigger ticker. */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let destroy = () => {};

    (async () => {
      try {
        const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
          duration: 1.15,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        destroy = () => {
          gsap.ticker.remove(raf);
          lenis.destroy();
        };
      } catch (err) {
        // Fallback gracefully if smooth scroll is disabled
      }
    })();

    return () => destroy();
  }, []);

  return null;
}