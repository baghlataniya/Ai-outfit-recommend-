import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS, type SortValue } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (v: SortValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="label-xs flex items-center gap-3 border border-border px-4 py-3 transition-colors duration-500 hover:border-foreground"
      >
        <span className="text-muted-foreground">Sort</span>
        <span>{current?.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.4 }}>
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.2} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0, y: -8, clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-50 mt-2 w-60 border border-border bg-background py-2 shadow-[0_30px_60px_-45px_oklch(0.12_0_0/0.8)]"
          >
            {SORT_OPTIONS.map((o) => (
              <li key={o.value}>
                <button
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors duration-300 hover:bg-muted",
                    o.value === value ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {o.label}
                  {o.value === value && <span className="h-1 w-1 bg-foreground" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
