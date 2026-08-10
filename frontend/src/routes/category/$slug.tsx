import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { CategoryHero } from "@/components/shop/CategoryHero";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { SortDropdown } from "@/components/shop/SortDropdown";
import { getCategory, products, sortProducts, type Product, type SortValue } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const TITLE = "Maison Noir | Category";

export const Route = createFileRoute("/category/$slug")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content: "Editorial category pages for monochrome luxury fashion collections.",
      },
      { property: "og:title", content: TITLE },
      {
        property: "og:description",
        content: "Editorial category pages for monochrome luxury fashion collections.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CategoryPage,
});

function matchesEditorialChip(product: Product, chip: string) {
  const needle = chip.toLowerCase();
  return [product.name, product.category, product.style, product.occasion, product.season, product.color, product.brand, product.description]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function CategoryPage() {
  const { slug } = Route.useParams();
  const category = getCategory(slug);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [sort, setSort] = useState<SortValue>("recommended");
  const [quickView, setQuickView] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    if (!category) return [];

    const base = products.filter(category.match);
    const chiseled = activeChip ? base.filter((product) => matchesEditorialChip(product, activeChip)) : base;

    return sortProducts(chiseled, sort);
  }, [activeChip, category, sort]);

  if (!category) {
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
        <section className="edge flex min-h-svh items-center justify-center py-24 text-center">
          <div className="max-w-md">
            <p className="eyebrow">Category not found</p>
            <h1 className="display-md mt-4">The archive section could not be located.</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Return to the shop archive to continue browsing the collection.
            </p>
            <Link
              to="/shop"
              className="label-xs link-underline mt-8 inline-flex text-foreground"
            >
              Back to shop
            </Link>
          </div>
        </section>
      </motion.main>
    );
  }

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
        eyebrow={category.eyebrow}
        title={category.title}
        description={category.description}
        image={category.image}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: category.title },
        ]}
      />

      <section className="edge py-14 md:py-18">
        <div className="sticky top-20 z-30 -mx-4 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-xl md:mx-0 md:px-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2 md:gap-3">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveChip(null)}
                className={cn(
                  "label-xs border px-4 py-3 transition-colors duration-500",
                  activeChip === null
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                All
              </motion.button>
              {category.chips.map((chip) => {
                const active = activeChip === chip;
                return (
                  <motion.button
                    key={chip}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveChip(active ? null : chip)}
                    className={cn(
                      "label-xs border px-4 py-3 transition-colors duration-500",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                    )}
                  >
                    {chip}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <p className="label-xs text-muted-foreground">
                {filteredProducts.length} pieces
              </p>
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <ProductGrid products={filteredProducts} onQuickView={setQuickView} />
        </motion.div>
      </section>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </motion.main>
  );
}