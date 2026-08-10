import { featured } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { RevealText } from "./RevealText";

export function FeaturedCollection() {
  return (
    <section id="collection" className="edge py-28 md:py-40">
      <div className="flex flex-wrap items-end justify-between gap-8 border-b border-border pb-10">
        <RevealText as="h2" className="display-lg max-w-2xl">
          Featured
          <br />
          Collection
        </RevealText>
        <div className="max-w-xs">
          <p className="eyebrow mb-4">01 — Selected</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Four pieces that define the season: weight, drape, and an unbroken monochrome line.
          </p>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-14 md:gap-x-8 lg:grid-cols-4">
        {featured.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}