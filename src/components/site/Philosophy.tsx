import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";

const LINE = "We design for the decade, not the season.";

export function Philosophy() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup = () => {};

    loadGsap().then(({ gsap }) => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-word]",
          { opacity: 0.12, filter: "blur(4px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 75%",
              end: "bottom 65%",
              scrub: 0.6,
            },
          },
        );
      }, el);
      cleanup = () => ctx.revert();
    });

    return () => cleanup();
  }, []);

  return (
    <section ref={ref} className="edge border-t border-border py-32 md:py-52">
      <p className="eyebrow mb-12">06 — Philosophy</p>
      <h2 className="display-lg max-w-5xl">
        {LINE.split(" ").map((word) => (
          <span key={word} data-word className="mr-[0.28em] inline-block">
            {word}
          </span>
        ))}
      </h2>
      <div className="mt-16 grid gap-10 border-t border-border pt-10 md:grid-cols-3">
        {[
          ["Material first", "Wool from Biella, cashmere from Inner Mongolia, nothing blended down."],
          ["Made in limited runs", "Small production, no surplus, no discounting cycle."],
          ["Repaired, not replaced", "Every piece carries a lifetime repair record."],
        ].map(([title, copy]) => (
          <div key={title}>
            <h3 className="label-xs mb-3">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}