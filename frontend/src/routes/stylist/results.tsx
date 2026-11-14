import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, RotateCcw, Share2, Download, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { OutfitCard, RecommendationCard, AIInsightCard } from "@/components/commerce/CommerceCards";
import { EmptyState } from "@/components/commerce/CommerceBlocks";
import { products, type Product } from "@/lib/catalog";
import { useCartStore } from "@/hooks/useCommerce";
import { useSavedOutfitsStore } from "@/hooks/useSavedOutfitsStore";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { commerceApi } from "@/lib/api";

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
  aiExplanation?: string;
  styleHighlights?: string[];
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

  if (slotName === "Outerwear") {
    return category("Outerwear").concat(pool.filter((p) => p.name.includes("Blazer") || p.name.includes("Coat") || p.name.includes("Trench")));
  } else if (slotName === "Top") {
    return category("Shirting").concat(category("Knitwear"), category("Dresses"));
  } else if (slotName === "Bottom") {
    return category("Tailoring").concat(category("Denim")).filter((p) => !p.name.includes("Blazer"));
  } else if (slotName === "Shoes") {
    return category("Shoes");
  } else if (slotName === "Accessories") {
    return category("Accessories");
  } else if (slotName === "Bag") {
    return pool.filter((p) => p.name.toLowerCase().includes("bag") || p.name.toLowerCase().includes("tote") || p.category === "Accessories");
  } else if (slotName === "Watch") {
    return pool.filter((p) => p.name.toLowerCase().includes("watch") || p.category === "Accessories");
  }
  return pool;
}

function buildOutfits(brief: Brief, seed = 0): Outfit[] {
  const gender = (brief.gender || "").toLowerCase();
  const weather = (brief.weather || "").toLowerCase();
  const occasion = (brief.occasion || "").toLowerCase();
  const style = (brief.style || "").toLowerCase();

  const isCold = weather.includes("cold") || weather.includes("snow") || weather.includes("wind") || weather.includes("winter");
  const isWarm = weather.includes("sunny") || weather.includes("warm") || weather.includes("summer") || weather.includes("spring");
  const isRain = weather.includes("rain");

  const isEvening = occasion.includes("party") || occasion.includes("date") || occasion.includes("evening");
  const isFormal = occasion.includes("wedding") || occasion.includes("formal") || occasion.includes("black tie");
  const isOffice = occasion.includes("office") || occasion.includes("business") || occasion.includes("work");

  // Filter products by gender and budget
  const eligible = products.filter((product) => {
    const pGender = product.gender.toLowerCase();
    if (gender === "male" || gender === "men") {
      if (pGender === "women") return false;
    } else if (gender === "female" || gender === "women") {
      if (pGender === "men") return false;
    }
    if (brief.budget && product.priceValue > brief.budget) return false;
    return true;
  });

  const pool = eligible.length >= 8 ? eligible : products;

  // Score pool items for this specific brief
  const scored = pool.map((product) => {
    let score = 50;
    const cat = product.category.toLowerCase();
    const mat = product.description.toLowerCase();
    const occ = product.occasion.toLowerCase();

    if (isWarm) {
      if (mat.includes("wool") || cat === "outerwear" || product.name.includes("Boot") || product.name.includes("Scarf") || product.name.includes("Parka") || product.name.includes("Coat")) {
        score -= 100;
      }
      if (mat.includes("linen") || mat.includes("silk") || mat.includes("poplin") || product.name.includes("Mule") || product.name.includes("Sneaker") || product.name.includes("Skirt")) {
        score += 60;
      }
    } else if (isCold) {
      if (mat.includes("wool") || mat.includes("cashmere") || cat === "outerwear" || product.name.includes("Boot") || product.name.includes("Turtleneck") || product.name.includes("Scarf")) {
        score += 60;
      }
      if (mat.includes("linen") || product.name.includes("Camisole") || product.name.includes("Mule")) {
        score -= 80;
      }
    }

    if (isFormal || isEvening) {
      if (cat === "dresses" || product.name.includes("Blazer") || product.name.includes("Gown") || product.name.includes("Trouser") || product.name.includes("Derby") || product.name.includes("Mule")) {
        score += 50;
      }
      if (cat === "denim" || product.name.includes("Sneaker")) {
        score -= 60;
      }
    } else if (isOffice) {
      if (cat === "tailoring" || cat === "shirting" || product.name.includes("Blazer") || product.name.includes("Trouser") || product.name.includes("Tote")) {
        score += 50;
      }
    } else {
      if (cat === "denim" || cat === "knitwear" || product.name.includes("Sneaker") || product.name.includes("Overshirt")) {
        score += 50;
      }
    }

    // Seed jitter for rotation
    const charSum = (product.id + String(seed)).split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    score += (charSum % 25) - 12;

    return { product, score };
  }).sort((a, b) => b.score - a.score).map((s) => s.product);

  const outerwear = scored.filter((p) => p.category === "Outerwear");
  const tops = scored.filter((p) => ["Shirting", "Knitwear"].includes(p.category));
  const dresses = scored.filter((p) => p.category === "Dresses");
  const bottoms = scored.filter((p) => ["Tailoring", "Denim"].includes(p.category) && !p.name.includes("Blazer"));
  const blazers = scored.filter((p) => p.name.includes("Blazer"));
  const shoes = scored.filter((p) => p.category === "Shoes");
  const accessories = scored.filter((p) => p.category === "Accessories");

  const used = new Set<string>();
  const pick = (list: Product[], offset: number): Product | null => {
    if (!list || list.length === 0) return null;
    const unused = list.filter((p) => !used.has(p.id));
    const target = unused.length > 0 ? unused : list;
    const chosen = target[(seed + offset) % target.length];
    used.add(chosen.id);
    return chosen;
  };

  const outfits: Outfit[] = [];
  const occasionLabel = brief.occasion || "Formal Evening";
  const weatherLabel = brief.weather || "All Season";

  // Look 1: Primary Statement
  const slots1: OutfitSlot[] = [];
  if (gender === "female" && dresses.length > 0 && (isEvening || isFormal)) {
    const d = pick(dresses, 0);
    if (d) slots1.push({ slot: "Top", product: d });
    const s = pick(shoes, 0);
    if (s) slots1.push({ slot: "Shoes", product: s });
    const a = pick(accessories, 0);
    if (a) slots1.push({ slot: "Accessories", product: a });
    if (isCold) {
      const c = pick(outerwear, 0);
      if (c) slots1.unshift({ slot: "Outerwear" as any, product: c });
    }
  } else {
    if ((isCold || isRain || isOffice) && outerwear.length > 0 && !isWarm) {
      const c = pick(outerwear, 0);
      if (c) slots1.push({ slot: "Outerwear" as any, product: c });
    }
    const t = pick(tops, 0);
    if (t) slots1.push({ slot: "Top", product: t });
    const b = pick(bottoms, 0);
    if (b) slots1.push({ slot: "Bottom", product: b });
    const s = pick(shoes, 0);
    if (s) slots1.push({ slot: "Shoes", product: s });
    const a = pick(accessories, 0);
    if (a) slots1.push({ slot: "Accessories", product: a });
  }

  if (slots1.length > 0) {
    const totalVal = slots1.reduce((acc, slot) => acc + slot.product.priceValue, 0);
    const hero = slots1[0].product;
    outfits.push({
      id: `look1_${seed}`,
      title: isWarm ? `${hero.category} Summer Column` : `${hero.name.split(" ")[0]} Architectural Drape`,
      occasion: occasionLabel,
      weather: weatherLabel,
      match: 99,
      total: `$${totalVal.toLocaleString("en-US")}`,
      totalValue: totalVal,
      image: hero.image,
      aiExplanation: `Engineered for ${occasionLabel.toLowerCase()} in ${weatherLabel.toLowerCase()} weather. Pairing ${slots1[0]?.product.name} with ${slots1[1]?.product.name || "tailored foundations"} ensures continuous vertical lines and tactile harmony.`,
      styleHighlights: ["Balanced Proportions", "Monochrome Precision", "Textural Contrast"],
      products: slots1,
    });
  }

  // Look 2: Contemporary Atelier
  const slots2: OutfitSlot[] = [];
  if (blazers.length > 0 && (isOffice || isFormal || isEvening) && !isWarm) {
    const blz = pick(blazers, 1);
    if (blz) slots2.push({ slot: "Outerwear" as any, product: blz });
  } else if (outerwear.length > 0 && isCold) {
    const c = pick(outerwear, 1);
    if (c) slots2.push({ slot: "Outerwear" as any, product: c });
  }

  if (gender === "female" && dresses.length > 0 && !slots1.some((s) => s.product.category === "Dresses") && isEvening) {
    const d2 = pick(dresses, 1);
    if (d2) slots2.push({ slot: "Top", product: d2 });
  } else {
    const t2 = pick(tops, 1);
    if (t2) slots2.push({ slot: "Top", product: t2 });
    const b2 = pick(bottoms, 1);
    if (b2) slots2.push({ slot: "Bottom", product: b2 });
  }

  const s2 = pick(shoes, 1);
  if (s2) slots2.push({ slot: "Shoes", product: s2 });

  const a2 = pick(accessories, 1);
  if (a2) slots2.push({ slot: "Accessories", product: a2 });

  if (slots2.length > 0) {
    const totalVal = slots2.reduce((acc, slot) => acc + slot.product.priceValue, 0);
    const hero = slots2[0].product;
    outfits.push({
      id: `look2_${seed}`,
      title: `Contemporary ${hero.category} Tailoring`,
      occasion: occasionLabel,
      weather: weatherLabel,
      match: 96,
      total: `$${totalVal.toLocaleString("en-US")}`,
      totalValue: totalVal,
      image: hero.image,
      aiExplanation: `A balanced transition look for ${occasionLabel.toLowerCase()}. Soft shoulder construction and relaxed drape create a contemporary, unfussy elegance.`,
      styleHighlights: ["Relaxed Structure", "Fluid Movement", "Day-to-Evening Transition"],
      products: slots2,
    });
  }

  // Look 3: Essential Capsule
  const slots3: OutfitSlot[] = [];
  const t3 = pick(tops, 2) || pick(dresses, 2);
  if (t3) slots3.push({ slot: "Top", product: t3 });

  if (t3 && t3.category !== "Dresses") {
    const b3 = pick(bottoms, 2);
    if (b3) slots3.push({ slot: "Bottom", product: b3 });
  }

  const s3 = pick(shoes, 2);
  if (s3) slots3.push({ slot: "Shoes", product: s3 });

  const a3 = pick(accessories, 2) || pick(accessories, 0);
  if (a3) slots3.push({ slot: "Accessories", product: a3 });

  if (slots3.length > 0) {
    const totalVal = slots3.reduce((acc, slot) => acc + slot.product.priceValue, 0);
    const hero = slots3[0].product;
    outfits.push({
      id: `look3_${seed}`,
      title: `Minimalist ${occasionLabel} Capsule`,
      occasion: occasionLabel,
      weather: weatherLabel,
      match: 94,
      total: `$${totalVal.toLocaleString("en-US")}`,
      totalValue: totalVal,
      image: hero.image,
      aiExplanation: `A focused monochrome composition designed for understated refinement. Celebrates pure textile tactility and cut without superfluous detailing.`,
      styleHighlights: ["Permanent Archive", "Tactile Hand", "Monochrome Purity"],
      products: slots3,
    });
  }

  return outfits;
}

function ResultsPage() {
  const { addToCart } = useCartStore();
  const [brief, setBrief] = useState<Brief>(() => readBrief());
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const nextBrief = readBrief();
    setBrief(nextBrief);
  }, []);

  useEffect(() => {
    let active = true;
    const loadCurations = async () => {
      setLoadingAi(true);
      try {
        const res = await commerceApi.getStylistRecommendations({
          ...brief,
          seed: refreshSeed,
        });
        if (active && res.success && Array.isArray(res.data?.outfits) && res.data.outfits.length > 0) {
          const mapped: Outfit[] = res.data.outfits.map((o: any) => ({
            id: o.id || o._id,
            title: o.title || o.outfitName,
            occasion: o.occasion || "Formal",
            weather: o.weather || "All Season",
            match: o.match || o.aiScore || 95,
            total: o.total || `$${(o.totalValue || 0).toLocaleString("en-US")}`,
            totalValue: o.totalValue || 0,
            image: o.image || o.heroImage,
            aiExplanation: o.aiExplanation,
            styleHighlights: o.styleHighlights,
            products: o.products.map((p: any) => {
              const priceVal = typeof p.product?.price === "number" ? p.product.price : 500;
              return {
                slot: p.slot || "Top",
                product: {
                  id: p.product?._id ? p.product._id.toString() : p.product?.slug || p.product?.id || "prod_1",
                  name: p.product?.name || "Maison Piece",
                  category: p.product?.category || "Outerwear",
                  price: `$${priceVal.toLocaleString("en-US")}`,
                  priceValue: priceVal,
                  image: p.product?.images?.[0] || p.product?.thumbnail || "/assets/product-1.jpg",
                  hoverImage: p.product?.images?.[1] || p.product?.images?.[0] || "/assets/product-1.jpg",
                  gallery: p.product?.images || ["/assets/product-1.jpg"],
                  gender: p.product?.gender || "Unisex",
                  occasion: p.product?.occasion || "Formal",
                  style: p.product?.style || "Minimal",
                  season: p.product?.season || "All Season",
                  color: p.product?.colors?.[0] || "Black",
                  brand: p.product?.brand || "Maison Noir",
                  sizes: p.product?.sizes || ["S", "M", "L"],
                  sizeVariants: (p.product?.sizes || ["S", "M", "L"]).map((v: string) => ({ value: v, stock: 5 })),
                  colors: p.product?.colors || ["Black"],
                  rating: p.product?.rating || 4.8,
                  reviews: p.product?.reviewCount || 45,
                  aiMatch: 95,
                  isNew: !!p.product?.isNew,
                  inStock: true,
                  description: p.product?.description || "",
                  addedIndex: 1,
                },
              };
            }),
          }));

          setOutfits(mapped);
          setAiSource(res.data.generatedBy);
          setLoadingAi(false);
          return;
        }
      } catch (err) {
        console.warn("Stylist API call failed, using local builder:", err);
      }

      if (active) {
        setOutfits(buildOutfits(brief, refreshSeed));
        setLoadingAi(false);
      }
    };

    loadCurations();

    return () => {
      active = false;
    };
  }, [brief, refreshSeed]);

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

  const { saveOutfit, deleteOutfit, isSaved } = useSavedOutfitsStore();

  const handleSaveOutfit = (outfit: Outfit) => {
    if (isSaved(outfit.id)) {
      deleteOutfit(outfit.id);
      toast.success(`"${outfit.title}" removed from saved looks.`);
    } else {
      saveOutfit({
        name: outfit.title,
        occasion: outfit.occasion,
        weather: outfit.weather,
        style: brief.style || "Minimalist",
        aiMatch: outfit.match,
        heroImage: outfit.image,
        aiExplanation: outfit.aiExplanation,
        items: outfit.products.map((p) => p.product),
      });
      toast.success(`"${outfit.title}" saved to your private archive.`);
    }
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
              {![brief.gender, brief.occasion, brief.weather, brief.style, brief.bodyType, brief.budget].some(Boolean) && (
                <span className="label-xs border border-border px-3 py-2 text-muted-foreground">
                  Atelier Editorial Archive (Complete Edit)
                </span>
              )}
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
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="eyebrow">AI Stylist Curation</p>
                  {aiSource === "gemini-ai" ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] uppercase tracking-wider bg-foreground/10 text-foreground border border-foreground/20 font-medium">
                      <Sparkles className="h-2.5 w-2.5" /> Powered by Gemini
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] uppercase tracking-wider bg-foreground/5 text-muted-foreground border border-border">
                      Atelier Architecture
                    </span>
                  )}
                </div>
                <h2 className="display-sm">Complete outfits built from the brief.</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/stylist" className="label-xs link-underline text-muted-foreground">
                  Edit Preferences
                </Link>
                <button
                  onClick={() => setRefreshSeed((current) => current + 1)}
                  disabled={loadingAi}
                  className="label-xs flex items-center gap-2 border border-border px-4 py-3 transition-transform duration-200 ease-out hover:scale-[1.03] disabled:opacity-50"
                >
                  {loadingAi ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.2} />
                  )}
                  <span>{loadingAi ? "Curating..." : "Generate Again"}</span>
                </button>
              </div>
            </div>

            {loadingAi && (
              <div className="border border-border p-8 mb-8 text-center bg-muted/20">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium tracking-tight">Consulting Atelier AI Stylist...</p>
                <p className="text-xs text-muted-foreground mt-1">Analyzing proportions, drape, and tonal compatibility.</p>
              </div>
            )}

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
                    saved={isSaved(outfit.id)}
                  />

                  {outfit.aiExplanation && (
                    <div className="mt-5 border-l-2 border-foreground/40 pl-4 py-1.5 bg-foreground/3">
                      <p className="eyebrow mb-1 text-[10px] text-muted-foreground">Atelier Stylist Rationale</p>
                      <p className="text-xs italic leading-relaxed text-foreground/80">{outfit.aiExplanation}</p>
                    </div>
                  )}

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
                      {isSaved(outfit.id) ? "Saved in Archive" : "Save Outfit"}
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
