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
  return (
    <section
      id="editorial"
      className="relative overflow-hidden bg-ink text-background py-24 md:py-32"
    >
      <div className="edge mb-12">
        <p className="eyebrow text-background/50">05 — Editorial</p>
        <h2 className="display-lg mt-3">The Archive</h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-background/60">
          Four studies in monochrome, photographed across empty rooms in Paris and Kyoto.
        </p>
      </div>

      <div className="edge">
        <div className="flex gap-8 overflow-x-auto pb-6 scroll-smooth no-scrollbar">
          {PANELS.map((p, i) => (
            <figure
              key={p.title}
              className="group shrink-0 w-[82vw] max-w-[500px] md:w-[460px]"
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
      </div>
    </section>
  );
}