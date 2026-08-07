import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/catalog";
import { ShopProductCard } from "./ShopProductCard";

export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] w-full bg-muted" />
      <div className="mt-4 h-3 w-2/3 bg-muted" />
      <div className="mt-2 h-3 w-1/3 bg-muted" />
    </div>
  );
}

export function ProductGrid({
  products,
  loading,
  onQuickView,
}: {
  products: Product[];
  loading?: boolean;
  onQuickView?: (p: Product) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-x-5 gap-y-12 md:grid-cols-2 md:gap-x-8 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="border border-border py-28 text-center">
        <p className="display-md font-extralight">Nothing matches</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Loosen a filter to see more of the archive.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-x-5 gap-y-12 md:grid-cols-2 md:gap-x-8 xl:grid-cols-4"
    >
      <AnimatePresence mode="popLayout">
        {products.map((p, i) => (
          <ShopProductCard key={p.id} product={p} index={i} onQuickView={onQuickView} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
