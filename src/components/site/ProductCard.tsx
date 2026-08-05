import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Plus, Check } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative aspect-[3/4] overflow-hidden bg-muted"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-0"
        />
        <img
          src={product.hoverImage}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
        />

        {product.tag && (
          <span className="label-xs absolute top-4 left-4 bg-background/85 px-3 py-1 backdrop-blur-sm">
            {product.tag}
          </span>
        )}

        <motion.button
          onClick={() => setWished((w) => !w)}
          whileTap={{ scale: 0.85 }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center bg-background/85 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Heart
            className={cn("h-4 w-4 transition-colors", wished && "fill-foreground text-foreground")}
            strokeWidth={1.2}
          />
        </motion.button>

        <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setAdded(true);
                setTimeout(() => setAdded(false), 1600);
              }}
              className="label-xs flex flex-1 items-center justify-center gap-2 bg-foreground py-3 text-background"
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
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add to bag
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="label-xs bg-background/90 px-4 py-3 backdrop-blur-sm"
            >
              Quick view
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium tracking-tight">{product.name}</h3>
          <p className="mt-1 text-xs tracking-wide text-muted-foreground">{product.category}</p>
        </div>
        <span className="text-sm tabular-nums">{product.price}</span>
      </div>
    </motion.article>
  );
}