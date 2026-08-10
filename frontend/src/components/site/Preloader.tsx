import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WORDS = ["ATELIER", "FORM", "MATERIAL", "MAISON NOIR"];

export function Preloader({ onDone }: { onDone?: () => void }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (index < WORDS.length - 1) {
      const t = setTimeout(() => setIndex((i) => i + 1), 380);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setDone(true);
      onDone?.();
    }, 720);
    return () => clearTimeout(t);
  }, [index, onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-end justify-between bg-ink px-6 pb-8 md:px-10"
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={WORDS[index]}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                exit={{ y: "-110%" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="block text-[clamp(2rem,7vw,5rem)] font-extralight tracking-tight text-background"
              >
                {WORDS[index]}
              </motion.span>
            </AnimatePresence>
          </div>
          <motion.span
            className="label-xs pb-3 text-background/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {String(Math.round(((index + 1) / WORDS.length) * 100)).padStart(3, "0")}
          </motion.span>
          <motion.span
            className="absolute bottom-0 left-0 h-px bg-background/40"
            initial={{ width: "0%" }}
            animate={{ width: `${((index + 1) / WORDS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}