import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Clock, Package, ShieldAlert, ArrowLeft, Truck, CheckCircle2 } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { useOrderStore, type Order } from "@/hooks/useOrderStore";
import { ProtectedGuestGate } from "@/components/auth/ProtectedGuestGate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetailPage,
});

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function getStepStatus(currentStatus: string, stepKey: string) {
  const order = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currIdx = order.indexOf(currentStatus.toLowerCase());
  const stepIdx = order.indexOf(stepKey.toLowerCase());

  if (currentStatus.toLowerCase() === "cancelled") {
    return stepKey === "pending" ? "completed" : "disabled";
  }

  if (currIdx >= stepIdx) {
    return currIdx === stepIdx ? "active" : "completed";
  }
  return "upcoming";
}

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { getOrder } = useOrderStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setForbidden(false);

    getOrder(id)
      .then((ord) => {
        if (mounted) {
          if (ord) {
            setOrder(ord);
          } else {
            setOrder(null);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          if ((err as Error).message?.includes("403") || (err as Error).message?.includes("Forbidden")) {
            setForbidden(true);
          }
          setOrder(null);
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
        title="Order Details"
        subtitle="Sign in to view tracking timeline and item details for your acquisition."
        redirectPath={`/orders/${id}`}
      >
        <section className="edge py-28 md:py-32">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Back button */}
            <Link to="/orders" className="label-xs link-underline inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to My Orders</span>
            </Link>

            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent mx-auto" />
                <p className="eyebrow">Loading order record...</p>
              </div>
            ) : forbidden ? (
              <div className="border border-red-500/20 bg-red-500/5 p-8 text-center space-y-4 max-w-md mx-auto">
                <ShieldAlert className="h-10 w-10 text-red-500 mx-auto" />
                <p className="eyebrow text-red-500">Access Forbidden</p>
                <h1 className="display-sm">403 — Unauthorized</h1>
                <p className="text-xs text-muted-foreground">
                  You do not have permission to view this order. Orders are private to the client account that placed them.
                </p>
                <Link to="/orders" className="label-xs link-underline inline-block pt-2">
                  Return to My Orders
                </Link>
              </div>
            ) : !order ? (
              <div className="border border-border p-12 text-center space-y-4 max-w-md mx-auto">
                <Package className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="eyebrow text-muted-foreground">404 — Order Not Found</p>
                <h1 className="display-sm">Record Unavailable</h1>
                <p className="text-xs text-muted-foreground">
                  Could not find order record "{id}".
                </p>
                <Link to="/orders" className="label-xs link-underline inline-block pt-2">
                  Return to My Orders
                </Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow mb-2">Order Archive</p>
                    <h1 className="display-md font-mono">ORDER #{order.orderNumber}</h1>
                    <p className="text-xs text-muted-foreground mt-1">Placed on {order.date}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="eyebrow text-[9px] block">Payment Status</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {order.paymentStatus} via {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="border border-border bg-background p-6 md:p-8 space-y-6">
                  <p className="eyebrow">Order Status Timeline</p>

                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 pt-2">
                    {/* Connecting line for desktop */}
                    <div className="hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border z-0" />

                    {STATUS_STEPS.map((step, idx) => {
                      const state = getStepStatus(order.orderStatus, step.key);
                      const isCompleted = state === "completed";
                      const isActive = state === "active";

                      return (
                        <div key={step.key} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3 bg-background px-2">
                          <div
                            className={cn(
                              "h-10 w-10 rounded-full border-2 flex items-center justify-center text-xs font-mono font-semibold transition-colors",
                              isActive
                                ? "border-foreground bg-foreground text-background shadow-lg scale-110"
                                : isCompleted
                                ? "border-foreground bg-foreground text-background"
                                : "border-border text-muted-foreground/50 bg-background"
                            )}
                          >
                            {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                          </div>
                          <div className="text-left md:text-center">
                            <p
                              className={cn(
                                "text-xs font-medium tracking-tight",
                                isActive ? "text-foreground font-semibold" : isCompleted ? "text-foreground" : "text-muted-foreground/60"
                              )}
                            >
                              {step.label}
                            </p>
                            {isActive && (
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                                Current Status
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items Purchased */}
                <div className="space-y-4">
                  <h2 className="eyebrow">Items in Order ({order.items.length})</h2>
                  <div className="divide-y divide-border border border-border">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 md:p-6 gap-4 bg-background">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="h-20 w-16 object-cover border border-border bg-muted"
                          />
                          <div className="space-y-1">
                            <p className="text-sm font-medium tracking-tight text-foreground">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                            <p className="text-xs text-muted-foreground">Color: {item.selectedColor}</p>
                            <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">₹{item.priceAtPurchase.toLocaleString("en-IN")} each</p>
                          <p className="text-sm font-medium tabular-nums text-foreground mt-1">
                            ₹{(item.priceAtPurchase * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address & Financial Summary */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Shipping Address */}
                  <div className="border border-border p-6 space-y-4 bg-background">
                    <p className="eyebrow">Shipping Address</p>
                    <div className="space-y-1 text-xs">
                      <p className="text-sm font-medium text-foreground">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {order.shippingAddress.address}
                        <br />
                        {order.shippingAddress.city}
                        {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode}
                        <br />
                        {order.shippingAddress.country}
                      </p>
                      <p className="text-muted-foreground pt-2">
                        Phone: {order.shippingAddress.phone}
                        <br />
                        Email: {order.shippingAddress.email}
                      </p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border border-border p-6 space-y-4 bg-background">
                    <p className="eyebrow">Order Summary</p>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="text-foreground tabular-nums">₹{order.subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span className="text-foreground">
                          {order.shipping === 0 ? "Complimentary" : `₹${order.shipping}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax (8%)</span>
                        <span className="text-foreground tabular-nums">₹{order.tax.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-3 text-sm font-medium text-foreground">
                        <span>Total Paid</span>
                        <span className="tabular-nums font-bold">₹{order.total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </ProtectedGuestGate>
    </motion.main>
  );
}
