import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "@/components/shop/SearchOverlay";

type NavLink = { label: string; to?: string; params?: Record<string, string>; href?: string };

const LINKS: NavLink[] = [
  { label: "Shop", to: "/shop" },
  { label: "Women", to: "/category/$slug", params: { slug: "women" } },
  { label: "Men", to: "/category/$slug", params: { slug: "men" } },
  { label: "Shoes", to: "/category/$slug", params: { slug: "shoes" } },
  { label: "Accessories", to: "/category/$slug", params: { slug: "accessories" } },
];

function NavItem({ link, onClick, className }: { link: NavLink; onClick?: () => void; className?: string }) {
  if (link.to) {
    return (
      <Link to={link.to} params={link.params as never} onClick={onClick} className={className}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} onClick={onClick} className={className}>
      {link.label}
    </a>
  );
}

export function Nav({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
          scrolled || solid
            ? "border-b border-foreground/10 bg-background/70 py-4 backdrop-blur-xl"
            : "border-b border-transparent py-7",
        )}
      >
        <nav
          className={cn(
            "flex items-center justify-between transition-colors duration-700",
            scrolled || solid ? "text-foreground" : "text-background",
          )}
          aria-label="Primary"
        >
          <Link to="/" className="label-xs tracking-[0.4em]">
            MAISON&nbsp;NOIR
          </Link>

          <ul className="hidden items-center gap-10 md:flex">
            {LINKS.map((l) => (
              <li key={l.label}>
                <NavItem link={l} className="label-xs link-underline opacity-80 hover:opacity-100" />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setSearchOpen(true)}
              className="label-xs link-underline"
              aria-label="Open search"
            >
              Search
            </button>
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
                  key={l.label}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NavItem
                    link={l}
                    onClick={() => setOpen(false)}
                    className="display-md block font-extralight"
                  />
                </motion.li>
              ))}
            </ul>
            <p className="label-xs text-background/50">Paris — Milan — Tokyo</p>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}