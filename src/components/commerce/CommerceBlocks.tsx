import { memo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export const EmptyState = memo(function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-background px-6 py-20 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-border bg-muted">
        <span className="h-10 w-10 border border-border" />
      </div>
      <h2 className="display-sm">{title}</h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {cta && <div className="mt-8 flex justify-center">{cta}</div>}
    </div>
  );
});

export const SkeletonLoader = memo(function SkeletonLoader({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton-shimmer bg-muted", className)} />;
});

export const ProgressIndicator = memo(function ProgressIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const active = index === current;
        const complete = index < current;
        return (
          <div key={step} className="flex items-center gap-3 shrink-0">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center border text-xs transition-colors duration-200",
                complete || active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground",
              )}
            >
              {complete ? <Check className="h-3.5 w-3.5" strokeWidth={1.5} /> : index + 1}
            </div>
            <span className={cn("label-xs", active ? "text-foreground" : "text-muted-foreground")}>
              {step}
            </span>
            {index < steps.length - 1 && <span className="h-px w-8 bg-border" />}
          </div>
        );
      })}
    </div>
  );
});

export const OrderSummary = memo(function OrderSummary({
  subtotal,
  discount,
  shipping,
  total,
  promo,
  onPromoChange,
  onApply,
}: {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promo: string;
  onPromoChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <aside className="border border-border bg-background p-6">
      <p className="eyebrow mb-5">Order Summary</p>
      <div className="space-y-3 text-sm">
        <Row label="Subtotal" value={subtotal} />
        <Row label="Discount" value={discount} />
        <Row label="Shipping" value={shipping} />
        <div className="border-t border-border pt-3">
          <Row label="Total" value={total} bold />
        </div>
      </div>
      <div className="mt-6">
        <label className="label-xs mb-2 block text-muted-foreground">Promo code</label>
        <div className="flex gap-2">
          <input
            value={promo}
            onChange={(e) => onPromoChange(e.target.value)}
            className="h-10 flex-1 border border-border bg-transparent px-3 text-sm outline-none"
          />
          <button
            onClick={onApply}
            className="label-xs border border-border px-4 py-2 transition-transform duration-200 ease-out hover:scale-[1.02]"
          >
            Apply
          </button>
        </div>
      </div>
    </aside>
  );
});

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", bold && "text-base")}>
      <span className={bold ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}

export const SuccessCard = memo(function SuccessCard({
  orderNumber,
  eta,
}: {
  orderNumber: string;
  eta: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border border-border bg-background p-6 text-center"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-border bg-muted">
        <svg
          className="h-10 w-10 text-foreground animate-in fade-in zoom-in duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <p className="eyebrow mb-3">Order Confirmed</p>
      <h1 className="display-sm">Your order is in motion.</h1>
      <p className="mt-4 text-sm text-muted-foreground">Order {orderNumber}</p>
      <p className="mt-2 text-sm text-muted-foreground">Estimated delivery {eta}</p>
    </motion.article>
  );
});
