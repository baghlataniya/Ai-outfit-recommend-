import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Color name → { hex, isLight } lookup */
const COLOR_CONFIG: Record<string, { hex: string; isLight: boolean }> = {
  Black:        { hex: "#0B0B0B", isLight: false },
  Charcoal:     { hex: "#2B2B2B", isLight: false },
  "Soft White": { hex: "#F7F7F5", isLight: true  },
  "Light Gray": { hex: "#D8D8D8", isLight: true  },
  White:        { hex: "#FFFFFF", isLight: true  },
  Cream:        { hex: "#EDE0CC", isLight: true  },
  Beige:        { hex: "#D4C5A9", isLight: true  },
  Gray:         { hex: "#A0A0A0", isLight: false },
  Brown:        { hex: "#6B4226", isLight: false },
  Navy:         { hex: "#1C2B4B", isLight: false },
  Ivory:        { hex: "#FFFEF0", isLight: true  },
  Olive:        { hex: "#4A4A2A", isLight: false },
};

function getConfig(name: string) {
  return COLOR_CONFIG[name] ?? { hex: "#888888", isLight: false };
}

type Props = {
  colors: string[];
  selected: string | null;
  onChange: (color: string) => void;
  compact?: boolean;
  showLabels?: boolean;
};

export function ColorSwatch({
  colors = [],
  selected,
  onChange,
  compact = false,
  showLabels = false,
}: Props) {
  const safeColors = Array.isArray(colors) ? colors : [];
  return (
    <div className="flex flex-col gap-2.5">
      {/* Swatches row */}
      <div className={cn("flex flex-wrap", compact ? "gap-2" : "gap-2.5")}>
        {safeColors.map((color) => {
          const { hex, isLight } = getConfig(color);
          const isSelected = selected === color;

          /** Box-shadow layers:
           *  1. 1px border on the swatch itself (for light colors: gray, else subtle)
           *  2. (selected only) 2px white gap ring
           *  3. (selected only) 2px foreground outer ring
           */
          const shadow = isSelected
            ? `0 0 0 1.5px ${isLight ? "#c8c8c8" : "transparent"}, 0 0 0 3.5px #ffffff, 0 0 0 5.5px #0B0B0B`
            : `0 0 0 1px ${isLight ? "#c8c8c8" : "rgba(0,0,0,0.14)"}`;

          return (
            <motion.button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              aria-label={color}
              aria-pressed={isSelected}
              title={color}
              initial={false}
              whileHover={{ scale: isSelected ? 1.08 : 1.05 }}
              whileTap={{ scale: 0.93 }}
              animate={{ scale: isSelected ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 24, duration: 0.2 }}
              className={cn(
                "relative cursor-pointer rounded-full",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                compact ? "h-5 w-5" : "h-[34px] w-[34px]",
              )}
              style={{ backgroundColor: hex, boxShadow: shadow }}
            />
          );
        })}
      </div>

      {/* Selected colour name — animated crossfade */}
      <AnimatePresence mode="wait" initial={false}>
        {selected && (
          <motion.p
            key={selected}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="label-xs text-muted-foreground"
          >
            Selected:{" "}
            <span className="font-medium text-foreground">{selected}</span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Optional per-swatch labels row */}
      {showLabels && (
        <div className={cn("flex flex-wrap", compact ? "gap-2" : "gap-2.5")}>
          {safeColors.map((color) => (
            <span
              key={color}
              className={cn(
                "text-center text-[9px] leading-none tracking-wider text-muted-foreground",
                compact ? "w-5" : "w-[34px]",
              )}
            >
              {color.split(" ")[0]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
