import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-hidden");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      setActive(Boolean(el?.closest("a, button, [data-cursor='hover']")));
    };

    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("cursor-hidden");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[999] mix-blend-difference"
        style={{ x: sx, y: sy }}
      >
        <motion.span
          className="block rounded-full bg-background"
          animate={{ width: active ? 44 : 8, height: active ? 44 : 8, x: active ? -22 : -4, y: active ? -22 : -4, opacity: active ? 0.5 : 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[998] mix-blend-difference"
        style={{ x, y }}
      >
        <span className="-ml-[2px] -mt-[2px] block h-1 w-1 rounded-full bg-background" />
      </motion.div>
    </>
  );
}