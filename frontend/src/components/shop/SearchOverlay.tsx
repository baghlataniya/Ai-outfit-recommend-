import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { X, Search, Trash2, ArrowUpRight } from "lucide-react";
import { products, CATEGORY_PAGES, TRENDING_SEARCHES } from "@/lib/catalog";

const RECENT_KEY = "maison-noir-recent-searches";
const INITIAL_RECENT = ["Monolith trench", "Cashmere knit", "Column trouser"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(INITIAL_RECENT);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(RECENT_KEY);
        if (raw) {
          setRecentSearches(JSON.parse(raw));
        }
      } catch (e) {
        console.error("Error reading recent searches:", e);
      }
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(RECENT_KEY);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 4);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.style.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      onClose();
      navigate({ to: "/search", search: { q: query.trim() } });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[980] overflow-y-auto bg-background/95 backdrop-blur-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Search Archive"
        >
          <div className="edge py-7">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="label-xs tracking-[0.4em]">MAISON&nbsp;NOIR</span>
              <button onClick={onClose} aria-label="Close search" className="label-xs flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                Close [Esc] <X className="h-4 w-4" strokeWidth={1.2} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit}>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="mt-12 flex items-center gap-4 border-b border-foreground pb-5"
              >
                <Search className="h-5 w-5 shrink-0 opacity-50 text-foreground" strokeWidth={1.2} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, materials, silhouettes..."
                  aria-label="Search the archive"
                  className="display-md w-full bg-transparent font-extralight outline-none placeholder:text-muted-foreground/40 text-foreground"
                />
              </motion.div>
            </form>

            <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.5fr]">
              <div className="space-y-10">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="eyebrow">Recent Searches</p>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {recentSearches.map((r, i) => (
                        <motion.li
                          key={r + i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + i * 0.04, duration: 0.5 }}
                        >
                          <button
                            onClick={() => {
                              setQuery(r);
                              saveRecentSearch(r);
                            }}
                            className="link-underline text-sm text-foreground/80 hover:text-foreground cursor-pointer"
                          >
                            {r}
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="eyebrow mb-4">Trending Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((t, i) => (
                      <motion.button
                        key={t}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.04, duration: 0.5 }}
                        whileHover={{ y: -1 }}
                        onClick={() => {
                          setQuery(t);
                          saveRecentSearch(t);
                        }}
                        className="label-xs border border-border px-4 py-2 transition-colors duration-300 hover:border-foreground cursor-pointer"
                      >
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-4">Explore Categories</p>
                  <ul className="grid grid-cols-2 gap-y-2.5">
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
                <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-3">
                  <p className="eyebrow">{query ? `Matching Results (${results.length})` : "Curated Suggestions"}</p>
                  {query && results.length > 0 && (
                    <Link
                      to="/search"
                      search={{ q: query }}
                      onClick={() => {
                        saveRecentSearch(query);
                        onClose();
                      }}
                      className="label-xs link-underline text-foreground flex items-center gap-1"
                    >
                      View All ({results.length}) <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-border p-8">
                    <p className="eyebrow mb-2">No Matches Found</p>
                    <h3 className="text-base font-light text-foreground">No pieces match “{query}”</h3>
                    <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Try searching for broader keywords like "Cashmere", "Coat", "Tailoring", or browse our curated archive.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setQuery("Outerwear")}
                        className="label-xs border border-foreground px-5 py-2.5 hover:bg-foreground hover:text-background transition-colors"
                      >
                        View Outerwear Archive
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3">
                    {results.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.05, duration: 0.5 }}
                      >
                        <Link
                          to="/product/$id"
                          params={{ id: p.id }}
                          onClick={() => {
                            saveRecentSearch(p.name);
                            onClose();
                          }}
                          className="group block"
                        >
                          <div className="aspect-[3/4] overflow-hidden bg-muted">
                            <img
                              src={p.image}
                              alt={p.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          </div>
                          <p className="mt-3 text-sm font-medium tracking-tight group-hover:underline underline-offset-4 decoration-foreground/40">{p.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{p.price}</p>
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
