import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";
import ed1 from "@/assets/editorial-1.jpg";
import ed2 from "@/assets/editorial-2.jpg";
import ed3 from "@/assets/editorial-3.jpg";
import ed4 from "@/assets/editorial-4.jpg";

const PANELS = [
  { title: "The Long Line", copy: "Coats cut to the ankle, weighted to fall without effort.", image: ed1 },
  { title: "Negative Space", copy: "Volume held in reserve. What is left out defines the piece.", image: ed2 },
  { title: "Hand & Yarn", copy: "Cashmere spun in small runs, finished by hand in Biella.", image: ed3 },
  { title: "Matter", copy: "Black on black — surface studied under a single light.", image: ed4 },
];

export function EditorialScroll() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = section.current;
    const inner = track.current;
    if (!el || !inner) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    let cleanup = () => {};
    loadGsap().then(({ gsap }) => {
      const ctx = gsap.context(() => {
        const distance = () => inner.scrollWidth - window.innerWidth;
        gsap.to(inner, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }, el);
      cleanup = () => ctx.revert();
    });

    return () => cleanup();
  }, []);

  return (
    <section
      ref={section}
      id="editorial"
      className="relative overflow-hidden bg-ink text-background md:h-svh"
    >
      <div className="edge pt-24 md:absolute md:top-0 md:z-10 md:pt-16">
        <p className="eyebrow text-background/50">05 — Editorial</p>
      </div>

      <div
        ref={track}
        className="flex flex-col gap-16 px-5 py-16 md:h-full md:w-max md:flex-row md:items-center md:gap-10 md:px-10 md:py-0 xl:px-16"
      >
        <div className="max-w-md shrink-0 md:pr-10">
          <h2 className="display-lg">
            The
            <br />
            Archive
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-background/60">
            Four studies in monochrome, photographed across empty rooms in Paris and Kyoto.
          </p>
        </div>

        {PANELS.map((p, i) => (
          <figure
            key={p.title}
            className="group shrink-0 md:w-[clamp(360px,42vw,620px)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <span className="label-xs absolute top-4 left-4 text-background/60">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <figcaption className="mt-5 flex items-baseline justify-between gap-6 border-t border-background/15 pt-4">
              <h3 className="text-base font-light tracking-tight">{p.title}</h3>
              <p className="max-w-xs text-right text-xs leading-relaxed text-background/55">
                {p.copy}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}