import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trash2, RefreshCcw, Sparkles } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { SizeSelector } from "@/components/shop/SizeSelector";
import { ColorSwatch } from "@/components/shop/ColorSwatch";
import { QuantityStepper } from "@/components/shop/QuantityStepper";
import { products, type Product } from "@/lib/catalog";
import { useProductStore, useWishlistStore, useCartStore } from "@/hooks/useCommerce";
import { ProtectedGuestGate } from "@/components/auth/ProtectedGuestGate";

const lazySectionStyle = { contentVisibility: "auto", containIntrinsicSize: "1px 900px" } as const;

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { recentlyViewed } = useProductStore();
  const { toggleWishlist, isWished } = useWishlistStore();
  const {
    cart: globalCart,
    removeFromCart,
    updateQuantity,
    updateCartItem,
    saveForLater,
    addToCart,
    moveToCart,
    savedLater,
    removeSavedLater,
  } = useCartStore();

  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Summary enhancements
  const [expressDelivery, setExpressDelivery] = useState(false);
  const [luxuryPackaging, setLuxuryPackaging] = useState(false);
  const [giftWrapping, setGiftWrapping] = useState(false);

  // AI complete look items index
  const [aiLookIndexes, setAiLookIndexes] = useState({
    Shoes: 0,
    Watch: 0,
    Bag: 0,
    Accessories: 0,
    Jacket: 0,
  });

  const cartProducts = useMemo(() => {
    return globalCart.map((item) => {
      const product = products.find((p) => p.id === item.productId) ?? products[0];
      return { item, product };
    });
  }, [globalCart]);

  const subtotal = cartProducts.reduce((sum, entry) => sum + entry.product.priceValue * entry.item.quantity, 0);
  const deliveryCost = expressDelivery ? 25 : 0;
  const packagingCost = luxuryPackaging ? 15 : 0;
  const giftCost = giftWrapping ? 10 : 0;
  const estimatedTax = Math.round(subtotal * 0.08); // 8% Tax
  const rewardPoints = Math.round(subtotal * 0.1); // 10% points

  const total = Math.max(0, subtotal - discount + deliveryCost + packagingCost + giftCost + estimatedTax);

  const applyPromoCode = () => {
    const trimmed = promo.trim().toUpperCase();
    if (trimmed === "MAISON10") {
      setDiscount(Math.round(subtotal * 0.1));
      setPromoApplied(true);
      toast.success("Promo code applied: 10% off your wardrobe.");
    } else {
      setDiscount(0);
      setPromoApplied(false);
      toast.error("Invalid promo code.");
    }
  };

  const handleRemoveItem = (item: any, name: string) => {
    removeFromCart(item.productId, item.size, item.color);
    toast.success(`Removed "${name}" from bag.`);
  };

  const handleSaveForLater = (item: any, name: string) => {
    saveForLater(item.productId, item.size, item.color);
    toast.success(`Saved "${name}" for later.`);
  };

  const handleMoveToBag = (product: Product) => {
    moveToCart(product.id, "M", "Black");
    toast.success(`"${product.name}" moved back to bag.`);
  };

  const handleRemoveSaved = (product: Product) => {
    removeSavedLater(product.id);
    toast.success(`"${product.name}" removed.`);
  };

  // AI complete look selection
  const completeLookItems = useMemo(() => {
    const category = (name: string) => products.filter(p => p.category === name || p.name.toLowerCase().includes(name.toLowerCase()));
    
    const shoes = category("Shoes");
    const accessories = category("Accessories");
    const outerwear = category("Outerwear");

    const slots = [
      { slot: "Shoes" as const, list: shoes, match: 98 },
      { slot: "Watch" as const, list: accessories.filter(p => p.name.toLowerCase().includes("watch")).concat(accessories), match: 96 },
      { slot: "Bag" as const, list: accessories.filter(p => p.name.toLowerCase().includes("bag")).concat(accessories), match: 97 },
      { slot: "Accessories" as const, list: accessories.filter(p => !p.name.toLowerCase().includes("bag") && !p.name.toLowerCase().includes("watch")), match: 95 },
      { slot: "Jacket" as const, list: outerwear.concat(products), match: 99 },
    ];

    return slots.map(s => {
      const idx = aiLookIndexes[s.slot] ?? 0;
      const product = s.list[idx % Math.max(s.list.length, 1)] ?? products[0];
      return { slot: s.slot, product, match: s.match, listLength: s.list.length };
    });
  }, [aiLookIndexes]);

  const cycleLookItem = (slot: "Shoes" | "Watch" | "Bag" | "Accessories" | "Jacket", length: number) => {
    setAiLookIndexes(current => ({
      ...current,
      [slot]: (current[slot] + 1) % length,
    }));
    toast.success(`Alternative ${slot.toLowerCase()} generated.`);
  };

  // You May Also Like suggestions
  const youMayAlsoLike = useMemo(() => {
    return products.slice(2, 6);
  }, []);

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
        title="Shopping Bag"
        subtitle="Sign in to view, configure options, and proceed to private checkout for your selected garments."
        redirectPath="/cart"
      >

      <section className="edge py-28 md:py-32">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow mb-8">Shopping Bag</p>
            <h1 className="display-lg">Refined Edit</h1>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Review your selected garments, adjust silhouettes, and complete the styling structure.
            </p>
          </div>
          <div className="border border-border p-6 bg-muted/20">
            <p className="eyebrow mb-4">Maison Dispatch</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Complimentary standard delivery. Crafted packaging included with every signature coat.
            </p>
          </div>
        </div>
      </section>

      {/* Cart Grid */}
      <section className="edge py-10 md:py-14" style={lazySectionStyle}>
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          
          {/* Left Column: Cart List */}
          <div className="space-y-6">
            {cartProducts.length === 0 ? (
              <div className="border border-border bg-background px-6 py-20 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-border bg-muted/50">
                  <svg className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="display-sm tracking-tight">Your Wardrobe is Empty</h2>
                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Your curated archive contains no selected pieces. Begin by composing your stylist brief or exploring the collection.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <Link to="/shop" className="label-xs border border-border px-6 py-4 transition-transform duration-200 hover:scale-[1.02]">
                    Explore Shop
                  </Link>
                  <Link to="/stylist" className="label-xs bg-foreground text-background px-6 py-4 transition-transform duration-200 hover:scale-[1.02]">
                    AI Stylist
                  </Link>
                </div>

              </div>
            ) : (
              <div className="space-y-4">
                <p className="eyebrow">Curated Pieces ({cartProducts.length})</p>
                <div className="relative overflow-hidden divide-y divide-border border border-border bg-background">
                  <AnimatePresence initial={false}>
                    {cartProducts.map(({ item, product }) => (
                      <motion.div
                        key={item.lineId}
                        initial={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="p-5 flex flex-col md:flex-row gap-5"
                      >
                        <div className="w-full md:w-32 aspect-[4/5] overflow-hidden bg-muted group shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-104"
                          />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="label-xs text-muted-foreground">{product.category}</p>
                                <h3 className="text-sm font-medium tracking-tight mt-1">{product.name}</h3>
                              </div>
                              <span className="text-sm font-medium tabular-nums shrink-0">{product.price}</span>
                            </div>

                            {/* Inline variant editors */}
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="label-xs text-muted-foreground w-10 shrink-0">Colour</span>
                                <ColorSwatch
                                  colors={product.colors}
                                  selected={item.color ?? product.colors[0]}
                                  onChange={(c) => updateCartItem(item.lineId, { color: c })}
                                  compact
                                />
                                {item.color && (
                                  <span className="text-xs text-muted-foreground">{item.color}</span>
                                )}
                              </div>
                              <div className="flex items-start gap-3 flex-wrap">
                                <span className="label-xs text-muted-foreground w-10 shrink-0 pt-1">Size</span>
                                <SizeSelector
                                  sizes={product.sizeVariants}
                                  selected={item.size ?? null}
                                  onChange={(s) => updateCartItem(item.lineId, { size: s })}
                                  compact
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 border-t border-border pt-4">
                            {/* Quantity Stepper */}
                            <QuantityStepper
                              value={item.quantity}
                              onChange={(q) => updateCartItem(item.lineId, { quantity: q })}
                              min={1}
                              compact
                            />

                            {/* Actions */}
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleSaveForLater(item, product.name)}
                                className="label-xs link-underline text-muted-foreground cursor-pointer bg-transparent border-none text-current"
                              >
                                Save for Later
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item, product.name)}
                                className="label-xs link-underline text-muted-foreground cursor-pointer flex items-center gap-1.5 bg-transparent border-none text-current"
                              >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.2} />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Save for later section */}
            {savedLater.length > 0 && (
              <div className="pt-10">
                <p className="eyebrow mb-6">Saved for Later ({savedLater.length})</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  {savedLater.map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -2, scale: 1.02 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="group border border-border bg-background p-4 flex gap-4"
                    >
                      <div className="w-20 aspect-[3/4] overflow-hidden bg-muted shrink-0">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-104" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="label-xs text-muted-foreground">{product.category}</p>
                          <h4 className="text-xs font-semibold tracking-tight mt-1">{product.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{product.price}</p>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleMoveToBag(product)}
                            className="label-xs border border-border px-3 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                          >
                            Move to Bag
                          </button>
                          <button
                            onClick={() => handleRemoveSaved(product)}
                            className="label-xs text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none text-current"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Complete the Look */}
            {cartProducts.length > 0 && (
              <div className="pt-10 border-t border-border mt-10">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="eyebrow mb-1">AI Complete the Look</p>
                    <h3 className="text-sm text-muted-foreground">Complementary pieces selected by the AI coordinator.</h3>
                  </div>
                  <Sparkles className="h-5 w-5 text-muted-foreground animate-pulse" strokeWidth={1.2} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {completeLookItems.map(({ slot, product, match, listLength }) => (
                    <motion.div
                      key={slot}
                      whileHover={{ y: -2, scale: 1.02 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="group border border-border bg-background p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-104" />
                          <div className="absolute top-2 left-2 bg-background/90 px-1.5 py-0.5 text-[8px] font-semibold tracking-wider border border-border uppercase">
                            {match}% Match
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-[10px] tracking-wider text-muted-foreground uppercase font-light">{slot}</p>
                          <h4 className="text-[11px] font-semibold truncate mt-0.5" title={product.name}>{product.name}</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{product.price}</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 pt-2 border-t border-border/50">
                        <button
                          onClick={() => {
                            addToCart(product.id, 1, "M", "Black");
                            toast.success(`"${product.name}" added to bag.`);
                          }}
                          className="label-xs w-full bg-foreground text-background py-2 text-center hover:scale-102 transition-transform cursor-pointer"
                        >
                          Quick Add
                        </button>
                        {listLength > 1 && (
                          <button
                            onClick={() => cycleLookItem(slot, listLength)}
                            className="text-[9px] w-full text-center text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center gap-1 bg-transparent border-none text-current"
                          >
                            <RefreshCcw className="h-2.5 w-2.5" />
                            Replace Item
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Enhanced Sticky Order Summary */}
          <div className="lg:sticky lg:top-28">
            <aside className="border border-border bg-background p-6 space-y-6">
              <p className="eyebrow">Order Summary</p>
              
              <div className="space-y-4 text-sm border-b border-border pb-5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {/* Shipping Selection */}
                <div className="space-y-2 pt-2">
                  <span className="label-xs text-muted-foreground">Delivery Method</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setExpressDelivery(false)}
                      className={`text-xs border py-2.5 text-center cursor-pointer transition-colors ${
                        !expressDelivery ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      Standard (Free)
                    </button>
                    <button
                      onClick={() => setExpressDelivery(true)}
                      className={`text-xs border py-2.5 text-center cursor-pointer transition-colors ${
                        expressDelivery ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      Express (+₹2,000)
                    </button>
                  </div>
                </div>

                {/* Packaging Selection */}
                <div className="space-y-2 pt-2">
                  <span className="label-xs text-muted-foreground">Packaging Experience</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setLuxuryPackaging(false)}
                      className={`text-[10px] border py-2.5 text-center cursor-pointer transition-colors ${
                        !luxuryPackaging ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      Recycled Cardboard
                    </button>
                    <button
                      onClick={() => setLuxuryPackaging(true)}
                      className={`text-[10px] border py-2.5 text-center cursor-pointer transition-colors ${
                        luxuryPackaging ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      Matte Gift Box (+₹1,250)
                    </button>
                  </div>
                </div>

                {/* Gift Option */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={giftWrapping}
                      onChange={(e) => setGiftWrapping(e.target.checked)}
                      className="accent-foreground h-3.5 w-3.5 border-border rounded-none"
                    />
                    <span>Ribbon & handwritten note (+₹800)</span>
                  </label>
                </div>
              </div>

              {/* Advanced Calculation rows */}
              <div className="space-y-3 text-sm border-b border-border pb-5">
                {expressDelivery && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Express Delivery</span>
                    <span className="tabular-nums">₹2,000</span>
                  </div>
                )}
                {luxuryPackaging && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Matte Gift Box</span>
                    <span className="tabular-nums">₹1,250</span>
                  </div>
                )}
                {giftWrapping && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Gift Ribbon & Card</span>
                    <span className="tabular-nums">₹800</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Estimated GST (8%)</span>
                  <span className="tabular-nums">₹{estimatedTax.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Promo Discount (10%)</span>
                    <span className="tabular-nums text-foreground">-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-muted-foreground pt-1 text-[11px] tracking-wider uppercase font-light">
                  <span>Maison Points Earned</span>
                  <span className="text-foreground">{rewardPoints} pts</span>
                </div>
              </div>

              {/* Total Row with Animated Number Change */}
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <div className="overflow-hidden h-7 relative">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={total}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="block tabular-nums"
                    >
                      ₹{total.toLocaleString("en-IN")}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Promo input */}
              <div className="pt-2">
                <label className="label-xs mb-2 block text-muted-foreground">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Enter MAISON10"
                    disabled={promoApplied}
                    className="h-10 flex-1 border border-border bg-transparent px-3 text-xs outline-none focus:border-foreground transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={promoApplied}
                    className="label-xs border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-all cursor-pointer disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <span className="h-1 w-1 bg-foreground rounded-full inline-block" />
                    Code MAISON10 applied successfully.
                  </p>
                )}
              </div>
            </aside>

            {/* Check out button */}
            <div className="mt-4 grid gap-3">
              <Link
                to="/checkout"
                className="label-xs flex items-center justify-center border border-border bg-foreground py-4 text-background transition-transform duration-200 hover:scale-[1.02] cursor-pointer text-center font-medium tracking-wider"
              >
                Proceed to Checkout
              </Link>
              <Link to="/shop" className="label-xs link-underline text-muted-foreground text-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* You May Also Like Slider */}
      <section className="edge py-14 border-t border-border mt-10" style={lazySectionStyle}>
        <div className="mb-8">
          <p className="eyebrow mb-2">Curated Suggestions</p>
          <h2 className="display-sm">You May Also Like</h2>
        </div>
        
        {/* Horizontal Editorial Carousel */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {youMayAlsoLike.map((product) => {
            const wished = isWished(product.id);
            return (
              <motion.article
                key={product.id}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="group border border-border bg-background flex flex-col justify-between"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-104"
                  />
                  <img
                    src={product.hoverImage}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <WishlistButton
                    active={wished}
                    onToggle={() => {
                      toggleWishlist(product.id);
                      toast.success(wished ? `Removed "${product.name}" from wishlist.` : `Saved "${product.name}" to wishlist.`);
                    }}
                    className="absolute top-4 right-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <p className="label-xs text-muted-foreground">{product.category}</p>
                      <h3 className="mt-1 text-sm font-medium tracking-tight truncate max-w-40">{product.name}</h3>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{product.price}</span>
                  </div>
                  <div className="mt-4 pt-2 border-t border-border/50 flex gap-2">
                    <button
                      onClick={() => {
                        addToCart(product.id, 1, "M", "Black");
                        toast.success(`"${product.name}" added to bag.`);
                      }}
                      className="label-xs flex-1 bg-foreground text-background py-2.5 text-center hover:scale-102 transition-transform cursor-pointer"
                    >
                      Quick Add
                    </button>
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="label-xs border border-border px-3 py-2.5 hover:bg-muted transition-colors cursor-pointer"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* Recently Viewed Slider */}
      {recentlyViewed.length > 0 && (
        <section className="edge py-14 border-t border-border" style={lazySectionStyle}>
          <div className="mb-8">
            <p className="eyebrow mb-2">History</p>
            <h2 className="display-sm">Recently Viewed</h2>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="group border border-border bg-background p-3 flex flex-col justify-between"
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-104" />
                </div>
                <div className="mt-4">
                  <p className="label-xs text-muted-foreground">{product.category}</p>
                  <h4 className="text-xs font-semibold truncate tracking-tight mt-1">{product.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{product.price}</p>
                </div>
                <button
                  onClick={() => {
                    addToCart(product.id, 1, "M", "Black");
                    toast.success(`"${product.name}" added to bag.`);
                  }}
                  className="label-xs w-full border border-border py-2 mt-4 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                >
                  Add to Bag
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
      </ProtectedGuestGate>
    </motion.main>
  );
}