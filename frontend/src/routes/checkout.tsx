import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { EmptyState, OrderSummary, ProgressIndicator } from "@/components/commerce/CommerceBlocks";
import { CartLineCard } from "@/components/commerce/CommerceCards";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveOrder, createOrderNumber } from "@/lib/commerce";
import { useCommerce } from "@/hooks/useCommerce";
import { products } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ProtectedGuestGate } from "@/components/auth/ProtectedGuestGate";

const lazySectionStyle = { contentVisibility: "auto", containIntrinsicSize: "1px 900px" } as const;

const STEPS = ["Shipping Address", "Delivery Options", "Payment", "Order Review"];

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

export function FloatingLabelInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  ...props
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  [key: string]: any;
}) {
  const [focused, setFocused] = useState(false);
  const isFilled = value.length > 0;

  return (
    <div className="relative border border-border bg-background transition-colors focus-within:border-foreground w-full h-14">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        className="h-full w-full bg-transparent px-4 pt-5 pb-1 text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
        {...props}
      />
      <label
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 tracking-wider pointer-events-none transition-all duration-200 uppercase font-light",
          (focused || isFilled) && "top-3 text-[9px] -translate-y-0 text-foreground/40"
        )}
      >
        {label}
      </label>
    </div>
  );
}

export function FloatingLabelTextarea({
  label,
  value,
  onChange,
  placeholder = "",
  ...props
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  [key: string]: any;
}) {
  const [focused, setFocused] = useState(false);
  const isFilled = value.length > 0;

  return (
    <div className="relative border border-border bg-background transition-colors focus-within:border-foreground w-full min-h-24">
      <textarea
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        className="w-full min-h-24 bg-transparent px-4 pt-6 pb-2 text-sm outline-none text-foreground resize-none"
        {...props}
      />
      <label
        className={cn(
          "absolute left-4 top-4 text-xs text-muted-foreground/60 tracking-wider pointer-events-none transition-all duration-200 uppercase font-light",
          (focused || isFilled) && "top-2 text-[9px] text-foreground/40"
        )}
      >
        {label}
      </label>
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart: globalCart, clearCart } = useCommerce();
  const [step, setStep] = useState(0);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("express");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "India",
    note: "",
  });
  
  const [card, setCard] = useState({
    number: "",
    holder: "",
    expiry: "",
    cvv: "",
  });

  const cart = useMemo(() => {
    return globalCart.map((item) => {
      const product = products.find((p) => p.id === item.productId) ?? products[0];
      return { item, product };
    });
  }, [globalCart]);
  const subtotal = cart.reduce((sum, entry) => sum + entry.product.priceValue * entry.item.quantity, 0);
  const shipping = shippingMethod === "express" ? 0 : subtotal > 0 ? 0 : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const applyPromo = () => {
    const trimmed = promo.trim().toUpperCase();
    if (trimmed === "MAISON10") {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success("Promo code applied: 10% discount.");
    } else {
      setDiscount(0);
      toast.error("Invalid promo code.");
    }
  };

  const handleContinue = () => {
    if (step === 0) {
      if (
        !form.fullName.trim() ||
        !form.email.trim() ||
        !form.phone.trim() ||
        !form.address.trim() ||
        !form.city.trim()
      ) {
        toast.error("Please complete all shipping address fields to proceed.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        toast.error("Please enter a valid email address.");
        return;
      }
    }
    
    if (step === 2 && paymentMethod === "card") {
      if (!card.number.trim() || !card.holder.trim() || !card.expiry.trim() || !card.cvv.trim()) {
        toast.error("Please fill in all credit card details.");
        return;
      }
    }

    setStep((current) => Math.min(3, current + 1));
  };

  const placeOrder = () => {
    const orderNumber = createOrderNumber();
    const order = {
      orderNumber,
      eta: shippingMethod === "express" ? "2-3 business days" : "3-5 business days",
      subtotal,
      discount,
      shipping,
      total,
    };
    
    // Save to order history in localStorage
    if (typeof window !== "undefined") {
      try {
        const history = JSON.parse(window.localStorage.getItem("maison-noir-order-history") ?? "[]");
        const newOrder = {
          ...order,
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          status: "Preparing",
          itemsCount: cart.reduce((acc, entry) => acc + entry.item.quantity, 0),
        };
        window.localStorage.setItem("maison-noir-order-history", JSON.stringify([newOrder, ...history]));
      } catch (e) {
        // ignore
      }
    }

    saveOrder(order);
    clearCart();
    toast.success("Order processed successfully.");
    navigate({ to: "/success" });
  };

  if (cart.length === 0) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="bg-background"
      >
        <SmoothScroll />
        <CustomCursor />
        <Nav solid />
        <section className="edge min-h-svh py-28 md:py-32">
          <EmptyState
            title="Cart Empty"
            description="Add pieces from the archive or the stylist results to continue to checkout."
            cta={
              <Link to="/shop" className="label-xs link-underline">
                Continue shopping
              </Link>
            }
          />
        </section>
      </motion.main>
    );
  }

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
        title="Private Checkout"
        subtitle="Sign in or create an account to complete your luxury acquisition and receive order tracking updates."
        redirectPath="/checkout"
      >

      <section className="edge py-28 md:py-32">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow mb-8">Checkout</p>
            <h1 className="display-lg">Luxury Minimal Checkout</h1>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              A focused four-step checkout with premium fields, elegant transitions, and an always-visible order summary.
            </p>
          </div>
          <div className="border border-border p-6">
            <p className="eyebrow mb-4">Cart</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {cart.length} items ready for review.
            </p>
          </div>
        </div>
      </section>

      <section className="edge py-10 md:py-14" style={lazySectionStyle}>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-8">
            <ProgressIndicator steps={STEPS} current={step} />

            <div className="border border-border bg-background p-6">
              {step === 0 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <FloatingLabelInput
                    label="Full name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="E.g. Alexander McQueen"
                  />
                  <FloatingLabelInput
                    label="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                  <FloatingLabelInput
                    label="Phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                  />
                  <div className="relative border border-border bg-background transition-colors focus-within:border-foreground w-full h-14">
                    <Select
                      value={form.country}
                      onValueChange={(value) => setForm({ ...form, country: value })}
                    >
                      <SelectTrigger className="h-full w-full border-none px-4 pt-5 pb-1 text-sm outline-none text-left bg-transparent shadow-none">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Singapore">Singapore</SelectItem>
                        <SelectItem value="UAE">UAE</SelectItem>
                      </SelectContent>
                    </Select>
                    <label className="absolute left-4 top-2 text-[9px] text-muted-foreground/45 tracking-wider pointer-events-none uppercase font-light">
                      Country
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <FloatingLabelTextarea
                      label="Shipping address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Street name, building, apartment number"
                    />
                  </div>
                  <FloatingLabelInput
                    label="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai / Delhi"
                  />
                  <FloatingLabelInput
                    label="Order note"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Optional note for delivery"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <p className="eyebrow mb-2">Delivery options</p>
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="grid gap-3">
                    {[
                      { value: "express", label: "Express Delivery (Complimentary)", description: "2-3 business days" },
                      { value: "standard", label: "Standard Delivery", description: "3-5 business days" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-start gap-3 border border-border p-4 cursor-pointer hover:border-foreground transition-colors">
                        <RadioGroupItem value={option.value} className="mt-1" />
                        <div>
                          <p className="text-sm font-medium tracking-tight">{option.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <p className="eyebrow mb-2">Payment method</p>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
                    {[
                      { value: "card", label: "Credit / Debit Card" },
                      { value: "upi", label: "UPI" },
                      { value: "wallet", label: "Wallet / Net Banking" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-3 border border-border p-4 cursor-pointer hover:border-foreground transition-colors">
                        <RadioGroupItem value={option.value} />
                        <span className="text-sm font-medium tracking-tight">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="grid gap-5 md:grid-cols-2 mt-6 pt-6 border-t border-border">
                      <div className="md:col-span-2">
                        <FloatingLabelInput
                          label="Card number"
                          value={card.number}
                          onChange={(e) => setCard({ ...card, number: e.target.value })}
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <FloatingLabelInput
                        label="Card holder"
                        value={card.holder}
                        onChange={(e) => setCard({ ...card, holder: e.target.value })}
                        placeholder="Name on card"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <FloatingLabelInput
                          label="Expiry"
                          value={card.expiry}
                          onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                          placeholder="MM/YY"
                        />
                        <FloatingLabelInput
                          label="CVV"
                          value={card.cvv}
                          type="password"
                          onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                          placeholder="123"
                        />
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === "upi" && (
                    <div className="border border-border p-5 bg-muted/30">
                      <p className="label-xs text-muted-foreground">UPI Payment</p>
                      <p className="text-sm mt-2 text-muted-foreground leading-relaxed">
                        A dynamic payment QR code or VPA request will be generated on placing order.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Review your details and confirm the order. The summary remains visible to the right.
                  </p>
                  <div className="border border-border p-5 space-y-3">
                    <p className="eyebrow">Shipping Address</p>
                    <p className="text-sm font-medium">{form.fullName}</p>
                    <p className="text-sm text-muted-foreground">{form.address}, {form.city}, {form.country}</p>
                    <p className="text-sm text-muted-foreground">{form.phone} | {form.email}</p>
                  </div>
                  <div className="grid gap-4">
                    {cart.map(({ item, product }) => (
                      <CartLineCard
                        key={`${item.productId}-${item.size ?? "-"}-${item.color ?? "-"}`}
                        product={product}
                        quantity={item.quantity}
                        size={item.size}
                        color={item.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <button
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  className="label-xs border border-border px-5 py-3 transition-transform duration-200 ease-out hover:scale-[1.03] cursor-pointer"
                  disabled={step === 0}
                >
                  Back
                </button>
                {step < 3 ? (
                  <button
                    onClick={handleContinue}
                    className="label-xs border border-border bg-foreground px-5 py-3 text-background transition-transform duration-200 ease-out hover:scale-[1.03] cursor-pointer"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={placeOrder}
                    className="label-xs border border-border bg-foreground px-5 py-3 text-background transition-transform duration-200 ease-out hover:scale-[1.03] cursor-pointer"
                  >
                    Place Order
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <OrderSummary
              subtotal={subtotal}
              discount={discount}
              shipping={shipping}
              total={total}
              promo={promo}
              onPromoChange={setPromo}
              onApply={applyPromo}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/cart" className="label-xs link-underline text-muted-foreground">
                Back to Cart
              </Link>
              <Link to="/wishlist" className="label-xs link-underline text-muted-foreground">
                Wishlist
              </Link>
            </div>
          </div>
        </div>
      </section>
      </ProtectedGuestGate>
    </motion.main>
  );
}