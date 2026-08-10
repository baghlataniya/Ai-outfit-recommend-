import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SizeVariant } from "@/lib/catalog";

type Props = {
  sizes: SizeVariant[];
  selected: string | null;
  onChange: (size: string) => void;
  compact?: boolean;
};

export function SizeSelector({ sizes = [], selected, onChange, compact = false }: Props) {
  const safeSizes = Array.isArray(sizes) ? sizes : [];
  return (
    <div className={cn("flex flex-wrap", compact ? "gap-1.5" : "gap-2")}>
      {safeSizes.map(({ value, stock = 10 }) => {
        const outOfStock = stock === 0;
        const lowStock   = stock > 0 && stock <= 3;
        const isSelected = selected === value;

        return (
          <motion.button
            key={value}
            type="button"
            disabled={outOfStock}
            onClick={() => !outOfStock && onChange(value)}
            initial={false}
            /** Scale only — colour handled by CSS transition-colors */
            whileHover={!outOfStock && !isSelected ? { scale: 1.03 } : {}}
            whileTap={!outOfStock ? { scale: 0.97 } : {}}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className={cn(
              // Layout
              "relative inline-flex items-center justify-center overflow-hidden",
              "select-none border transition-colors duration-200",
              // Shape
              compact ? "h-8 min-w-[2.25rem] rounded-[4px] px-2 text-[10px] tracking-widest" : "h-[42px] min-w-[42px] rounded-[6px] px-3.5 text-xs tracking-widest",
              // State colours — CSS handles smooth transition
              isSelected
                ? "border-foreground bg-foreground text-background"
                : outOfStock
                  ? "cursor-not-allowed border-border bg-background text-foreground opacity-35"
                  : "cursor-pointer border-border bg-background text-foreground hover:border-foreground/60",
            )}
            aria-pressed={isSelected}
            aria-label={`Size ${value}${outOfStock ? " — sold out" : ""}${lowStock ? ` — only ${stock} left` : ""}`}
          >
            <span className="relative z-10 font-medium">{value}</span>

            {/* Diagonal strike-through for out-of-stock */}
            {outOfStock && (
              <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <svg
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="0"
                    y1="100%"
                    x2="100%"
                    y2="0"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.45"
                  />
                </svg>
              </span>
            )}

            {/* Low-stock indicator dot */}
            {lowStock && !outOfStock && (
              <span
                className="absolute top-[3px] right-[3px] h-[5px] w-[5px] rounded-full bg-foreground/40"
                aria-hidden
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
