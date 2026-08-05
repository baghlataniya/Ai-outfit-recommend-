import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Collection", href: "#collection" },
  { label: "Stylist", href: "#stylist" },
  { label: "Categories", href: "#categories" },
  { label: "Editorial", href: "#editorial" },
  { label: "Journal", href: "#gallery" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "edge fixed inset-x-0 top-0 z-[900] transition-[background-color,backdrop-filter,border-color,padding] duration-700",
          scrolled
            ? "border-b border-foreground/10 bg-background/70 py-4 backdrop-blur-xl"
            : "border-b border-transparent py-7",
        )}
      >
        <nav
          className={cn(
            "flex items-center justify-between transition-colors duration-700",
            scrolled ? "text-foreground" : "text-background",
          )}
          aria-label="Primary"
        >
          <a href="#top" className="label-xs tracking-[0.4em]">
            MAISON&nbsp;NOIR
          </a>

          <ul className="hidden items-center gap-10 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="label-xs link-underline opacity-80 hover:opacity-100">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6">
            <button className="label-xs hidden link-underline sm:inline-block">Search</button>
            <button className="label-xs link-underline">Bag (0)</button>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex h-4 w-6 flex-col justify-between md:hidden"
            >
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="edge fixed inset-0 z-[950] flex flex-col justify-between bg-ink py-7 text-background"
          >
            <div className="flex items-center justify-between">
              <span className="label-xs tracking-[0.4em]">MAISON&nbsp;NOIR</span>
              <button onClick={() => setOpen(false)} className="label-xs">
                Close
              </button>
            </div>
            <ul className="space-y-2">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="display-md block font-extralight"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <p className="label-xs text-background/50">Paris — Milan — Tokyo</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}