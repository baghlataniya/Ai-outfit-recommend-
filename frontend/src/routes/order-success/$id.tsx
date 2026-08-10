import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { useOrderStore, type Order } from "@/hooks/useOrderStore";
import { ProtectedGuestGate } from "@/components/auth/ProtectedGuestGate";

export const Route = createFileRoute("/order-success/$id")({
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { id } = Route.useParams();
  const { getOrder } = useOrderStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getOrder(id).then((ord) => {
      if (mounted) {
        setOrder(ord || null);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [id, getOrder]);

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
        title="Order Confirmation"
        subtitle="Sign in to view details of your recent luxury acquisitions."
        redirectPath={`/order-success/${id}`}
      >
        <section className="edge py-28 md:py-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent mb-4" />
              <p className="eyebrow">Fetching order records...</p>
            </div>
          ) : !order ? (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <p className="eyebrow text-red-500">Order Not Found</p>
              <h1 className="display-sm">Acquisition Record Unavailable</h1>
              <p className="text-sm text-muted-foreground">
                We could not locate order details for "{id}".
              </p>
              <Link to="/shop" className="label-xs link-underline inline-block mt-4">
                Return to Shop
              </Link>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-12">
              {/* Header */}
              <div className="text-center space-y-4 border-b border-border pb-10">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background mx-auto">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <p className="eyebrow tracking-[0.3em] text-foreground">Acquisition Confirmed</p>
                <h1 className="display-lg">ORDER CONFIRMED</h1>
                <p className="text-sm font-mono tracking-widest text-muted-foreground uppercase pt-2">
                  Order #{order.orderNumber}
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Thank you for purchasing from Maison Noir. A confirmation message has been logged for your account.
                </p>
              </div>

              {/* Order Info Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-border p-6 text-xs text-muted-foreground bg-muted/20">
                <div>
                  <span className="block eyebrow mb-1">Order Number</span>
                  <span className="font-mono text-foreground font-semibold">{order.orderNumber}</span>
                </div>
                <div>
                  <span className="block eyebrow mb-1">Date</span>
                  <span className="text-foreground">{order.date}</span>
                </div>
                <div>
                  <span className="block eyebrow mb-1">Payment</span>
                  <span className="text-foreground capitalize">{order.paymentMethod}</span>
                </div>
                <div>
                  <span className="block eyebrow mb-1">Est. Delivery</span>
                  <span className="text-foreground font-medium">2–4 Business Days</span>
                </div>
              </div>

              {/* Items Purchased */}
              <div className="space-y-4">
                <h2 className="eyebrow tracking-wider">Items Purchased ({order.items.length})</h2>
                <div className="divide-y divide-border border border-border">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-16 w-12 object-cover border border-border bg-muted"
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium tracking-tight">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        ₹{(item.priceAtPurchase * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown & Address */}
              <div className="grid md:grid-cols-2 gap-8 pt-4">
                {/* Shipping Address */}
                <div className="border border-border p-6 space-y-3 bg-background">
                  <p className="eyebrow">Shipping Address</p>
                  <p className="text-sm font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city}
                    {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                  <p className="text-xs text-muted-foreground pt-2">
                    {order.shippingAddress.phone} | {order.shippingAddress.email}
                  </p>
                </div>

                {/* Summary */}
                <div className="border border-border p-6 space-y-3 bg-background">
                  <p className="eyebrow">Order Summary</p>
                  <div className="space-y-2 text-xs text-muted-foreground pt-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-foreground tabular-nums">₹{order.subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-foreground">
                        {order.shipping === 0 ? "Complimentary" : `₹${order.shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%)</span>
                      <span className="text-foreground tabular-nums">₹{order.tax.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 text-sm font-medium text-foreground">
                      <span>Total</span>
                      <span className="tabular-nums font-bold">₹{order.total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-border">
                <Link
                  to="/orders/$id"
                  params={{ id: order.orderNumber }}
                  className="label-xs border border-border bg-foreground px-6 py-3.5 text-background hover:bg-charcoal transition-transform duration-200 hover:scale-[1.03] flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  <span>VIEW ORDER</span>
                </Link>
                <Link
                  to="/shop"
                  className="label-xs border border-border px-6 py-3.5 text-foreground hover:bg-muted transition-transform duration-200 hover:scale-[1.03] flex items-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>CONTINUE SHOPPING</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      </ProtectedGuestGate>
    </motion.main>
  );
}
