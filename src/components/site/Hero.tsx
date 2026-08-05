import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { loadGsap } from "@/lib/gsap";
import runwayVideo from "@/assets/runway.mp4.asset.json";

const WORDS = ["Quiet", "Structure"];

export function Hero() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let cleanup = () => {};

    loadGsap().then(({ gsap }) => {
      const ctx = gsap.context(() => {
        gsap.to("[data-hero-media]", {
          yPercent: 22,
          scale: 1.12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-hero-content]", {
          yPercent: -35,
          opacity: 0,
          filter: "blur(10px)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });
      }, el);
      cleanup = () => ctx.revert();
    });

    return () => cleanup();
  }, []);

  return (
    <section
      ref={section}
      id="top"
      className="grain relative h-svh w-full overflow-hidden bg-ink text-background"
    >
      <div data-hero-media className="absolute inset-0 will-change-transform">
        <video
          className="h-full w-full object-cover opacity-70 grayscale"
          src={runwayVideo.url}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/25 to-ink/85" />
      </div>

      <div
        data-hero-content
        className="edge relative flex h-full flex-col justify-end pb-14 md:pb-16"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 1 }}
          className="eyebrow mb-8 text-background/60"
        >
          Autumn — Winter 26 / Collection Zero
        </motion.p>

        <h1 className="display-xl">
          {WORDS.map((word, i) => (
            <span key={word} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  delay: 1.5 + i * 0.12,
                  duration: 1.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col gap-8 border-t border-background/15 pt-8 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-sm text-sm leading-relaxed text-background/70">
            Garments cut for permanence. A monochrome wardrobe shaped by proportion, weight and
            restraint.
          </p>
          <div className="flex items-center gap-8">
            <a href="#collection" className="label-xs link-underline">
              View collection
            </a>
            <a href="#stylist" className="label-xs link-underline text-background/60">
              AI Stylist
            </a>
          </div>
        </motion.div>
      </div>

      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="label-xs absolute top-1/2 right-5 hidden -translate-y-1/2 rotate-90 text-background/40 md:right-8 md:block"
      >
        Scroll
      </motion.span>
    </section>
  );
}