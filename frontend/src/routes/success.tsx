import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, MapPinned, ShoppingBag } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { EmptyState, SuccessCard } from "@/components/commerce/CommerceBlocks";
import { RecommendationCard } from "@/components/commerce/CommerceCards";
import { getOrder } from "@/lib/commerce";
import { products } from "@/lib/catalog";

const lazySectionStyle = { contentVisibility: "auto", containIntrinsicSize: "1px 900px" } as const;

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

function SuccessPage() {
  const [order, setOrder] = useState(() => getOrder());
  const [trackingVisible, setTrackingVisible] = useState(false);

  useEffect(() => {
    setOrder(getOrder());
  }, []);

  const recommendations = useMemo(() => products.slice(0, 4), []);

  const downloadInvoice = () => {
    if (!order) return;
    const invoice = [
      "MAISON NOIR — ORDER INVOICE",
      `Order: ${order.orderNumber}`,
      `Estimated delivery: ${order.eta}`,
      `Total paid: ₹${order.total.toLocaleString("en-IN")}`,
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([invoice], { type: "text/plain" }));
    link.download = `${order.orderNumber}-invoice.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

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

      <section className="edge py-28 md:py-32">
        {order ? (
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="eyebrow mb-8">Order Success</p>
              <h1 className="display-lg">Order confirmed.</h1>
              <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Your order has been confirmed and is being prepared with quiet precision.
              </p>
            </div>
            <SuccessCard orderNumber={order.orderNumber} eta={order.eta} />
          </div>
        ) : (
          <EmptyState
            title="No Orders"
            description="Your latest confirmed order will appear here once checkout is completed."
            cta={
              <Link to="/shop" className="label-xs link-underline">
                Continue shopping
              </Link>
            }
          />
        )}
      </section>

      {order && (
        <>
          <section className="edge py-10 md:py-14" style={lazySectionStyle}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="border border-border p-5">
                <p className="label-xs text-muted-foreground">Order Number</p>
                <p className="mt-2 text-sm font-medium tracking-tight">{order.orderNumber}</p>
              </div>
              <div className="border border-border p-5">
                <p className="label-xs text-muted-foreground">Estimated Delivery</p>
                <p className="mt-2 text-sm font-medium tracking-tight">{order.eta}</p>
              </div>
              <div className="border border-border p-5">
                <p className="label-xs text-muted-foreground">Total Paid</p>
                <p className="mt-2 text-sm font-medium tracking-tight">
                  ₹{order.total.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="border border-border p-5">
                <p className="label-xs text-muted-foreground">Status</p>
                <p className="mt-2 text-sm font-medium tracking-tight">Preparing</p>
              </div>
            </div>
          </section>

          <section className="edge py-10 md:py-14" style={lazySectionStyle}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Link
                to="/shop"
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Continue Shopping <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.2} />
              </Link>
              <button
                onClick={downloadInvoice}
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Download Invoice <Download className="h-3.5 w-3.5" strokeWidth={1.2} />
              </button>
              <button
                onClick={() => setTrackingVisible((current) => !current)}
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Track Order <MapPinned className="h-3.5 w-3.5" strokeWidth={1.2} />
              </button>
              <Link
                to="/stylist/results"
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Back to AI Results <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.2} />
              </Link>
            </div>
          </section>

          {trackingVisible && (
            <section className="edge pb-10 md:pb-14">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border p-5"
              >
                <p className="eyebrow mb-3">Order Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Your order is being prepared. We will notify you when it begins its journey.
                </p>
              </motion.div>
            </section>
          )}

          <section className="edge py-10 md:py-14" style={lazySectionStyle}>
            <div className="mb-8">
              <p className="eyebrow mb-3">Recommended Products</p>
              <h2 className="display-sm">Pieces to continue the edit.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {recommendations.map((product) => (
                <RecommendationCard
                  key={product.id}
                  product={product}
                  label={product.category}
                  match={product.aiMatch}
                  onQuickView={() => window.open(`/product/${product.id}`, "_self")}
                  onReplace={() => window.open(`/product/${product.id}`, "_self")}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </motion.main>
  );
}
