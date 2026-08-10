import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { EmptyState, OrderSummary, ProgressIndicator } from "@/components/commerce/CommerceBlocks";
import { CartLineCard } from "@/components/commerce/CommerceCards";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCommerce } from "@/hooks/useCommerce";
import { useUserStore } from "@/hooks/useUserStore";
import { useOrderStore } from "@/hooks/useOrderStore";
import { products as catalogProducts } from "@/lib/catalog";
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
  error,
  ...props
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  [key: string]: any;
}) {
  const [focused, setFocused] = useState(false);
  const isFilled = value.length > 0;

  return (
    <div className="w-full space-y-1">
      <div
        className={cn(
          "relative border bg-background transition-colors focus-within:border-foreground w-full h-14",
          error ? "border-red-500" : "border-border"
        )}
      >
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
      {error && <p className="text-[11px] text-red-500 pl-1">{error}</p>}
    </div>
  );
}

export function FloatingLabelTextarea({
  label,
  value,
  onChange,
  placeholder = "",
  error,
  ...props
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  [key: string]: any;
}) {
  const [focused, setFocused] = useState(false);
  const isFilled = value.length > 0;

  return (
    <div className="w-full space-y-1">
      <div
        className={cn(
          "relative border bg-background transition-colors focus-within:border-foreground w-full min-h-24",
          error ? "border-red-500" : "border-border"
        )}
      >
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
      {error && <p className="text-[11px] text-red-500 pl-1">{error}</p>}
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart: globalCart, clearCart, products } = useCommerce();
  const { user } = useUserStore();
  const { addOrder } = useOrderStore();

  const [step, setStep] = useState(0);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("express");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [card, setCard] = useState({
    number: "",
    holder: "",
    expiry: "",
    cvv: "",
  });

  // Pre-fill form when user loads
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || "",
        lastName: prev.lastName || user.lastName || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const cart = useMemo(() => {
    return globalCart.map((item) => {
      const product = products.find((p) => p.id === item.productId) ?? catalogProducts.find((p) => p.id === item.productId) ?? catalogProducts[0];
      return { item, product };
    });
  }, [globalCart, products]);

  const subtotal = cart.reduce((sum, entry) => sum + (entry.product?.priceValue || 100) * entry.item.quantity, 0);
  const shipping = shippingMethod === "express" || subtotal >= 500 ? 0 : 25;
  const tax = Math.round(subtotal * 0.08);
  const total = Math.max(0, subtotal - discount + shipping + tax);

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

  const validateStep0 = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    
    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (form.phone.trim().length < 7) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (!form.address.trim()) newErrors.address = "Shipping address is required.";
    if (!form.city.trim()) newErrors.city = "City is required.";
    if (!form.postalCode.trim()) newErrors.postalCode = "Postal code is required.";
    if (!form.country.trim()) newErrors.country = "Country is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Revalidate cart prior to checkout
  const revalidateCart = (): boolean => {
    for (const { item, product } of cart) {
      if (!product) {
        toast.error("Some items in your bag are no longer available. Please review your bag.");
        return false;
      }
      if (product.stock !== undefined && product.stock < item.quantity) {
        toast.error(`"${product.name}" has insufficient stock. Only ${product.stock} left.`);
        return false;
      }
    }
    return true;
  };

  const handleContinue = () => {
    if (step === 0) {
      if (!validateStep0()) {
        toast.error("Please fill in all required shipping address fields.");
        return;
      }
    }

    if (step === 2 && paymentMethod === "card") {
      const cardErrors: Record<string, string> = {};
      if (!card.number.trim()) cardErrors.cardNumber = "Card number is required.";
      if (!card.holder.trim()) cardErrors.cardHolder = "Card holder name is required.";
      if (!card.expiry.trim()) cardErrors.cardExpiry = "Expiry date is required.";
      if (!card.cvv.trim()) cardErrors.cardCvv = "CVV is required.";

      if (Object.keys(cardErrors).length > 0) {
        setErrors(cardErrors);
        toast.error("Please fill in all card details.");
        return;
      }
    }

    setErrors({});
    setStep((current) => Math.min(3, current + 1));
  };

  const placeOrder = async () => {
    if (!revalidateCart()) return;

    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: cart.map(({ item }) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.size || "M",
          selectedColor: item.color || "Black",
        })),
        shippingAddress: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        },
        paymentMethod: paymentMethod === "card" ? "Credit Card" : paymentMethod.toUpperCase(),
      };

      const result = await addOrder(orderPayload);

      if (result.success && result.order) {
        clearCart();
        toast.success("Order placed successfully!");
        navigate({ to: `/order-success/$id`, params: { id: result.order.orderNumber } });
      } else {
        toast.error(result.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      toast.error((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            title="Your bag is currently empty."
            description="Explore our archive and AI stylist results to select your pieces."
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
        subtitle="Sign in or create an account to complete your acquisition and track your order."
        redirectPath="/checkout"
      >
        <section className="edge py-28 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="eyebrow mb-8">Checkout</p>
              <h1 className="display-lg">Luxury Checkout</h1>
              <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                A secure four-step checkout with server-side pricing validation and real-time inventory reservation.
              </p>
            </div>
            <div className="border border-border p-6">
              <p className="eyebrow mb-4">Bag Summary</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {cart.length} item{cart.length > 1 ? "s" : ""} selected for checkout.
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
                      label="First name"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="E.g. Alexander"
                      error={errors.firstName}
                    />
                    <FloatingLabelInput
                      label="Last name"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="E.g. McQueen"
                      error={errors.lastName}
                    />
                    <FloatingLabelInput
                      label="Email address"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      error={errors.email}
                    />
                    <FloatingLabelInput
                      label="Phone number"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      error={errors.phone}
                    />
                    <div className="md:col-span-2">
                      <FloatingLabelTextarea
                        label="Shipping address"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Street name, building, suite or apartment number"
                        error={errors.address}
                      />
                    </div>
                    <FloatingLabelInput
                      label="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Mumbai / Delhi"
                      error={errors.city}
                    />
                    <FloatingLabelInput
                      label="State / Province"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="Maharashtra"
                    />
                    <FloatingLabelInput
                      label="Postal / Zip code"
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      placeholder="400001"
                      error={errors.postalCode}
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
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Singapore">Singapore</SelectItem>
                          <SelectItem value="UAE">UAE</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                        </SelectContent>
                      </Select>
                      <label className="absolute left-4 top-2 text-[9px] text-muted-foreground/45 tracking-wider pointer-events-none uppercase font-light">
                        Country
                      </label>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <p className="eyebrow mb-2">Delivery options</p>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="grid gap-3">
                      {[
                        { value: "express", label: "Express Delivery (Complimentary)", description: "2-3 business days with white-glove packaging" },
                        { value: "standard", label: "Standard Delivery", description: "3-5 business days standard delivery" },
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
                        { value: "upi", label: "UPI Instant Payment" },
                        { value: "netbanking", label: "Net Banking / Wallet" },
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
                            error={errors.cardNumber}
                          />
                        </div>
                        <FloatingLabelInput
                          label="Card holder name"
                          value={card.holder}
                          onChange={(e) => setCard({ ...card, holder: e.target.value })}
                          placeholder="Name on card"
                          error={errors.cardHolder}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <FloatingLabelInput
                            label="Expiry"
                            value={card.expiry}
                            onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                            placeholder="MM/YY"
                            error={errors.cardExpiry}
                          />
                          <FloatingLabelInput
                            label="CVV"
                            value={card.cvv}
                            type="password"
                            onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                            placeholder="123"
                            error={errors.cardCvv}
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod !== "card" && (
                      <div className="border border-border p-5 bg-muted/30">
                        <p className="label-xs text-muted-foreground">Express Direct Checkout</p>
                        <p className="text-sm mt-2 text-muted-foreground leading-relaxed">
                          Your purchase will be verified securely upon order confirmation.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Review your delivery and payment details before confirming your order.
                    </p>
                    <div className="border border-border p-5 space-y-3">
                      <p className="eyebrow">Shipping Destination</p>
                      <p className="text-sm font-medium">{form.firstName} {form.lastName}</p>
                      <p className="text-sm text-muted-foreground">{form.address}, {form.city}, {form.state} {form.postalCode}, {form.country}</p>
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
                    className="label-xs border border-border px-5 py-3 transition-transform duration-200 ease-out hover:scale-[1.03] cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    disabled={step === 0 || isSubmitting}
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
                      disabled={isSubmitting}
                      className="label-xs border border-border bg-foreground px-6 py-3 text-background transition-transform duration-200 ease-out hover:scale-[1.03] cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Place Order</span>
                      )}
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