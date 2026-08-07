import { useState, useMemo } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, SlidersHorizontal, ArrowRight } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { products, type Product } from "@/lib/catalog";

type SearchParams = {
  q?: string;
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      q: typeof search.q === "string" ? search.q : "",
    };
  },
  component: SearchPage,
});

const POPULAR_SEARCHES = ["Coat", "Cashmere", "Trouser", "Leather", "Silk", "Trench"];
const RECENT_SEARCHES = ["Minimal Tailoring", "Black Coat", "Outerwear"];

function SearchPage() {
  const { q: initialQuery = "" } = useSearch({ from: "/search" });
  const [query, setQuery] = useState(initialQuery);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<string>("All");

  const filteredProducts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return products.filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(trimmed) ||
        p.category.toLowerCase().includes(trimmed) ||
        p.brand.toLowerCase().includes(trimmed) ||
        p.description.toLowerCase().includes(trimmed) ||
        p.color.toLowerCase().includes(trimmed);

      const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchGender = selectedGender === "All" || p.gender === selectedGender;

      return matchQuery && matchCategory && matchGender;
    });
  }, [query, selectedCategory, selectedGender]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-background min-h-screen"
    >
      <SmoothScroll />
      <CustomCursor />
      <Nav solid />

      <section className="edge py-28 md:py-36">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header & Search Bar */}
          <div className="text-center space-y-6">
            <p className="eyebrow">Archive Search</p>
            <h1 className="display-lg">Catalog Search</h1>

            {/* Input */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coats, cashmere, footwear..."
                className="w-full h-14 border border-border bg-background px-5 pr-12 text-base text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground focus:outline-none"
              />
              {query ? (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear query"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : (
                <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              )}
            </div>
          </div>

          {/* Quick chips when empty */}
          {!query.trim() && (
            <div className="space-y-8 pt-4">
              <div>
                <p className="label-xs text-muted-foreground mb-3 text-center">Popular Searches</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="label-xs border border-border bg-background px-4 py-2 hover:border-foreground transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="label-xs text-muted-foreground mb-3 text-center">Recent Searches</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {RECENT_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results section */}
          {query.trim() && (
            <div className="space-y-8">
              {/* Category & Gender filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                <p className="label-xs text-muted-foreground">
                  Showing <strong className="text-foreground">{filteredProducts.length}</strong> results for "{query}"
                </p>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="label-xs text-muted-foreground">Category:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border border-border bg-background px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="label-xs text-muted-foreground">Gender:</span>
                    <select
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      className="border border-border bg-background px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      <option value="All">All</option>
                      <option value="Women">Women</option>
                      <option value="Men">Men</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid */}
              {filteredProducts.length === 0 ? (
                <div className="border border-border bg-background p-16 text-center space-y-4">
                  <h3 className="display-xs">No Archive Matches Found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    We couldn't find any pieces matching "{query}". Try adjusting your query or exploring our primary catalog.
                  </p>
                  <div className="pt-4 flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setQuery("");
                        setSelectedCategory("All");
                        setSelectedGender("All");
                      }}
                      className="label-xs border border-border px-5 py-3 cursor-pointer"
                    >
                      Clear Search
                    </button>
                    <Link to="/shop" className="label-xs bg-foreground text-background px-5 py-3">
                      Browse Full Shop
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredProducts.map((p) => (
                    <ShopProductCard
                      key={p.id}
                      product={p}
                      onQuickView={() => setQuickViewProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </motion.main>
  );
}
