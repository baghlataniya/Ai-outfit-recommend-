import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Compact mode for inside cart lines */
  compact?: boolean;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  compact = false,
}: Props) {
  const canDec = value > min;
  const canInc = value < max;

  return (
    <div
      className={cn(
        "inline-flex items-stretch border border-border bg-background",
        compact ? "h-9" : "h-11",
      )}
      role="group"
      aria-label="Quantity"
    >
      {/* Decrement */}
      <motion.button
        type="button"
        onClick={() => canDec && onChange(value - 1)}
        disabled={!canDec}
        whileHover={canDec ? { backgroundColor: "oklch(0.96 0 0)" } : {}}
        whileTap={canDec ? { scale: 0.90 } : {}}
        transition={{ duration: 0.14, ease: "easeOut" }}
        aria-label="Decrease quantity"
        className={cn(
          "flex items-center justify-center border-r border-border transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer",
          compact ? "w-9" : "w-11",
        )}
      >
        <Minus className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")} strokeWidth={1.8} />
      </motion.button>

      {/* Count — animated slide */}
      <div
        className={cn(
          "relative overflow-hidden flex items-center justify-center border-r border-border",
          compact ? "w-9" : "w-12",
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute tabular-nums font-medium",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Increment */}
      <motion.button
        type="button"
        onClick={() => canInc && onChange(value + 1)}
        disabled={!canInc}
        whileHover={canInc ? { backgroundColor: "oklch(0.96 0 0)" } : {}}
        whileTap={canInc ? { scale: 0.90 } : {}}
        transition={{ duration: 0.14, ease: "easeOut" }}
        aria-label="Increase quantity"
        className={cn(
          "flex items-center justify-center transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer",
          compact ? "w-9" : "w-11",
        )}
      >
        <Plus className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")} strokeWidth={1.8} />
      </motion.button>
    </div>
  );
}
