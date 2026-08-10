import { bestSellers } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { RevealText } from "./RevealText";
import { MagneticButton } from "./MagneticButton";

export function BestSellers() {
  return (
    <section id="best-sellers" className="edge border-t border-border py-28 md:py-40">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <RevealText as="h2" className="display-lg">
          Best Sellers
        </RevealText>
        <p className="eyebrow">04 — Archive favourites</p>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:gap-x-8 lg:grid-cols-4">
        {bestSellers.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      <div className="mt-20 flex justify-center">
        <MagneticButton variant="outline">View all pieces</MagneticButton>
      </div>
    </section>
  );
}