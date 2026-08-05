import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  variant?: "solid" | "outline" | "ghost";
  onClick?: () => void;
  strength?: number;
};

export function MagneticButton({
  children,
  className,
  variant = "solid",
  onClick,
  strength = 0.35,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.5 });

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      onPointerMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={cn(
        "label-xs relative inline-flex items-center justify-center gap-3 px-9 py-4 transition-colors duration-500",
        variant === "solid" && "bg-foreground text-background hover:bg-charcoal",
        variant === "outline" &&
          "border border-current text-current hover:bg-foreground hover:text-background",
        variant === "ghost" && "text-current",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}