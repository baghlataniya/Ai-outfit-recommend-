import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/hooks/useUserStore";

export function WishlistButton({
  active,
  onToggle,
  className,
}: {
  active: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const { isAuthenticated, openAuthModal } = useUserStore();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal({
        redirectUrl: "/wishlist",
        action: onToggle,
      });
      return;
    }

    onToggle();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={cn(
        "flex h-9 w-9 items-center justify-center bg-background/85 backdrop-blur-sm cursor-pointer",
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
