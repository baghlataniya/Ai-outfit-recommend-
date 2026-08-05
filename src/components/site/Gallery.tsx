import { motion } from "framer-motion";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import { RevealText } from "./RevealText";

const SHOTS = [
  { src: g1, alt: "Leather glove and coat cuff detail" },
  { src: g2, alt: "Backlit silhouette in a long coat" },
  { src: g3, alt: "Folded white shirt on stone" },
  { src: g4, alt: "Black leather ankle boots on concrete" },
  { src: g5, alt: "Charcoal fabric draped over a chair" },
  { src: g6, alt: "Shoulder seam of a black tailored jacket" },
];

export function Gallery() {
  return (
    <section id="gallery" className="edge border-t border-border py-28 md:py-40">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <RevealText as="h2" className="display-lg">
          @maisonnoir
        </RevealText>
        <p className="eyebrow">07 — Journal</p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {SHOTS.map((s, i) => (
          <motion.a
            key={s.alt}
            href="#gallery"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-square overflow-hidden bg-muted"
          >
            <img
              src={s.src}
              alt={s.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:blur-[2px]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-700 group-hover:bg-ink/35 group-hover:opacity-100">
              <span className="label-xs text-background">View</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}