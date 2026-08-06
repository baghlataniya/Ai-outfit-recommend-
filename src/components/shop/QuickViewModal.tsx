import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, Plus } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { WishlistButton } from "./WishlistButton";
import { Rating } from "./Rating";
import { cn } from "@/lib/utils";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    setActiveImage(0);
    setColor(product.colors[0] ?? null);
    setSize(null);
    setAdded(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[970] flex items-end justify-center md:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/60 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={{ opacity: 0, y: 60, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative m-0 max-h-[92svh] w-full max-w-5xl overflow-y-auto bg-background md:m-6"
          >
            <button
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center bg-background/85 backdrop-blur-sm"
            >
              <X className="h-4 w-4" strokeWidth={1.2} />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="bg-muted p-4 md:p-6">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      src={product.gallery[activeImage]}
                      alt={product.name}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AnimatePresence>
                </div>
                <div className="mt-3 flex gap-3">
                  {product.gallery.map((g, i) => (
                    <button
                      key={g + i}
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1}`}
                      className={cn(
                        "relative h-16 w-12 overflow-hidden border transition-colors duration-300",
                        i === activeImage ? "border-foreground" : "border-transparent opacity-60",
                      )}
                    >
                      <img src={g} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6 p-6 md:p-10">
                <div>
                  <p className="eyebrow">{product.category}</p>
                  <h2 className="display-md mt-3">{product.name}</h2>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <span className="text-lg tabular-nums">{product.price}</span>
                    <Rating value={product.rating} reviews={product.reviews} />
                    <span className="label-xs text-muted-foreground">
                      {product.aiMatch}% AI match
                    </span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

                <div>
                  <p className="label-xs mb-3">Colour</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <motion.button
                        key={c}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setColor(c)}
                        className={cn(
                          "label-xs border px-4 py-2 transition-colors duration-400",
                          c === color ? "border-foreground bg-foreground text-background" : "border-border",
                        )}
                      >
                        {c}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="label-xs mb-3">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <motion.button
                        key={s}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSize(s)}
                        className={cn(
                          "label-xs min-w-12 border px-3 py-2 transition-colors duration-400",
                          s === size ? "border-foreground bg-foreground text-background" : "border-border",
                        )}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={!product.inStock}
                    onClick={() => {
                      setAdded(true);
                      setTimeout(() => setAdded(false), 1800);
                    }}
                    className="label-xs flex flex-1 items-center justify-center gap-2 bg-foreground px-8 py-4 text-background disabled:opacity-40"
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
                          <Check className="h-3.5 w-3.5" strokeWidth={1.5} /> Added to bag
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
                  <WishlistButton
                    active={wished}
                    onToggle={() => setWished((w) => !w)}
                    className="h-12 w-12 border border-border bg-transparent"
                  />
                </div>

                <button
                  onClick={onClose}
                  className="label-xs link-underline self-start text-muted-foreground"
                >
                  View full product
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
