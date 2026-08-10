import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { loadGsap } from "@/lib/gsap";
import { Breadcrumb, type Crumb } from "./Breadcrumb";

export function CategoryHero({
  eyebrow,
  title,
  description,
  image,
  crumbs,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  crumbs: Crumb[];
}) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let cleanup = () => {};
    loadGsap().then(({ gsap }) => {
      const ctx = gsap.context(() => {
        gsap.to("[data-cat-media]", {
          yPercent: 18,
          scale: 1.1,
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
      className="grain relative flex h-[68svh] min-h-[440px] w-full flex-col justify-end overflow-hidden bg-ink text-background"
    >
      <div data-cat-media className="absolute inset-0 will-change-transform">
        <img src={image} alt="" aria-hidden className="h-full w-full object-cover opacity-65 grayscale" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/75 via-ink/25 to-ink/85" />
      </div>

      <div className="edge relative pb-14 md:pb-16">
        <Breadcrumb items={crumbs} className="mb-8 text-background/70" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="eyebrow mb-6 text-background/60"
        >
          {eyebrow}
        </motion.p>
        <h1 className="display-lg overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {title}
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-md text-sm leading-relaxed text-background/70"
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
}
