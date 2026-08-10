import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { products, type Product } from "@/lib/catalog";

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
    heroImage: products[0]?.image ?? "",
    items: [products[0], products[1], products[2]].filter(Boolean) as Product[],
  },
  {
    id: "outfit_casual_02",
    name: "Relaxed Cashmere & Tailoring",
    date: "Saved 1 week ago",
    occasion: "Work & Atelier Travel",
    weather: "Mild / 62°F",
    style: "Quiet Luxury",
    aiMatch: 95,
    heroImage: products[1]?.image ?? "",
    items: [products[1], products[2], products[3]].filter(Boolean) as Product[],
  },
];

const OUTFITS_KEY = "maison-noir-saved-outfits";

interface SavedOutfitsContextType {
  savedOutfits: SavedOutfit[];
  saveOutfit: (outfit: Omit<SavedOutfit, "id" | "date">) => void;
  deleteOutfit: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedOutfitsContext = createContext<SavedOutfitsContextType | undefined>(undefined);

export function SavedOutfitsProvider({ children }: { children: React.ReactNode }) {
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>(DEFAULT_SAVED_OUTFITS);

  useEffect(() => {
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

  const saveOutfitsState = (list: SavedOutfit[]) => {
    setSavedOutfits(list);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(OUTFITS_KEY, JSON.stringify(list));
    }
  };

  const saveOutfit = (outfitData: Omit<SavedOutfit, "id" | "date">) => {
    const id = `outfit_${Date.now().toString(36)}`;
    const newOutfit: SavedOutfit = {
      ...outfitData,
      id,
      date: "Saved today",
    };
    const next = [newOutfit, ...savedOutfits];
    saveOutfitsState(next);
  };

  const deleteOutfit = (id: string) => {
    const next = savedOutfits.filter((o) => o.id !== id);
    saveOutfitsState(next);
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
    }),
    [savedOutfits]
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
