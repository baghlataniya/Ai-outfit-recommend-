import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Filter, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

import editorialHero from "@/assets/editorial-4.jpg";
import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { CategoryHero } from "@/components/shop/CategoryHero";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { SortDropdown } from "@/components/shop/SortDropdown";
import {
  applyFilters,
  emptyFilters,
  products,
  sortProducts,
  type Filters,
  type Product,
  type SortValue,
} from "@/lib/catalog";

const TITLE = "Shop | Maison Noir";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content: "A premium editorial shopping archive for monochrome luxury fashion.",
      },
      { property: "og:title", content: TITLE },
      {
        property: "og:description",
        content: "A premium editorial shopping archive for monochrome luxury fashion.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [filters, setFilters] = useState<Filters>(() => emptyFilters());
  const [sort, setSort] = useState<SortValue>("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return sortProducts(applyFilters(products, filters), sort);
  }, [filters, sort]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-background"
    >
      <SmoothScroll />
      <CustomCursor />
      <Nav solid />

      <CategoryHero
        eyebrow="Archive — Complete collection"
        title="All Products"
        description="An editorial edit of the full Maison Noir archive, filtered by silhouette, season, and occasion."
        image={editorialHero}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Shop" },
        ]}
      />

      <section className="edge py-14 md:py-18">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 grid gap-5 border-b border-border pb-6 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div>
            <p className="eyebrow mb-3">Luxury archive</p>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Refine the edit by material, category, or season. The archive keeps the selection
              monochrome, restrained, and intentionally paced.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="label-xs flex items-center gap-2 border border-border px-4 py-3 transition-colors duration-500 hover:border-foreground lg:hidden"
            >
              <Filter className="h-3.5 w-3.5" strokeWidth={1.2} />
              Filters
            </button>
            <div className="label-xs flex items-center gap-2 text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.2} />
              {filteredProducts.length} pieces
            </div>
            <SortDropdown value={sort} onChange={setSort} />
          </div>
        </motion.div>

        <div className="flex items-start gap-10">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            resultCount={filteredProducts.length}
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <ProductGrid products={filteredProducts} onQuickView={setQuickView} />
          </div>
        </div>
      </section>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </motion.main>
  );
}