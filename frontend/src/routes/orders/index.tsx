import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Package, ChevronRight, ShoppingBag, Clock, CheckCircle2, Truck, AlertCircle } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { EmptyState } from "@/components/commerce/CommerceBlocks";
import { useOrderStore } from "@/hooks/useOrderStore";
import { ProtectedGuestGate } from "@/components/auth/ProtectedGuestGate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders/")({
  component: MyOrdersPage,
});

function getStatusBadge(status: string) {
  const lower = status.toLowerCase();
  switch (lower) {
    case "delivered":
      return { label: "Delivered", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    case "shipped":
    case "in transit":
      return { label: "Shipped", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    case "processing":
      return { label: "Processing", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
    case "confirmed":
      return { label: "Confirmed", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
    case "cancelled":
      return { label: "Cancelled", bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" };
    default:
      return { label: status, bg: "bg-muted text-muted-foreground border-border" };
  }
}

function MyOrdersPage() {
  const { orders, loading } = useOrderStore();

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
        title="My Orders & Client History"
        subtitle="Sign in to view your order history, track active shipments, and manage past acquisitions."
        redirectPath="/orders"
      >
        <section className="edge py-28 md:py-32">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Acquisition Archive</p>
                <h1 className="display-lg">My Orders</h1>
              </div>
              <p className="text-xs text-muted-foreground">
                {orders.length} order{orders.length === 1 ? "" : "s"} logged in your client account.
              </p>
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent mx-auto" />
                <p className="eyebrow">Fetching client orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                title="You haven't placed any orders yet."
                description="Your order history will appear here once you make your first acquisition."
                cta={
                  <Link to="/shop" className="label-xs border border-border bg-foreground px-6 py-3 text-background hover:bg-charcoal transition-transform hover:scale-[1.02] inline-flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    <span>BROWSE COLLECTION</span>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const badge = getStatusBadge(order.orderStatus);
                  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

                  return (
                    <Link
                      key={order.id || order.orderNumber}
                      to="/orders/$id"
                      params={{ id: order.orderNumber }}
                      className="block border border-border bg-background p-6 hover:border-foreground transition-all duration-300 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono text-sm font-semibold tracking-wider text-foreground">
                              {order.orderNumber}
                            </span>
                            <span className={cn("text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 border rounded-full", badge.bg)}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Placed on {order.date} • {itemCount} item{itemCount > 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
                          <div className="text-left sm:text-right">
                            <p className="eyebrow text-[9px]">Total</p>
                            <p className="text-base font-medium tabular-nums text-foreground">
                              ₹{order.total.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center group-hover:border-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      {/* Items thumbnails preview */}
                      <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-3 overflow-x-auto">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 shrink-0 bg-muted/30 p-1.5 border border-border">
                            <img src={item.image} alt={item.productName} className="h-10 w-8 object-cover" />
                            <div className="text-[11px] pr-2">
                              <p className="font-medium text-foreground truncate max-w-[120px]">{item.productName}</p>
                              <p className="text-muted-foreground">{item.selectedSize} / {item.selectedColor}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </ProtectedGuestGate>
    </motion.main>
  );
}
