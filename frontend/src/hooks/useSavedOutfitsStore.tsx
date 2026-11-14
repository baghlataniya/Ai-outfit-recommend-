import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { products as catalogProducts, type Product } from "@/lib/catalog";
import { commerceApi, getAuthToken } from "@/lib/api";

export type SavedOutfit = {
  id: string;
  name: string;
  date: string;
  occasion: string;
  weather: string;
  style: string;
  aiMatch: number;
  heroImage: string;
  items: Product[];
  aiExplanation?: string;
};

const DEFAULT_SAVED_OUTFITS: SavedOutfit[] = [
  {
    id: "outfit_autumn_01",
    name: "Monochrome Winter Architecture",
    date: "Saved 2 days ago",
    occasion: "Formal Evening",
    weather: "Cold / 45°F",
    style: "Architectural Minimal",
    aiMatch: 98,
    heroImage: catalogProducts[0]?.image ?? "",
    items: [catalogProducts[0], catalogProducts[1], catalogProducts[2]].filter(Boolean) as Product[],
    aiExplanation:
      "A masterclass in textural contrast. Double-faced virgin wool layered over brushed knitwear establishes an unbroken architectural drape.",
  },
  {
    id: "outfit_casual_02",
    name: "Relaxed Cashmere & Tailoring",
    date: "Saved 1 week ago",
    occasion: "Work & Atelier Travel",
    weather: "Mild / 62°F",
    style: "Quiet Luxury",
    aiMatch: 95,
    heroImage: catalogProducts[1]?.image ?? "",
    items: [catalogProducts[1], catalogProducts[2], catalogProducts[3]].filter(Boolean) as Product[],
    aiExplanation:
      "Half-canvassed construction meets relaxed proportion. Tropical wool paired with structured footwear transitions effortlessly from day to night.",
  },
];

const OUTFITS_KEY = "maison-noir-saved-outfits";

const mapBackendProductToCatalog = (p: any): Product => {
  if (!p) return catalogProducts[0];
  const priceVal = typeof p.price === "number" ? p.price : 500;
  return {
    id: p._id ? p._id.toString() : p.slug || p.id || "prod_1",
    name: p.name || "Maison Garment",
    category: p.category || "Outerwear",
    price: `$${priceVal.toLocaleString("en-US")}`,
    priceValue: priceVal,
    image: p.images?.[0] || p.thumbnail || "/assets/product-1.jpg",
    hoverImage: p.images?.[1] || p.images?.[0] || "/assets/product-1.jpg",
    gallery: p.images || ["/assets/product-1.jpg"],
    gender: p.gender || "Unisex",
    occasion: p.occasion || "Formal",
    style: p.style || "Minimal",
    season: p.season || "All Season",
    color: p.colors?.[0] || "Black",
    brand: p.brand || "Maison Noir",
    sizes: p.sizes || ["S", "M", "L"],
    sizeVariants: (p.sizes || ["S", "M", "L"]).map((v: string) => ({ value: v, stock: 5 })),
    colors: p.colors || ["Black"],
    rating: p.rating || 4.8,
    reviews: p.reviewCount || 45,
    aiMatch: 95,
    isNew: !!p.isNew,
    inStock: true,
    description: p.description || "",
    addedIndex: 1,
  };
};

const mapBackendOutfit = (o: any): SavedOutfit => {
  const items = Array.isArray(o.items)
    ? o.items.map((i: any) => mapBackendProductToCatalog(i.product || i))
    : [];

  return {
    id: o._id || o.id,
    name: o.outfitName || o.name || "Curated Look",
    date: o.createdAt
      ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Saved recently",
    occasion: o.occasion || "Formal",
    weather: o.weather || "All Season",
    style: o.style || "Minimal",
    aiMatch: o.aiScore || o.aiMatch || 95,
    heroImage: o.heroImage || items[0]?.image || "/assets/product-1.jpg",
    items,
    aiExplanation: o.aiExplanation || "",
  };
};

interface SavedOutfitsContextType {
  savedOutfits: SavedOutfit[];
  saveOutfit: (outfit: Omit<SavedOutfit, "id" | "date">) => Promise<void>;
  deleteOutfit: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  refreshSavedOutfits: () => Promise<void>;
}

const SavedOutfitsContext = createContext<SavedOutfitsContextType | undefined>(undefined);

export function SavedOutfitsProvider({ children }: { children: React.ReactNode }) {
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>(DEFAULT_SAVED_OUTFITS);

  const loadSavedOutfits = useCallback(async () => {
    const token = getAuthToken();
    if (token) {
      try {
        const res = await commerceApi.getSavedOutfits();
        if (res.success && Array.isArray(res.data?.outfits) && res.data.outfits.length > 0) {
          const mapped = res.data.outfits.map(mapBackendOutfit);
          setSavedOutfits(mapped);
          return;
        }
      } catch (err) {
        console.warn("Failed to load saved outfits from backend, using local store:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(OUTFITS_KEY);
        if (raw) {
          setSavedOutfits(JSON.parse(raw));
        }
      } catch (e) {
        console.error("Error loading saved outfits store:", e);
      }
    }
  }, []);

  useEffect(() => {
    loadSavedOutfits();
  }, [loadSavedOutfits]);

  const saveOutfitsLocalState = (list: SavedOutfit[]) => {
    setSavedOutfits(list);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(OUTFITS_KEY, JSON.stringify(list));
    }
  };

  const saveOutfit = async (outfitData: Omit<SavedOutfit, "id" | "date">) => {
    const token = getAuthToken();

    if (token) {
      try {
        const payload = {
          outfitName: outfitData.name,
          occasion: outfitData.occasion,
          weather: outfitData.weather,
          style: outfitData.style,
          aiScore: outfitData.aiMatch,
          aiExplanation: outfitData.aiExplanation || "Curated luxury monochrome outfit.",
          heroImage: outfitData.heroImage,
          totalPrice: outfitData.items.reduce((sum, item) => sum + (item.priceValue || 0), 0),
          items: outfitData.items.map((item) => ({
            slot: item.category || "Top",
            productId: item.id,
          })),
        };

        const res = await commerceApi.saveOutfit(payload);
        if (res.success && res.data?.outfit) {
          const savedMapped = mapBackendOutfit(res.data.outfit);
          setSavedOutfits((prev) => [savedMapped, ...prev.filter((o) => o.id !== savedMapped.id)]);
          return;
        }
      } catch (err) {
        console.error("Error saving outfit to backend:", err);
      }
    }

    // Guest fallback
    const id = `outfit_${Date.now().toString(36)}`;
    const newOutfit: SavedOutfit = {
      ...outfitData,
      id,
      date: "Saved today",
    };
    const next = [newOutfit, ...savedOutfits];
    saveOutfitsLocalState(next);
  };

  const deleteOutfit = async (id: string) => {
    const token = getAuthToken();
    if (token && id.length === 24) {
      try {
        await commerceApi.deleteSavedOutfit(id);
      } catch (err) {
        console.error("Error deleting outfit from backend:", err);
      }
    }

    const next = savedOutfits.filter((o) => o.id !== id);
    saveOutfitsLocalState(next);
  };

  const isSaved = (id: string) => {
    return savedOutfits.some((o) => o.id === id);
  };

  const value = useMemo(
    () => ({
      savedOutfits,
      saveOutfit,
      deleteOutfit,
      isSaved,
      refreshSavedOutfits: loadSavedOutfits,
    }),
    [savedOutfits, loadSavedOutfits]
  );

  return <SavedOutfitsContext.Provider value={value}>{children}</SavedOutfitsContext.Provider>;
}

export function useSavedOutfitsStore() {
  const context = useContext(SavedOutfitsContext);
  if (context === undefined) {
    throw new Error("useSavedOutfitsStore must be used within a SavedOutfitsProvider");
  }
  return context;
}
