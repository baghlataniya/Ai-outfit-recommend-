import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Heart, Plus, Share2 } from "lucide-react";

import { ProductBadge } from "@/components/shop/ProductBadge";
import { Rating } from "@/components/shop/Rating";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/catalog";
import { useWishlistStore, useCartStore } from "@/hooks/useCommerce";

export const OutfitCard = memo(function OutfitCard({
  title,
  occasion,
  weather,
  match,
  total,
  image,
  products,
  onViewDetails,
  onAddOutfit,
  onToggleSaved,
  onShare,
  saved = false,
}: {
  title: string;
  occasion: string;
  weather: string;
  match: number;
  total: string;
  image: string;
  products: Product[];
  onViewDetails?: () => void;
  onAddOutfit?: () => void;
  onToggleSaved?: () => void;
  onShare?: () => void;
  saved?: boolean;
}) {
  const [added, setAdded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group border border-border bg-background"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute top-4 left-4">
          <ProductBadge>{match}% Match</ProductBadge>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={onToggleSaved}
            aria-label={saved ? "Saved outfit" : "Save outfit"}
            className="flex h-9 w-9 items-center justify-center bg-background/90 transition-transform duration-200 ease-out hover:scale-[1.03]"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                saved && "fill-foreground text-foreground",
              )}
              strokeWidth={1.2}
            />
          </button>
          <button
            onClick={onShare}
            aria-label="Share outfit"
            className="flex h-9 w-9 items-center justify-center bg-background/90 transition-transform duration-200 ease-out hover:scale-[1.03]"
          >
            <Share2 className="h-4 w-4 text-foreground" strokeWidth={1.2} />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex gap-2 p-3">
          <button
            onClick={() => {
              onAddOutfit?.();
              setAdded(true);
              setTimeout(() => setAdded(false), 1000);
            }}
            className="label-xs flex flex-1 items-center justify-center gap-2 bg-foreground py-3 text-background transition-transform duration-200 ease-out hover:scale-[1.02]"
          >
            {added ? (
              <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            {added ? "Added" : "Add outfit"}
          </button>
          <button
            onClick={onViewDetails}
            className="label-xs bg-background/90 px-4 py-3 transition-transform duration-200 ease-out hover:scale-[1.02]"
          >
            View Outfit
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium tracking-tight">{title}</h3>
            <p className="mt-1 text-xs tracking-wide text-muted-foreground">{occasion}</p>
          </div>
          <span className="text-sm tabular-nums">{total}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{weather}</span>
          <span>•</span>
          <span>{products.length} pieces</span>
        </div>
      </div>
    </motion.article>
  );
});

export const RecommendationCard = memo(function RecommendationCard({
  product,
  label,
  match,
  onQuickView,
  onReplace,
}: {
  product: Product;
  label: string;
  match: number;
  onQuickView?: (product: Product) => void;
  onReplace?: (product: Product) => void;
}) {
  const { toggleWishlist, isWished } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [added, setAdded] = useState(false);
  const wished = isWished(product.id);

  return (
    <motion.article
      whileHover={{ y: -2, scale: 1.01 }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group border border-border bg-background"
    >
      <div className="relative aspect-3/4 overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.04]"
        />
        <img
          src={product.hoverImage}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
        />
        <div className="absolute top-4 left-4">
          <ProductBadge>{match}%</ProductBadge>
        </div>
        <WishlistButton
          active={wished}
          onToggle={() => toggleWishlist(product.id)}
          className="absolute top-4 right-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
        <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-200 ease-out group-hover:translate-y-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                addToCart(product.id, 1, "M", "Black");
                setAdded(true);
                setTimeout(() => setAdded(false), 1000);
              }}
              className="label-xs flex items-center justify-center gap-2 bg-foreground py-3 text-background transition-transform duration-200 ease-out hover:scale-[1.02] cursor-pointer"
            >
              {added ? (
                <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
              ) : (
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
              {added ? "Added" : "Quick add"}
            </button>
            <button
              onClick={() => onQuickView?.(product)}
              className="label-xs bg-background/90 py-3 transition-transform duration-200 ease-out hover:scale-[1.02] cursor-pointer"
            >
              Quick view
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="label-xs text-muted-foreground">{label}</p>
            <h3 className="mt-1 text-sm font-medium tracking-tight">{product.name}</h3>
          </div>
          <span className="text-sm tabular-nums">{product.price}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <Rating value={product.rating} reviews={product.reviews} />
          <button
            onClick={() => onReplace?.(product)}
            className="label-xs link-underline text-muted-foreground"
          >
            Replace item
          </button>
        </div>
      </div>
    </motion.article>
  );
});

export const AIInsightCard = memo(function AIInsightCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="border border-border bg-background p-5"
    >
      <p className="eyebrow mb-3">AI Insight</p>
      <h3 className="text-sm font-medium tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.article>
  );
});

export const WishlistCard = memo(function WishlistCard({
  product,
  onQuickAdd,
  onRemove,
  onMoveToCart,
}: {
  product: Product;
  onQuickAdd?: (product: Product) => void;
  onRemove?: (product: Product) => void;
  onMoveToCart?: (product: Product) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group border border-border bg-background"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute top-4 right-4">
          <button
            onClick={() => onRemove?.(product)}
            aria-label="Remove from wishlist"
            className="flex h-9 w-9 items-center justify-center bg-background/90 text-foreground transition-transform duration-200 ease-out hover:scale-[1.03]"
          >
            <Heart className="h-4 w-4 fill-foreground text-foreground" strokeWidth={1.2} />
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="label-xs text-muted-foreground">{product.category}</p>
            <h3 className="mt-1 text-sm font-medium tracking-tight">{product.name}</h3>
          </div>
          <span className="text-sm tabular-nums">{product.price}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => onQuickAdd?.(product)}
            className="label-xs border border-border py-3 text-center transition-transform duration-200 ease-out hover:scale-[1.02] cursor-pointer"
          >
            Quick Add
          </button>
          <button
            onClick={() => onMoveToCart?.(product)}
            className="label-xs bg-foreground text-background py-3 text-center transition-transform duration-200 ease-out hover:scale-[1.02] cursor-pointer"
          >
            Move to Cart
          </button>
        </div>
      </div>
    </motion.article>
  );
});

export const CartLineCard = memo(function CartLineCard({
  product,
  quantity,
  size,
  color,
  onIncrease,
  onDecrease,
  onRemove,
  onSaveForLater,
}: {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onRemove?: () => void;
  onSaveForLater?: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="grid gap-4 border border-border bg-background p-4 md:grid-cols-[140px_1fr]"
    >
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-col justify-between p-1">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-xs text-muted-foreground">{product.category}</p>
              <h3 className="mt-1 text-sm font-medium tracking-tight">{product.name}</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                {[size, color].filter(Boolean).join(" / ") || "One Size"}
              </p>
            </div>
            <span className="text-sm tabular-nums font-medium">{product.price}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-1 border border-border bg-background">
            <button
              onClick={onDecrease}
              className="px-3 py-2 text-xs font-light transition-colors hover:bg-muted cursor-pointer"
            >
              —
            </button>
            <div className="relative h-6 w-8 overflow-hidden text-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={quantity}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center text-xs font-medium tabular-nums"
                >
                  {quantity}
                </motion.span>
              </AnimatePresence>
            </div>
            <button
              onClick={onIncrease}
              className="px-3 py-2 text-xs font-light transition-colors hover:bg-muted cursor-pointer"
            >
              +
            </button>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onSaveForLater}
              className="label-xs link-underline text-muted-foreground cursor-pointer"
            >
              Save for later
            </button>
            <button
              onClick={onRemove}
              className="label-xs link-underline text-muted-foreground cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
});
