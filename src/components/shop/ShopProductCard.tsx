import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/catalog";
import { useWishlistStore, useCartStore } from "@/hooks/useCommerce";
import { WishlistButton } from "./WishlistButton";
import { ProductBadge } from "./ProductBadge";
import { Rating } from "./Rating";

type Props = {
  product: Product;
  index?: number;
  onQuickView?: (p: Product) => void;
};

export function ShopProductCard({ product, index = 0, onQuickView }: Props) {
  const { isWished, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [added, setAdded] = useState(false);

  const wished = isWished(product.id);

  const handleAddToBag = () => {
    if (!product.inStock) return;
    addToCart(product.id, 1, product.sizes[0], product.colors[0]);
    setAdded(true);
    toast.success(`"${product.name}" added to bag.`);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.85, delay: (index % 8) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
      data-cursor="hover"
    >
      <Link to="/product/$id" params={{ id: product.id }}>
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="relative aspect-[3/4] overflow-hidden bg-muted transition-shadow duration-700 group-hover:shadow-[0_24px_60px_-40px_oklch(0.12_0_0/0.6)]"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2 group-hover:scale-105 group-hover:opacity-0"
          />
          <img
            src={product.hoverImage}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
          />

          <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
            {product.isNew && <ProductBadge>New</ProductBadge>}
            {product.tag === "Limited" && <ProductBadge tone="dark">Limited</ProductBadge>}
            {!product.inStock && <ProductBadge tone="dark">Sold out</ProductBadge>}
          </div>

          <WishlistButton
            active={wished}
            onToggle={() => toggleWishlist(product.id)}
            className="absolute top-4 right-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 focus-visible:opacity-100"
          />

          <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!product.inStock}
                onClick={(e) => { e.preventDefault(); handleAddToBag(); }}
                className="label-xs flex flex-1 items-center justify-center gap-2 bg-foreground py-3 text-background disabled:opacity-40"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={1.5} /> Added
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {product.inStock ? "Add to bag" : "Sold out"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
                className="label-xs bg-background/90 px-4 py-3 backdrop-blur-sm"
              >
                Quick view
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Link>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <Link to="/product/$id" params={{ id: product.id }}>
            <h3 className="truncate text-sm font-medium tracking-tight hover:opacity-70 transition-opacity">{product.name}</h3>
          </Link>
          <p className="mt-1 text-xs tracking-wide text-muted-foreground">{product.category}</p>
        </div>
        <span className="shrink-0 text-sm tabular-nums transition-opacity duration-500 group-hover:opacity-60">
          {product.price}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <Rating value={product.rating} reviews={product.reviews} />
        <span className="label-xs text-muted-foreground">{product.aiMatch}% AI match</span>
      </div>
    </motion.article>
  );
}
