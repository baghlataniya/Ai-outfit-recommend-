import { useEffect, useMemo, useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MagneticButton } from "@/components/site/MagneticButton";
import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { ProductBadge } from "@/components/shop/ProductBadge";
import { Rating } from "@/components/shop/Rating";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { SizeSelector } from "@/components/shop/SizeSelector";
import { ColorSwatch } from "@/components/shop/ColorSwatch";
import { QuantityStepper } from "@/components/shop/QuantityStepper";
import { cn } from "@/lib/utils";
import { getProduct, products, type Product } from "@/lib/catalog";
import { useWishlistStore, useCartStore, useProductStore } from "@/hooks/useCommerce";
import editorial2 from "@/assets/editorial-2.jpg";
import editorial3 from "@/assets/editorial-3.jpg";

const MATERIAL_BY_CATEGORY: Record<string, string> = {
  Outerwear: "Virgin wool and bonded cotton",
  Knitwear: "Brushed cashmere and lambswool",
  Tailoring: "Tropical wool and half-canvas construction",
  Shoes: "Vegetable-tanned calf leather",
  Accessories: "Grained calf and cashmere",
  Shirting: "Compact cotton poplin",
  Dresses: "Silk crepe and satin",
  Denim: "Rigid selvedge denim",
};

const REVIEW_COPY = [
  {
    name: "A. Laurent",
    rating: 5,
    text: "Cut with a restraint that feels closer to atelier tailoring than retail fashion. The fit is exact.",
  },
  {
    name: "M. Eklund",
    rating: 4.8,
    text: "The materials read expensive in person. Nothing feels overstated, which is exactly the point.",
  },
  {
    name: "S. Nair",
    rating: 4.9,
    text: "A very polished detail page and the garment arrived looking exactly as described."
  },
];

type Recommendation = {
  label: string;
  match: number;
  product?: Product;
  name: string;
  category: string;
  price: string;
  image: string;
  hoverImage: string;
};

export const Route = createFileRoute("/product/$id")({
  component: ProductRoute,
});

function valueForCategory(category: string) {
  return MATERIAL_BY_CATEGORY[category] ?? "Premium mixed fibre composition";
}

/** Inline recommendation card wired to global stores */
function RecommendationCard({ item }: { item: Recommendation }) {
  const { isWished, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [quickAdd, setQuickAdd] = useState(false);

  const productObj = item.product;
  const wished = productObj ? isWished(productObj.id) : false;

  return (
    <motion.article
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 28 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
      data-cursor="hover"
    >
      <div className="relative aspect-3/4 overflow-hidden bg-muted transition-shadow duration-700 group-hover:shadow-[0_24px_60px_-40px_oklch(0.12_0_0/0.6)]">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] group-hover:-translate-y-2 group-hover:scale-105 group-hover:opacity-0"
        />
        <img
          src={item.hoverImage}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition-all duration-[1200ms] group-hover:scale-100 group-hover:opacity-100"
        />
        <div className="absolute top-4 left-4">
          <ProductBadge>{item.match}% Match</ProductBadge>
        </div>
        {productObj && (
          <WishlistButton
            active={wished}
            onToggle={() => toggleWishlist(productObj.id)}
            className="absolute top-4 right-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-700 group-hover:translate-y-0">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (productObj) {
                addToCart(productObj.id, 1, productObj.sizes[0], productObj.colors[0]);
                toast.success(`"${productObj.name}" added to bag.`);
              }
              setQuickAdd(true);
              setTimeout(() => setQuickAdd(false), 1300);
            }}
            className="label-xs w-full bg-foreground py-3 text-background"
          >
            {quickAdd ? "Added" : "Quick add"}
          </motion.button>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          {productObj ? (
            <Link to="/product/$id" params={{ id: productObj.id }}>
              <h3 className="text-sm font-medium tracking-tight hover:opacity-70 transition-opacity">{item.name}</h3>
            </Link>
          ) : (
            <h3 className="text-sm font-medium tracking-tight">{item.name}</h3>
          )}
          <p className="mt-1 text-xs tracking-wide text-muted-foreground">{item.label}</p>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">{item.price}</span>
      </div>
    </motion.article>
  );
}

function ReviewCard({ name, rating, text }: { name: string; rating: number; text: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-border pt-5"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">{name}</p>
        <Rating value={rating} />
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{text}</p>
    </motion.article>
  );
}

function ProductRoute() {
  const { id } = Route.useParams();
  const { getProductByIdOrSlug } = useProductStore();
  const product = getProductByIdOrSlug(id) || getProduct(id);

  if (!product) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-background"
      >
        <Nav solid />
        <section className="edge flex min-h-svh items-center justify-center py-28 text-center">
          <div className="max-w-md">
            <p className="eyebrow">404 — Product Not Found</p>
            <h1 className="display-md mt-4">This piece is no longer in the archive.</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The requested garment identifier "{id}" could not be located in the current collection.
            </p>
            <Link to="/shop" className="label-xs link-underline mt-8 inline-flex">
              Return to shop
            </Link>
          </div>
        </section>
      </motion.main>
    );
  }

  return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const { isWished, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { addToRecentlyViewed, recentlyViewed: storeRecentlyViewed } = useProductStore();

  const wished = product?.id ? isWished(product.id) : false;

  useEffect(() => {
    if (product?.id) {
      addToRecentlyViewed(product.id);
    }
  }, [product?.id]);

  const gallery = useMemo(() => {
    if (Array.isArray(product?.gallery) && product.gallery.length > 0) {
      return product.gallery.filter(Boolean);
    }
    const fallback = [product?.image, product?.hoverImage].filter(Boolean) as string[];
    return fallback.length > 0 ? fallback : [editorial2];
  }, [product?.gallery, product?.image, product?.hoverImage]);

  const sizeVariants = useMemo(() => {
    if (Array.isArray(product?.sizeVariants) && product.sizeVariants.length > 0) {
      return product.sizeVariants;
    }
    if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
      return product.sizes.map((value) => ({ value, stock: 5 }));
    }
    return [
      { value: "S", stock: 5 },
      { value: "M", stock: 5 },
      { value: "L", stock: 5 },
    ];
  }, [product?.sizeVariants, product?.sizes]);

  const colors = useMemo(() => {
    if (Array.isArray(product?.colors) && product.colors.length > 0) {
      return product.colors;
    }
    if (product?.color) return [product.color];
    return ["Black"];
  }, [product?.colors, product?.color]);

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(
    sizeVariants.find((sv) => sv.stock > 0)?.value ?? sizeVariants[0]?.value ?? "M"
  );
  const [color, setColor] = useState<string | null>(colors[0] ?? "Black");

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const recentlyViewed = useMemo(() => {
    return (storeRecentlyViewed ?? []).filter((p) => p && p.id && p.id !== product?.id);
  }, [storeRecentlyViewed, product?.id]);

  const touchStart = useRef<number | null>(null);

  const recommendations = useMemo<Recommendation[]>(() => {
    const safeProducts = products ?? [];
    const currentId = product?.id ?? "";
    const shoes = safeProducts.find((item) => item?.category === "Shoes" && item?.id !== currentId);
    const jacket = safeProducts.find((item) => item?.category === "Outerwear" && item?.id !== currentId) ?? safeProducts.find((item) => item?.category === "Tailoring" && item?.id !== currentId);
    const accessories = safeProducts.find((item) => item?.category === "Accessories" && item?.id !== currentId);
    const bags = safeProducts.find((item) => item?.name?.toLowerCase()?.includes("tote") || (item?.category === "Accessories" && item?.id !== currentId));

    return [
      shoes,
      jacket,
      {
        label: "Watch",
        match: 91,
        name: "Obsidian Steel Watch",
        category: "Accessory",
        price: "$520",
        image: editorial2,
        hoverImage: editorial3,
      },
      accessories,
      bags,
    ]
      .filter(Boolean)
      .map((item, index) => ({
        label: ["Shoes", "Jacket", "Watch", "Accessories", "Bags"][index] ?? "Curated",
        match: [98, 95, 91, 93, 94][index] ?? 90,
        product: item && typeof item === "object" && "id" in item ? (item as Product) : undefined,
        name: item && typeof item === "object" && "name" in item && item.name ? item.name : "Obsidian Steel Watch",
        category: item && typeof item === "object" && "category" in item && item.category ? item.category : "Accessory",
        price: item && typeof item === "object" && "price" in item && item.price ? item.price : "$520",
        image: item && typeof item === "object" && "image" in item && item.image ? item.image : editorial2,
        hoverImage: item && typeof item === "object" && "hoverImage" in item && item.hoverImage ? item.hoverImage : editorial3,
      }));
  }, [product?.id]);

  const related = useMemo(
    () => (products ?? []).filter((item) => item && item.id && item.id !== product?.id).slice(0, 8),
    [product?.id],
  );

  const shareProduct = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, text: product.description, url });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  const material = valueForCategory(product?.category ?? "");
  const safeActiveImage = Math.min(Math.max(0, activeImage), Math.max(0, gallery.length - 1));

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-background"
    >
      <SmoothScroll />
      <CustomCursor />
      <Nav solid />

      <section className="edge py-28 md:py-32">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-start">
          <div>
            <Breadcrumb
              items={[
                { label: "Home", to: "/" },
                { label: "Shop", to: "/shop" },
                { label: product?.category ?? "Category" },
                { label: product?.name ?? "Garment" },
              ]}
              className="mb-8"
            />

            <div className="grid gap-4 lg:grid-cols-[88px_minmax(0,1fr)]">
              <div className="order-2 hidden h-fit gap-3 lg:order-1 lg:flex lg:flex-col">
                {gallery.map((image, index) => (
                  <button
                    key={image + index}
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      "relative aspect-3/4 overflow-hidden border transition-all duration-500",
                      index === safeActiveImage ? "border-foreground" : "border-transparent opacity-60",
                    )}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              <div
                className="order-1 overflow-hidden bg-muted lg:order-2"
                onTouchStart={(e) => {
                  touchStart.current = e.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(e) => {
                  if (touchStart.current == null || gallery.length <= 1) return;
                  const endX = e.changedTouches[0]?.clientX ?? touchStart.current;
                  const delta = endX - touchStart.current;
                  if (Math.abs(delta) > 45) {
                    setActiveImage((current) =>
                      delta < 0
                        ? (current + 1) % gallery.length
                        : (current - 1 + gallery.length) % gallery.length,
                    );
                  }
                  touchStart.current = null;
                }}
              >
                <div className="relative aspect-4/5 overflow-hidden md:aspect-3/4">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={safeActiveImage}
                      src={gallery[safeActiveImage] ?? gallery[0]}
                      alt={product?.name ?? "Product"}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.035 }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AnimatePresence>
                </div>

                <div className="flex gap-3 overflow-x-auto border-t border-border p-4 lg:hidden">
                  {gallery.map((image, index) => (
                    <button
                      key={image + index}
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        "relative h-20 w-16 shrink-0 overflow-hidden border transition-colors duration-300",
                        index === safeActiveImage ? "border-foreground" : "border-transparent opacity-60",
                      )}
                    >
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div>
                <p className="eyebrow">{product?.category ?? "Category"}</p>
                <h1 className="display-md mt-3">{product?.name ?? "Garment"}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <span className="text-lg tabular-nums">{product?.price ?? "$0"}</span>
                  {product?.bestSeller && <ProductBadge tone="dark">Best selling</ProductBadge>}
                  <Rating value={product?.rating ?? 5} reviews={product?.reviews ?? 0} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{product?.inStock ? "In stock" : "Out of stock"}</span>
                  <span>Material: {material}</span>
                  <span>Brand: {product?.brand ?? "Maison Noir"}</span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{product?.description ?? ""}</p>

              <div>
                <p className="label-xs mb-3">Colour</p>
                <ColorSwatch
                  colors={colors}
                  selected={color}
                  onChange={setColor}
                  showLabels
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="label-xs">Size</p>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="label-xs link-underline text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Size Guide
                  </button>
                </div>
                <SizeSelector
                  sizes={sizeVariants}
                  selected={size}
                  onChange={setSize}
                />
                {size && (
                  <p className="mt-2 text-xs text-muted-foreground font-medium">
                    {(() => {
                      const variant = sizeVariants.find((sv) => sv.value === size);
                      const currentStock = variant?.stock ?? product?.stock ?? 0;
                      if (currentStock === 0) return <span className="text-red-500 font-semibold tracking-wider uppercase">SOLD OUT</span>;
                      if (currentStock <= 3) return <span className="text-amber-600 font-medium">Only {currentStock} left</span>;
                      return `In stock — Ships within 24 hours.`;
                    })()}
                  </p>
                )}
              </div>

              <div>
                <p className="label-xs mb-3">Quantity</p>
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={(() => {
                    const variant = sizeVariants.find((sv) => sv.value === size);
                    return variant?.stock ?? product?.stock ?? 99;
                  })()}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MagneticButton
                  className="justify-center bg-foreground text-background hover:bg-charcoal"
                  disabled={!product?.inStock}
                  onClick={() => {
                    if (product?.id) {
                      addToCart(
                        product.id,
                        quantity,
                        size ?? sizeVariants[0]?.value ?? "M",
                        color ?? colors[0] ?? "Black"
                      );
                      setAdded(true);
                      toast.success(`"${product?.name ?? "Item"}" added to bag.`);
                      setTimeout(() => setAdded(false), 1400);
                    }
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {added ? <motion.span key="added">Added</motion.span> : <motion.span key="add">{product?.inStock ? "Add to Cart" : "Sold out"}</motion.span>}
                  </AnimatePresence>
                </MagneticButton>
                <MagneticButton
                  variant="outline"
                  className="justify-center"
                  disabled={!product?.inStock}
                  onClick={() => {
                    if (product?.id) {
                      addToCart(
                        product.id,
                        quantity,
                        size ?? sizeVariants[0]?.value ?? "M",
                        color ?? colors[0] ?? "Black"
                      );
                      toast.success(`"${product?.name ?? "Item"}" added to bag.`);
                    }
                  }}
                >
                  Buy Now
                </MagneticButton>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleWishlist(product.id)}
                  className="label-xs flex items-center justify-center gap-2 border border-border py-4"
                >
                  <Heart className={cn("h-4 w-4", wished && "fill-foreground text-foreground")} strokeWidth={1.2} />
                  {wished ? "Saved" : "Wishlist"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={shareProduct}
                  className="label-xs flex items-center justify-center gap-2 border border-border py-4"
                >
                  <Share2 className="h-4 w-4" strokeWidth={1.2} />
                  Share
                </motion.button>
              </div>

              <Accordion type="single" collapsible className="border-t border-border">
                <AccordionItem value="details">
                  <AccordionTrigger>Product Details</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product.name} is cut with a restrained silhouette, finished with refined edges, and designed to sit quietly in a monochrome wardrobe.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="fabric">
                  <AccordionTrigger>Fabric & Care</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {material}. Dry clean only where applicable. Store flat, brush lightly, and avoid direct heat.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Complimentary express shipping on premium orders. Returns accepted within 14 days in original condition.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="size">
                  <AccordionTrigger>Size Guide</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Cut true to size unless noted. Select your usual size for a clean line; size up for a softer drape.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </aside>
        </div>
      </section>

      <section className="edge py-12 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Style It With AI</p>
            <h2 className="display-sm">Complementary pieces selected for balance.</h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Refine the look with shoes, outerwear, leather, and quiet accessories.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {recommendations.map((item) => (
            <RecommendationCard key={item.label} item={item} />
          ))}
        </div>
      </section>

      <section className="edge py-12 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Related Products</p>
            <h2 className="display-sm">An editorial horizontal rail for discovery.</h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Scroll to browse the archive without losing the pace of the page.
          </p>
        </div>

        <RelatedRail products={related} />
      </section>

      <section className="edge py-12 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Recently Viewed</p>
            <h2 className="display-sm">Return to the pieces you paused on.</h2>
          </div>
        </div>

        <RecentlyViewedSlider items={recentlyViewed} />
      </section>

      <section className="edge py-12 md:py-16">
        <div className="mb-8">
          <p className="eyebrow mb-3">Customer Reviews</p>
          <h2 className="display-sm">Quiet feedback, written like an editorial note.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {REVIEW_COPY.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </div>
      </section>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative z-10 w-full max-w-lg border border-border bg-background p-6 md:p-8 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="size-guide-title"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div>
                  <p className="eyebrow">Size & Proportion Guide</p>
                  <h3 id="size-guide-title" className="text-lg font-light tracking-tight mt-1">
                    {product.category} Measurements
                  </h3>
                </div>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="label-xs border border-border px-3 py-1.5 hover:border-foreground transition-colors"
                >
                  Close [Esc]
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase">
                      <th className="py-2.5">Size</th>
                      <th className="py-2.5">Chest / Waist</th>
                      <th className="py-2.5">Shoulder</th>
                      <th className="py-2.5">Sleeve Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr>
                      <td className="py-3 font-semibold text-foreground">XS</td>
                      <td>86 - 90 cm</td>
                      <td>43 cm</td>
                      <td>62 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-foreground">S</td>
                      <td>91 - 95 cm</td>
                      <td>44 cm</td>
                      <td>63 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-foreground">M</td>
                      <td>96 - 100 cm</td>
                      <td>46 cm</td>
                      <td>64 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-foreground">L</td>
                      <td>101 - 106 cm</td>
                      <td>48 cm</td>
                      <td>65 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-foreground">XL</td>
                      <td>107 - 112 cm</td>
                      <td>50 cm</td>
                      <td>66 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-xs text-muted-foreground font-light leading-relaxed">
                All measurements are taken flat. Fits true to size. For an oversized drop-shoulder aesthetic, we recommend ordering one size up.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

function RelatedRail({ products }: { products: Product[] }) {
  const list = Array.isArray(products) && products.length > 0 ? products : [];

  return (
    <div className="relative overflow-hidden">
      <div className="flex gap-5 overflow-x-auto pb-4 scroll-smooth no-scrollbar">
        {list.map((item) => (
          <Link
            key={item.id}
            to="/product/$id"
            params={{ id: item.id }}
            className="group block w-70 shrink-0 md:w-80"
          >
            <div className="aspect-3/4 overflow-hidden bg-muted">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-1200 ease-luxe group-hover:scale-105"
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium tracking-tight">{item.name}</h3>
                <p className="mt-1 text-xs tracking-wide text-muted-foreground">{item.category}</p>
              </div>
              <span className="text-sm tabular-nums">{item.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RecentlyViewedSlider({ items }: { items: Product[] }) {
  const fallback = products.slice(0, 4);
  const list = items.length ? items : fallback;

  return (
    <Carousel opts={{ align: "start", loop: false }} className="w-full">
      <CarouselContent>
        {list.map((item) => (
          <CarouselItem key={item.id} className="basis-[76%] sm:basis-1/2 lg:basis-1/3">
            <Link to="/product/$id" params={{ id: item.id }} className="group block">
              <div className="aspect-3/4 overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1200 ease-luxe group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium tracking-tight">{item.name}</h3>
                  <p className="mt-1 text-xs tracking-wide text-muted-foreground">{item.category}</p>
                </div>
                <span className="text-sm tabular-nums">{item.price}</span>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}