import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, RotateCcw, Share2, Download } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { OutfitCard, RecommendationCard, AIInsightCard } from "@/components/commerce/CommerceCards";
import { EmptyState } from "@/components/commerce/CommerceBlocks";
import { products, type Product } from "@/lib/catalog";
import { useCartStore } from "@/hooks/useCommerce";
import { QuickViewModal } from "@/components/shop/QuickViewModal";

const lazySectionStyle = { contentVisibility: "auto", containIntrinsicSize: "1px 1100px" } as const;

type Brief = {
  gender?: string | null;
  occasion?: string | null;
  weather?: string | null;
  style?: string | null;
  colors?: string[];
  budget?: number;
  brands?: string[];
  bodyType?: string | null;
};

type OutfitSlot = {
  slot: "Top" | "Bottom" | "Shoes" | "Accessories" | "Bag" | "Watch";
  product: Product;
};

type Outfit = {
  id: string;
  title: string;
  occasion: string;
  weather: string;
  match: number;
  total: string;
  totalValue: number;
  image: string;
  products: OutfitSlot[];
};

export const Route = createFileRoute("/stylist/results")({
  component: ResultsPage,
});

function readBrief(): Brief {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem("maison-noir-stylist-brief") ?? "{}");
  } catch {
    return {};
  }
}

function pickNext(candidates: Product[], used: Set<string>, currentIndex: number) {
  const available = candidates.filter((product) => !used.has(product.id));
  return (
    available[currentIndex % Math.max(available.length, 1)] ??
    candidates[currentIndex % candidates.length] ??
    products[0]
  );
}

function getReplacementCandidates(slotName: string, brief: Brief): Product[] {
  const pool = products.filter((product) => {
    if (
      brief.gender &&
      brief.gender !== "Unisex" &&
      product.gender !== brief.gender &&
      product.gender !== "Unisex"
    )
      return false;
    if (brief.budget && product.priceValue > brief.budget) return false;
    return true;
  });

  const category = (name: string) =>
    pool.filter(
      (product) =>
        product.category === name || product.name.toLowerCase().includes(name.toLowerCase()),
    );

  if (slotName === "Top") {
    return category("Shirting").concat(category("Knitwear"), category("Outerwear"), category("Dresses"));
  } else if (slotName === "Bottom") {
    return category("Tailoring").concat(category("Denim"));
  } else if (slotName === "Shoes") {
    return category("Shoes");
  } else if (slotName === "Accessories") {
    return category("Accessories");
  } else if (slotName === "Bag") {
    return pool.filter((p) => p.name.toLowerCase().includes("bag") || p.category === "Accessories");
  } else if (slotName === "Watch") {
    return pool.filter((p) => p.name.toLowerCase().includes("watch") || p.category === "Accessories");
  }
  return pool;
}

function buildOutfits(brief: Brief, seed = 0): Outfit[] {
  const preferred = products.filter((product) => {
    if (
      brief.gender &&
      brief.gender !== "Unisex" &&
      product.gender !== brief.gender &&
      product.gender !== "Unisex"
    )
      return false;
    if (brief.occasion && !product.occasion.toLowerCase().includes(brief.occasion.toLowerCase()))
      return false;
    if (brief.style && !product.style.toLowerCase().includes(brief.style.toLowerCase()))
      return false;
    if (brief.brands?.length && !brief.brands.includes(product.brand)) return false;
    if (brief.budget && product.priceValue > brief.budget) return false;
    return true;
  });

  const pool = preferred.length ? preferred : products;
  const category = (name: string) =>
    pool.filter(
      (product) =>
        product.category === name || product.name.toLowerCase().includes(name.toLowerCase()),
    );

  const outfits: Outfit[] = [];
  const used = new Set<string>();

  const templates = [
    {
      id: "signature-minimal",
      title: "Signature Minimal",
      occasion: brief.occasion ?? "Everyday",
      weather: brief.weather ?? "Indoor",
      slots: [
        { slot: "Top" as const, list: category("Shirting").concat(category("Knitwear"), pool) },
        { slot: "Bottom" as const, list: category("Tailoring").concat(category("Denim"), pool) },
        { slot: "Shoes" as const, list: category("Shoes") },
        { slot: "Accessories" as const, list: category("Accessories") },
        {
          slot: "Bag" as const,
          list: category("Accessories").concat(
            pool.filter((product) => product.category !== "Shoes"),
          ),
        },
        { slot: "Watch" as const, list: category("Accessories").concat(pool) },
      ],
    },
    {
      id: "soft-evening",
      title: "Soft Evening",
      occasion:
        brief.occasion === "Party" || brief.occasion === "Date Night" ? brief.occasion : "Evening",
      weather: brief.weather ?? "Cold",
      slots: [
        { slot: "Top" as const, list: category("Dresses").concat(category("Shirting"), pool) },
        { slot: "Bottom" as const, list: category("Tailoring").concat(category("Dresses"), pool) },
        { slot: "Shoes" as const, list: category("Shoes") },
        { slot: "Accessories" as const, list: category("Accessories") },
        { slot: "Bag" as const, list: category("Accessories").concat(pool) },
        { slot: "Watch" as const, list: category("Accessories").concat(pool) },
      ],
    },
    {
      id: "weather-layered",
      title: "Weather Layered",
      occasion: brief.occasion === "Vacation" ? brief.occasion : "Travel",
      weather: brief.weather ?? "Windy",
      slots: [
        { slot: "Top" as const, list: category("Knitwear").concat(category("Shirting"), pool) },
        { slot: "Bottom" as const, list: category("Denim").concat(category("Tailoring"), pool) },
        { slot: "Shoes" as const, list: category("Shoes") },
        { slot: "Accessories" as const, list: category("Accessories") },
        { slot: "Bag" as const, list: category("Accessories").concat(pool) },
        { slot: "Watch" as const, list: category("Accessories").concat(pool) },
      ],
    },
    {
      id: "quiet-luxury-casual",
      title: "Quiet Luxury Casual",
      occasion: brief.occasion ?? "Casual",
      weather: brief.weather ?? "Sunny",
      slots: [
        { slot: "Top" as const, list: category("Knitwear").concat(category("Shirting"), pool) },
        { slot: "Bottom" as const, list: category("Denim").concat(pool) },
        { slot: "Shoes" as const, list: category("Shoes") },
        { slot: "Accessories" as const, list: category("Accessories") },
        { slot: "Bag" as const, list: category("Accessories").concat(pool) },
        { slot: "Watch" as const, list: category("Accessories").concat(pool) },
      ],
    },
    {
      id: "tailored-executive",
      title: "Tailored Executive",
      occasion: brief.occasion ?? "Office",
      weather: brief.weather ?? "Indoor",
      slots: [
        { slot: "Top" as const, list: category("Tailoring").concat(category("Shirting"), pool) },
        { slot: "Bottom" as const, list: category("Tailoring").concat(pool) },
        { slot: "Shoes" as const, list: category("Shoes") },
        { slot: "Accessories" as const, list: category("Accessories") },
        { slot: "Bag" as const, list: category("Accessories").concat(pool) },
        { slot: "Watch" as const, list: category("Accessories").concat(pool) },
      ],
    },
    {
      id: "relaxed-monochrome",
      title: "Relaxed Monochrome",
      occasion: brief.occasion ?? "Lounge",
      weather: brief.weather ?? "Mild",
      slots: [
        { slot: "Top" as const, list: category("Knitwear").concat(category("Shirting"), pool) },
        { slot: "Bottom" as const, list: category("Denim").concat(pool) },
        { slot: "Shoes" as const, list: category("Shoes") },
        { slot: "Accessories" as const, list: category("Accessories") },
        { slot: "Bag" as const, list: category("Accessories").concat(pool) },
        { slot: "Watch" as const, list: category("Accessories").concat(pool) },
      ],
    },
  ];

  templates.forEach((template, templateIndex) => {
    const localUsed = new Set<string>(used);
    const slots = template.slots.map((slotConfig, slotIndex) => {
      const candidate = pickNext(slotConfig.list, localUsed, slotIndex + seed + templateIndex);
      localUsed.add(candidate.id);
      return { slot: slotConfig.slot, product: candidate };
    });

    slots.forEach((slot) => used.add(slot.product.id));

    const totalValue = slots.reduce((sum, slot) => sum + slot.product.priceValue, 0);

    outfits.push({
      id: template.id,
      title: template.title,
      occasion: template.occasion,
      weather: template.weather,
      match: [99, 98, 97, 96, 95, 95][templateIndex],
      total: `$${totalValue.toLocaleString("en-US")}`,
      totalValue,
      image: slots[0]?.product.image ?? products[0].image,
      products: slots,
    });
  });

  return outfits;
}

function ResultsPage() {
  const { addToCart } = useCartStore();
  const [brief, setBrief] = useState<Brief>({});
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [savedOutfits, setSavedOutfits] = useState<string[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const nextBrief = readBrief();
    setBrief(nextBrief);
  }, []);

  useEffect(() => {
    if (Object.keys(brief).length > 0 || refreshSeed > 0) {
      setOutfits(buildOutfits(brief, refreshSeed));
    }
  }, [brief, refreshSeed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setSavedOutfits(JSON.parse(window.localStorage.getItem("maison-noir-saved-outfits") ?? "[]"));
    } catch {
      setSavedOutfits([]);
    }
  }, []);

  const insights = useMemo(() => {
    const styleName = brief.style ? brief.style.toLowerCase() : "minimalist";
    const weatherName = brief.weather ? brief.weather.toLowerCase() : "warm";
    const bodyTypeName = brief.bodyType ? brief.bodyType.toLowerCase() : "selected body type";
    const occasionName = brief.occasion ? brief.occasion.toLowerCase() : "your occasion";
    
    return [
      {
        title: `This outfit complements your selected ${bodyTypeName} shape.`,
        description: "The structural cut highlights shoulders and creates clean vertical lines to balance proportions.",
      },
      {
        title: `Neutral colors match your ${styleName} preference.`,
        description: "A strict palette of black, white, and gray keeps the visual composition calm and sophisticated.",
      },
      {
        title: `Recommended for ${weatherName} weather.`,
        description: "Fabric weight and weave density are optimized for thermal comfort in these conditions.",
      },
      {
        title: `Balanced silhouette for ${occasionName}.`,
        description: "Tailored elements blend with relaxed drapes to offer appropriate structure for this setting.",
      },
    ];
  }, [brief]);

  const handleAddOutfitToCart = (outfit: Outfit) => {
    outfit.products.forEach((slot) => addToCart(slot.product.id, 1, "M", "Black", outfit.id));
    toast.success(`Complete "${outfit.title}" outfit added to bag.`);
  };

  const handleSaveOutfit = (outfit: Outfit) => {
    setSavedOutfits((current) => {
      const next = current.includes(outfit.id)
        ? current.filter((item) => item !== outfit.id)
        : [...current, outfit.id];
      if (typeof window !== "undefined") {
        window.localStorage.setItem("maison-noir-saved-outfits", JSON.stringify(next));
      }
      toast.success(
        next.includes(outfit.id) ? `"${outfit.title}" saved to profile.` : `"${outfit.title}" removed.`
      );
      return next;
    });
  };

  const handleReplaceItem = (outfitId: string, slotName: string, currentProductId: string) => {
    const candidates = getReplacementCandidates(slotName, brief);
    const otherCandidates = candidates.filter((p) => p.id !== currentProductId);
    
    if (otherCandidates.length === 0) {
      toast.error(`No alternative items available for category: ${slotName}`);
      return;
    }

    const randomProduct = otherCandidates[Math.floor(Math.random() * otherCandidates.length)];

    setOutfits((currentOutfits) =>
      currentOutfits.map((outfit) => {
        if (outfit.id !== outfitId) return outfit;

        const nextProducts = outfit.products.map((slot) => {
          if (slot.slot !== slotName) return slot;
          return { ...slot, product: randomProduct };
        });

        const totalValue = nextProducts.reduce((sum, s) => sum + s.product.priceValue, 0);

        toast.success(`Swapped ${slotName.toLowerCase()} item.`);

        return {
          ...outfit,
          total: `$${totalValue.toLocaleString("en-US")}`,
          totalValue,
          image: slotName === "Top" ? randomProduct.image : outfit.image,
          products: nextProducts,
        };
      })
    );
  };

  const handleDownloadOutfit = (outfit: Outfit) => {
    const text = [
      "========================================",
      "             MAISON NOIR AI             ",
      "        Personalized Outfit Brief       ",
      "========================================",
      "",
      `Outfit Profile: ${outfit.title}`,
      `Match Confidence: ${outfit.match}%`,
      `Occasion Context: ${outfit.occasion}`,
      `Weather Adaptability: ${outfit.weather}`,
      `Estimated Investment: ${outfit.total}`,
      "",
      "----------------------------------------",
      "CURATED PIECES",
      "----------------------------------------",
      ...outfit.products.map(
        (slot) => `- [${slot.slot}] ${slot.product.name} (${slot.product.price})`
      ),
      "",
      "----------------------------------------",
      "AI STYLING NOTE",
      "----------------------------------------",
      "This wardrobe edit is composed strictly",
      "within the luxury minimalist spectrum,",
      "optimizing drape, texture, and silhouette",
      "for a modern aesthetic.",
      "",
      "Thank you for choosing Maison Noir.",
      "========================================",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${outfit.title.toLowerCase().replace(/\s+/g, "-")}-outfit.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`"${outfit.title}" manifest downloaded.`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: "Your AI Curated Outfit",
        text: "Premium AI style results from Maison Noir",
        url,
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("AI results link copied to clipboard.");
    }
  };

  const noResults = outfits.length === 0;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-background"
    >
      <SmoothScroll />
      <CustomCursor />
      <Nav solid />

      <section className="edge py-28 md:py-32">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow mb-8">AI Results</p>
            <h1 className="display-lg">Your Personalized Outfit</h1>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Curated by AI using your personal preferences.
            </p>
          </div>
          <div className="border border-border p-6">
            <p className="eyebrow mb-4">Brief Summary</p>
            <div className="flex flex-wrap gap-2">
              {[brief.gender, brief.occasion, brief.weather, brief.style, brief.bodyType]
                .filter(Boolean)
                .map((value) => (
                  <span key={String(value)} className="label-xs border border-border px-3 py-2">
                    {value}
                  </span>
                ))}
              {brief.budget ? (
                <span className="label-xs border border-border px-3 py-2">
                  ₹{brief.budget.toLocaleString("en-IN")}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {noResults ? (
        <section className="edge py-10 md:py-14" style={lazySectionStyle}>
          <EmptyState
            title="No AI Recommendations Available"
            description="Adjust your stylist brief to generate a more precise edit for this archive."
            cta={
              <Link to="/stylist" className="label-xs link-underline">
                Change preferences
              </Link>
            }
          />
        </section>
      ) : (
        <>
          <section className="edge py-10 md:py-14" style={lazySectionStyle}>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">Generated Outfits</p>
                <h2 className="display-sm">Complete outfits built from the brief.</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/stylist" className="label-xs link-underline text-muted-foreground">
                  Edit Preferences
                </Link>
                <button
                  onClick={() => setRefreshSeed((current) => current + 1)}
                  className="label-xs flex items-center gap-2 border border-border px-4 py-3 transition-transform duration-200 ease-out hover:scale-[1.03]"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.2} />
                  Generate Again
                </button>
              </div>
            </div>

            <div className="grid gap-12">
              {outfits.map((outfit) => (
                <div key={outfit.id} className="border border-border bg-background p-4 md:p-6">
                  <OutfitCard
                    title={outfit.title}
                    occasion={outfit.occasion}
                    weather={outfit.weather}
                    match={outfit.match}
                    total={outfit.total}
                    image={outfit.image}
                    products={outfit.products.map((slot) => slot.product)}
                    onViewDetails={() => setQuickViewProduct(outfit.products[0]?.product)}
                    onAddOutfit={() => handleAddOutfitToCart(outfit)}
                    onToggleSaved={() => handleSaveOutfit(outfit)}
                    onShare={handleShare}
                    saved={savedOutfits.includes(outfit.id)}
                  />

                  <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {outfit.products.map((slot) => (
                      <div key={`${outfit.id}-${slot.slot}`} className="min-w-0">
                        <RecommendationCard
                          product={slot.product}
                          label={slot.slot}
                          match={
                            slot.slot === "Top"
                              ? 98
                              : slot.slot === "Bottom"
                                ? 96
                                : slot.slot === "Shoes"
                                  ? 97
                                  : 93
                          }
                          onQuickView={(p) => setQuickViewProduct(p)}
                          onReplace={(p) => handleReplaceItem(outfit.id, slot.slot, p.id)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleSaveOutfit(outfit)}
                      className="label-xs border border-border px-4 py-3 transition-transform duration-200 ease-out hover:scale-[1.03]"
                    >
                      {savedOutfits.includes(outfit.id) ? "Saved Outfit" : "Save Outfit"}
                    </button>
                    <button
                      onClick={() => handleAddOutfitToCart(outfit)}
                      className="label-xs border border-border px-4 py-3 transition-transform duration-200 ease-out hover:scale-[1.03]"
                    >
                      Add Entire Outfit to Cart
                    </button>
                    <button
                      onClick={() => handleDownloadOutfit(outfit)}
                      className="label-xs flex items-center gap-2 border border-border px-4 py-3 transition-transform duration-200 ease-out hover:scale-[1.03]"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={1.2} />
                      Download Outfit
                    </button>
                    <button
                      onClick={handleShare}
                      className="label-xs flex items-center gap-2 border border-border px-4 py-3 transition-transform duration-200 ease-out hover:scale-[1.03]"
                    >
                      <Share2 className="h-3.5 w-3.5" strokeWidth={1.2} />
                      Share Outfit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="edge py-10 md:py-14" style={lazySectionStyle}>
            <div className="mb-8">
              <p className="eyebrow mb-3">Smart AI Insights</p>
              <h2 className="display-sm">Quiet explanations, written like an editorial note.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {insights.map((insight) => (
                <AIInsightCard
                  key={insight.title}
                  title={insight.title}
                  description={insight.description}
                />
              ))}
            </div>
          </section>

          <section className="edge py-10 md:py-14" style={lazySectionStyle}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Link
                to="/stylist"
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Edit Preferences <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.2} />
              </Link>
              <button
                onClick={() => setRefreshSeed((current) => current + 1)}
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Generate Again <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.2} />
              </button>
              <Link
                to="/wishlist"
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Go to Wishlist <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.2} />
              </Link>
              <button
                onClick={handleShare}
                className="label-xs flex items-center justify-between border border-border px-5 py-4 transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Share Outfit <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.2} />
              </button>
            </div>
          </section>
        </>
      )}

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </motion.main>
  );
}
