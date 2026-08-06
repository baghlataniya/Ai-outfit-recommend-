import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function WishlistButton({
  active,
  onToggle,
  className,
}: {
  active: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={cn(
        "flex h-9 w-9 items-center justify-center bg-background/85 backdrop-blur-sm",
        className,
      )}
    >
      <Heart
        className={cn("h-4 w-4 transition-colors", active && "fill-foreground text-foreground")}
        strokeWidth={1.2}
      />
    </motion.button>
  );
}
