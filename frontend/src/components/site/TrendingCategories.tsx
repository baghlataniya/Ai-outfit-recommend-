import { motion } from "framer-motion";
import outerwear from "@/assets/cat-outerwear.jpg";
import knitwear from "@/assets/cat-knitwear.jpg";
import tailoring from "@/assets/cat-tailoring.jpg";
import accessories from "@/assets/cat-accessories.jpg";
import { RevealText } from "./RevealText";

const CATEGORIES = [
  { name: "Outerwear", count: "24 pieces", image: outerwear },
  { name: "Knitwear", count: "18 pieces", image: knitwear },
  { name: "Tailoring", count: "31 pieces", image: tailoring },
  { name: "Accessories", count: "12 pieces", image: accessories },
];

export function TrendingCategories() {
  return (
    <section id="categories" className="edge py-28 md:py-40">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-10">
        <RevealText as="h2" className="display-lg">
          Trending
        </RevealText>
        <p className="eyebrow">03 — Categories</p>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-5 md:gap-8 lg:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <motion.a
            key={c.name}
            href="#collection"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
            className="group block"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/25" />
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-sm font-medium tracking-tight">{c.name}</h3>
              <span className="text-xs text-muted-foreground">{c.count}</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}