import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { EmptyState } from "@/components/commerce/CommerceBlocks";
import { WishlistCard } from "@/components/commerce/CommerceCards";
import { useWishlistStore, useCartStore } from "@/hooks/useCommerce";
import { ProtectedGuestGate } from "@/components/auth/ProtectedGuestGate";

const lazySectionStyle = { contentVisibility: "auto", containIntrinsicSize: "1px 900px" } as const;

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlistProducts, toggleWishlist } = useWishlistStore();
  const { addToCart, moveToCart } = useCartStore();

  const handleQuickAdd = (product: any) => {
    addToCart(product.id, 1, "M", "Black");
    toast.success(`"${product.name}" added to bag.`);
  };

  const handleMoveToCart = (product: any) => {
    moveToCart(product.id, "M", "Black");
    toast.success(`"${product.name}" moved to bag.`);
  };

  const handleRemove = (product: any) => {
    toggleWishlist(product.id);
    toast.success(`"${product.name}" removed from wishlist.`);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-background min-h-screen"
    >
      <SmoothScroll />
      <CustomCursor />
      <Nav solid />

      <ProtectedGuestGate
        title="Saved Archive Wishlist"
        subtitle="Sign in to view, organize, and transfer your saved pieces into your bag."
        redirectPath="/wishlist"
      >
        <section className="edge py-28 md:py-36" style={lazySectionStyle}>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-border">
              <div>
                <p className="eyebrow mb-2">Saved Archive</p>
                <h1 className="display-lg">Wishlist</h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-md">
                  A quiet edit of pieces to return to and move into your bag when the timing feels right.
                </p>
              </div>
              <p className="label-xs text-muted-foreground">
                {wishlistProducts.length} Saved Items
              </p>
            </div>

            <div className="mt-12">
              {wishlistProducts.length === 0 ? (
                <EmptyState
                  title="Your Wishlist Awaits."
                  description="Explore the Maison Noir catalog and tap the heart icon on any piece to save it to your personal wishlist."
                  actionLabel="Browse Catalog"
                  actionTo="/shop"
                />
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {wishlistProducts.map((p) => (
                    <WishlistCard
                      key={p.id}
                      product={p}
                      onQuickAdd={() => handleQuickAdd(p)}
                      onMoveToCart={() => handleMoveToCart(p)}
                      onRemove={() => handleRemove(p)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-3">
              <Link
                to="/shop"
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Continue Shopping <span aria-hidden>→</span>
              </Link>
              <Link
                to="/cart"
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Go to Bag <span aria-hidden>→</span>
              </Link>
              <Link
                to="/stylist"
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Refine Style <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </ProtectedGuestGate>
    </motion.main>
  );
}