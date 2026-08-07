import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { X, Search } from "lucide-react";
import { products, CATEGORY_PAGES, TRENDING_SEARCHES } from "@/lib/catalog";

const RECENT = ["Monolith trench", "Cashmere knit", "Black boot"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q),
        )
      : products.slice(0, 4);
    return base.slice(0, 4);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[980] overflow-y-auto bg-background/92 backdrop-blur-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="edge py-7">
            <div className="flex items-center justify-between">
              <span className="label-xs tracking-[0.4em]">MAISON&nbsp;NOIR</span>
              <button onClick={onClose} aria-label="Close search" className="label-xs flex items-center gap-2">
                Close <X className="h-4 w-4" strokeWidth={1.2} />
              </button>
            </div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="mt-16 flex items-center gap-4 border-b border-foreground pb-5"
            >
              <Search className="h-5 w-5 shrink-0 opacity-50" strokeWidth={1.2} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the archive"
                aria-label="Search the archive"
                className="display-md w-full bg-transparent font-extralight outline-none placeholder:text-muted-foreground/50"
              />
            </motion.div>

            <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-12">
                <div>
                  <p className="eyebrow mb-5">Recent</p>
                  <ul className="space-y-2">
                    {RECENT.map((r, i) => (
                      <motion.li
                        key={r}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05, duration: 0.6 }}
                      >
                        <button onClick={() => setQuery(r)} className="link-underline text-sm">
                          {r}
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="eyebrow mb-5">Trending</p>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((t, i) => (
                      <motion.button
                        key={t}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.05, duration: 0.6 }}
                        whileHover={{ y: -2 }}
                        onClick={() => setQuery(t)}
                        className="label-xs border border-border px-4 py-2 transition-colors duration-500 hover:border-foreground"
                      >
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-5">Categories</p>
                  <ul className="grid grid-cols-2 gap-y-2">
                    {CATEGORY_PAGES.slice(0, 6).map((c) => (
                      <li key={c.slug}>
                        <Link
                          to="/category/$slug"
                          params={{ slug: c.slug }}
                          onClick={onClose}
                          className="link-underline text-sm text-muted-foreground hover:text-foreground"
                        >
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="eyebrow">{query ? "Results" : "Suggested"}</p>
                  {query && (
                    <Link
                      to="/search"
                      search={{ q: query }}
                      onClick={onClose}
                      className="label-xs link-underline text-muted-foreground"
                    >
                      View All Search Results →
                    </Link>
                  )}
                </div>
                {results.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pieces match “{query}”.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
                    {results.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link to="/product/$id" params={{ id: p.id }} onClick={onClose} className="group block">
                          <div className="aspect-[3/4] overflow-hidden bg-muted">
                            <img
                              src={p.image}
                              alt={p.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                            />
                          </div>
                          <p className="mt-3 text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.price}</p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
