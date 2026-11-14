import { GoogleGenAI } from "@google/genai";
import { Product, IProduct } from "../models/Product";

export interface StylistBrief {
  gender?: string | null;
  occasion?: string | null;
  weather?: string | null;
  style?: string | null;
  colors?: string[];
  budget?: number;
  brands?: string[];
  bodyType?: string | null;
  notes?: string;
  seed?: number;
}

export interface RecommendedSlot {
  slot: "Top" | "Bottom" | "Shoes" | "Accessories" | "Outerwear" | "Bag";
  product: IProduct;
}

export interface CuratedOutfit {
  id: string;
  title: string;
  occasion: string;
  weather: string;
  style: string;
  match: number;
  total: string;
  totalValue: number;
  image: string;
  aiExplanation: string;
  styleHighlights: string[];
  products: RecommendedSlot[];
}

export interface StylistResponse {
  brief: StylistBrief;
  outfits: CuratedOutfit[];
  generatedBy: "gemini-ai" | "curator-engine";
}

export async function generateOutfits(brief: StylistBrief): Promise<StylistResponse> {
  const allProducts = await Product.find({ isActive: { $ne: false } }).lean();

  if (allProducts.length === 0) {
    return {
      brief,
      outfits: [],
      generatedBy: "curator-engine",
    };
  }

  // 1. Attempt Gemini AI if API key is provided
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const geminiResult = await generateWithGemini(brief, allProducts as unknown as IProduct[], apiKey);
      if (geminiResult && geminiResult.length > 0) {
        return {
          brief,
          outfits: geminiResult,
          generatedBy: "gemini-ai",
        };
      }
    } catch (err) {
      console.warn("[Stylist Service] Gemini generation failed, falling back to curator engine:", (err as Error).message);
    }
  }

  // 2. Dynamic, Brief-Responsive Algorithmic Engine
  const algorithmicOutfits = generateDynamicHeuristicOutfits(brief, allProducts as unknown as IProduct[]);
  return {
    brief,
    outfits: algorithmicOutfits,
    generatedBy: "curator-engine",
  };
}

async function generateWithGemini(
  brief: StylistBrief,
  catalog: IProduct[],
  apiKey: string
): Promise<CuratedOutfit[] | null> {
  const ai = new GoogleGenAI({ apiKey });

  const catalogSummary = catalog.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    gender: p.gender,
    occasion: p.occasion,
    style: p.style,
    colors: p.colors || [],
    material: p.material,
    image: p.images?.[0] || p.thumbnail || "/assets/product-1.jpg",
  }));

  const seed = brief.seed || Math.floor(Math.random() * 1000);

  const prompt = `
You are the Executive Creative Director and AI Stylist for MAISON NOIR, an elite luxury monochrome fashion atelier.

CLIENT BRIEF:
- Gender Preference: ${brief.gender || "Any"}
- Occasion: ${brief.occasion || "Formal / Evening"}
- Weather: ${brief.weather || "Mild / All Season"}
- Style Preference: ${brief.style || "Minimal"}
- Preferred Colors: ${brief.colors?.join(", ") || "Black, Charcoal, Soft White"}
- Budget Target: ${brief.budget ? `$${brief.budget}` : "Flexible"}
- Client Body Type: ${brief.bodyType || "Regular"}
- Curator Seed / Variation: ${seed} (Ensure fresh, varied garment pairings distinct from standard defaults)

AVAILABLE PRODUCT CATALOG:
${JSON.stringify(catalogSummary, null, 2)}

TASK:
Curate 3 distinct, exceptionally sophisticated outfits tailored strictly to the client's occasion (${brief.occasion || "all occasions"}) and weather (${brief.weather || "current season"}).
- Look 1: Statement Silhouette (hero outerwear or tailored statement piece)
- Look 2: Contemporary Atelier (tonal elegance, daytime to evening)
- Look 3: Essential Capsule (relaxed luxury or refined minimalism)

Each outfit MUST contain 3 to 4 complementary pieces (e.g. Outerwear, Top, Bottom, Shoes, or Accessories).
Ensure product IDs match the catalog IDs.

Return ONLY a JSON array in the following exact format:
[
  {
    "title": "Evocative Luxury Title",
    "occasion": "${brief.occasion || "Formal Evening"}",
    "weather": "${brief.weather || "All Season"}",
    "style": "${brief.style || "Minimal"}",
    "match": 98,
    "aiExplanation": "2-3 sentences explaining the fabric textures, cut, drape, and why this look precisely suits the client's occasion and weather.",
    "styleHighlights": ["Key fabric highlight", "Silhouette highlight", "Tonal note"],
    "slots": [
      { "slot": "Outerwear", "productId": "exact_catalog_id" },
      { "slot": "Top", "productId": "exact_catalog_id" },
      { "slot": "Bottom", "productId": "exact_catalog_id" },
      { "slot": "Shoes", "productId": "exact_catalog_id" }
    ]
  }
]
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const rawText = response.text;
  if (!rawText) return null;

  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  const productMap = new Map<string, IProduct>();
  catalog.forEach((p) => {
    productMap.set(p._id.toString(), p);
    if (p.slug) productMap.set(p.slug, p);
  });

  const outfits: CuratedOutfit[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    const slots: RecommendedSlot[] = [];
    let totalVal = 0;

    if (Array.isArray(item.slots)) {
      for (const s of item.slots) {
        const prod = productMap.get(s.productId);
        if (prod) {
          slots.push({
            slot: s.slot || "Top",
            product: prod,
          });
          totalVal += prod.price || 0;
        }
      }
    }

    if (slots.length > 0) {
      const heroImage =
        slots.find((s) => s.slot === "Outerwear")?.product.images?.[0] ||
        slots[0].product.images?.[0] ||
        slots[0].product.thumbnail ||
        "/assets/product-1.jpg";

      outfits.push({
        id: `gemini_outfit_${i + 1}_${Date.now()}`,
        title: item.title || `Curated Look ${i + 1}`,
        occasion: item.occasion || brief.occasion || "Formal",
        weather: item.weather || brief.weather || "All Season",
        style: item.style || brief.style || "Minimal",
        match: typeof item.match === "number" ? item.match : 95 + (i === 0 ? 3 : i === 1 ? 2 : 0),
        total: `$${totalVal.toLocaleString("en-US")}`,
        totalValue: totalVal,
        image: heroImage,
        aiExplanation: item.aiExplanation || "An architectural monochrome look balanced for tone and silhouette.",
        styleHighlights: Array.isArray(item.styleHighlights) ? item.styleHighlights : ["Monochrome Harmony", "Atelier Cut"],
        products: slots,
      });
    }
  }

  return outfits.length > 0 ? outfits : null;
}

/**
 * Intelligent, brief-aware scoring engine that personalizes garment selection
 * according to gender, occasion, weather, style, and colors with dynamic rotation.
 */
function scoreProductForBrief(product: IProduct, brief: StylistBrief, seed: number): number {
  let score = 50;

  // 1. Gender Filter & Affinity
  const gender = (brief.gender || "").toLowerCase();
  const pGender = (product.gender || "").toLowerCase();
  if (gender === "male" || gender === "men") {
    if (pGender === "women") return -1000;
    if (pGender === "men") score += 35;
    if (pGender === "unisex") score += 20;
  } else if (gender === "female" || gender === "women") {
    if (pGender === "men") return -1000;
    if (pGender === "women") score += 35;
    if (pGender === "unisex") score += 20;
  }

  const pCat = (product.category || "").toLowerCase();
  const pSub = (product.subcategory || "").toLowerCase();
  const pOccasion = (product.occasion || "").toLowerCase();
  const pMat = (product.material || "").toLowerCase();
  const pStyle = (product.style || "").toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase());

  // 2. Occasion Matching
  const occasion = (brief.occasion || "").toLowerCase();
  if (occasion.includes("wedding") || occasion.includes("formal") || occasion.includes("black tie")) {
    if (pOccasion === "formal" || pCat === "dresses" || pSub === "gowns" || pSub === "blazers" || pSub === "derbies" || pSub === "coats") score += 45;
    if (pSub === "sneakers" || pCat === "denim") score -= 35;
  } else if (occasion.includes("party") || occasion.includes("date") || occasion.includes("evening")) {
    if (pOccasion === "evening" || pSub === "slip dresses" || pSub === "boots" || pSub === "trenches" || pCat === "dresses") score += 40;
    if (pSub === "jeans" && pCat === "denim") score += 10;
  } else if (occasion.includes("office") || occasion.includes("business") || occasion.includes("work")) {
    if (pCat === "tailoring" || pCat === "shirting" || pSub === "trousers" || pSub === "blazers" || pSub === "derbies" || pSub === "totes") score += 45;
    if (pSub === "gowns") score -= 40;
  } else if (occasion.includes("casual") || occasion.includes("vacation") || occasion.includes("lounge") || occasion.includes("gym") || occasion.includes("festival")) {
    if (pCat === "denim" || pCat === "knitwear" || pSub === "sneakers" || pSub === "overshirts" || pSub === "skirts") score += 45;
    if (pSub === "gowns" || pSub === "derbies") score -= 35;
  }

  // 3. Weather Matching
  const weather = (brief.weather || "").toLowerCase();
  if (weather.includes("cold") || weather.includes("snow") || weather.includes("wind")) {
    if (pMat.includes("wool") || pMat.includes("cashmere") || pCat === "outerwear" || pSub === "boots" || pSub === "scarves") score += 40;
    if (pMat.includes("linen") || pMat.includes("silk") || pSub === "sneakers") score -= 25;
  } else if (weather.includes("sunny") || weather.includes("warm")) {
    if (pMat.includes("linen") || pMat.includes("silk") || pCat === "shirting" || pSub === "sneakers" || pSub === "skirts") score += 45;
    if (pMat.includes("virgin wool") || pSub === "boots" || pSub === "scarves") score -= 30;
  } else if (weather.includes("rain")) {
    if (pSub.includes("trench") || pSub.includes("boots") || pMat.includes("gabardine")) score += 45;
  }

  // 4. Style Matching
  const style = (brief.style || "").toLowerCase();
  if (pStyle && style.includes(pStyle)) score += 30;
  if (style.includes("old money") || style.includes("luxury") || style.includes("elegant")) {
    if (pMat.includes("cashmere") || pMat.includes("virgin wool") || pCat === "tailoring" || pSub === "gowns") score += 35;
  } else if (style.includes("streetwear") || style.includes("oversized") || style.includes("sporty")) {
    if (pCat === "denim" || pSub === "sneakers" || pSub === "overshirts" || pSub === "trenches") score += 35;
  } else if (style.includes("minimal") || style.includes("modern")) {
    if (tags.includes("minimal") || pStyle === "minimal") score += 30;
  }

  // 5. Preferred Colors
  if (Array.isArray(brief.colors) && brief.colors.length > 0) {
    const briefColors = brief.colors.map((c) => c.toLowerCase());
    const matchesColor = (product.colors || []).some((c) => briefColors.includes(c.toLowerCase()));
    if (matchesColor) score += 25;
  }

  // 6. Dynamic seed jitter to rotate looks when user clicks "Generate Again"
  const charSum = (product._id.toString() + String(seed)).split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const jitter = (charSum % 21) - 10; // -10 to +10 pts variation
  score += jitter;

  return score;
}

function generateDynamicHeuristicOutfits(brief: StylistBrief, catalog: IProduct[]): CuratedOutfit[] {
  const seed = typeof brief.seed === "number" ? brief.seed : 0;

  // Score all products
  const scored = catalog
    .map((p) => ({ product: p, score: scoreProductForBrief(p, brief, seed) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const pool = scored.length >= 6 ? scored.map((s) => s.product) : catalog;

  // Separate pools by clothing slot
  const outerwearPool = pool.filter((p) => p.category === "Outerwear");
  const topsPool = pool.filter((p) => ["Knitwear", "Shirting"].includes(p.category));
  const dressesPool = pool.filter((p) => p.category === "Dresses");
  const bottomsPool = pool.filter((p) => ["Tailoring", "Denim"].includes(p.category) && p.subcategory !== "Blazers");
  const blazersPool = pool.filter((p) => p.category === "Tailoring" && p.subcategory === "Blazers");
  const shoesPool = pool.filter((p) => p.category === "Shoes");
  const accessoriesPool = pool.filter((p) => p.category === "Accessories");

  const outfits: CuratedOutfit[] = [];
  const usedProductIds = new Set<string>();

  const pickItem = (candidates: IProduct[], offset: number): IProduct | null => {
    if (!candidates || candidates.length === 0) return null;
    // Prefer unused items first, rotated by seed & offset
    const unused = candidates.filter((p) => !usedProductIds.has(p._id.toString()));
    const targetPool = unused.length > 0 ? unused : candidates;
    const selected = targetPool[(seed + offset) % targetPool.length];
    usedProductIds.add(selected._id.toString());
    return selected;
  };

  const occasionLabel = brief.occasion || "Formal Evening";
  const weatherLabel = brief.weather || "All Season";
  const styleLabel = brief.style || "Minimalist";
  const genderPref = (brief.gender || "").toLowerCase();

  // Archetype 1: Signature Anchor Silhouette
  const slots1: RecommendedSlot[] = [];
  const coat1 = pickItem(outerwearPool, 0);
  if (coat1) slots1.push({ slot: "Outerwear", product: coat1 });

  // Top or Dress
  if (genderPref === "female" && dressesPool.length > 0 && occasionLabel.toLowerCase().includes("formal")) {
    const dress = pickItem(dressesPool, 0);
    if (dress) slots1.push({ slot: "Top", product: dress });
  } else {
    const top1 = pickItem(topsPool, 0);
    if (top1) slots1.push({ slot: "Top", product: top1 });
    const bot1 = pickItem(bottomsPool, 0);
    if (bot1) slots1.push({ slot: "Bottom", product: bot1 });
  }

  const shoe1 = pickItem(shoesPool, 0);
  if (shoe1) slots1.push({ slot: "Shoes", product: shoe1 });

  const acc1 = pickItem(accessoriesPool, 0);
  if (acc1) slots1.push({ slot: "Accessories", product: acc1 });

  if (slots1.length > 0) {
    const totalVal = slots1.reduce((acc, s) => acc + (s.product.price || 0), 0);
    const heroImg = slots1.find((s) => s.slot === "Outerwear")?.product.images?.[0] || slots1[0].product.images?.[0] || "/assets/product-1.jpg";
    const heroMaterial = slots1[0]?.product.material || "Virgin Wool";
    const title = `${heroMaterial.split(" ")[0]} Architectural Drape`;
    const rationale = `Engineered for ${occasionLabel.toLowerCase()} in ${weatherLabel.toLowerCase()} weather. Pairing ${slots1[0]?.product.name} with ${slots1[1]?.product.name || "tailored foundations"} creates continuous vertical proportion and rich textural contrast.`;

    outfits.push({
      id: `curator_outfit_look1_seed_${seed}`,
      title,
      occasion: occasionLabel,
      weather: weatherLabel,
      style: `${styleLabel} Editorial`,
      match: 99,
      total: `$${totalVal.toLocaleString("en-US")}`,
      totalValue: totalVal,
      image: heroImg,
      aiExplanation: rationale,
      styleHighlights: [`Structured ${heroMaterial}`, "Disciplined Tonal Balance", "Elongated Proportion"],
      products: slots1,
    });
  }

  // Archetype 2: Contemporary Atelier Tailoring
  const slots2: RecommendedSlot[] = [];
  const blazer2 = pickItem(blazersPool.length > 0 ? blazersPool : outerwearPool, 1);
  if (blazer2) slots2.push({ slot: "Outerwear", product: blazer2 });

  const top2 = pickItem(topsPool, 1);
  if (top2) slots2.push({ slot: "Top", product: top2 });

  const bot2 = pickItem(bottomsPool, 1);
  if (bot2) slots2.push({ slot: "Bottom", product: bot2 });

  const shoe2 = pickItem(shoesPool, 1);
  if (shoe2) slots2.push({ slot: "Shoes", product: shoe2 });

  if (slots2.length > 0) {
    const totalVal = slots2.reduce((acc, s) => acc + (s.product.price || 0), 0);
    const heroImg = slots2[0]?.product.images?.[0] || "/assets/product-2.jpg";
    const topProd = slots2.find((s) => s.slot === "Top")?.product;
    const botProd = slots2.find((s) => s.slot === "Bottom")?.product;
    const title = `Contemporary ${topProd?.category || "Atelier"} Tailoring`;
    const rationale = `Balanced for ${occasionLabel.toLowerCase()}. The relaxed structure of ${botProd?.name || "tailored trousers"} harmonizes with the soft hand of ${topProd?.name || "cashmere knitwear"} for effortless refinement.`;

    outfits.push({
      id: `curator_outfit_look2_seed_${seed}`,
      title,
      occasion: occasionLabel,
      weather: weatherLabel,
      style: "Quiet Luxury",
      match: 96,
      total: `$${totalVal.toLocaleString("en-US")}`,
      totalValue: totalVal,
      image: heroImg,
      aiExplanation: rationale,
      styleHighlights: ["Half-Canvassed Silhouette", "Breathable Soft Weave", "Day-to-Evening Transition"],
      products: slots2,
    });
  }

  // Archetype 3: Essential Capsule Monolith
  const slots3: RecommendedSlot[] = [];
  const top3 = pickItem(topsPool, 2) || pickItem(dressesPool, 1);
  if (top3) slots3.push({ slot: "Top", product: top3 });

  const bot3 = pickItem(bottomsPool, 2);
  if (bot3 && top3?.category !== "Dresses") slots3.push({ slot: "Bottom", product: bot3 });

  const shoe3 = pickItem(shoesPool, 2);
  if (shoe3) slots3.push({ slot: "Shoes", product: shoe3 });

  const acc3 = pickItem(accessoriesPool, 1);
  if (acc3) slots3.push({ slot: "Accessories", product: acc3 });

  if (slots3.length > 0) {
    const totalVal = slots3.reduce((acc, s) => acc + (s.product.price || 0), 0);
    const heroImg = slots3[0]?.product.images?.[0] || "/assets/product-3.jpg";
    const title = `Minimalist ${occasionLabel} Capsule`;
    const rationale = `A focused monochrome look designed for ease and movement. Stripped of extraneous ornamentation to celebrate pure cut and high-grade textile durability in ${weatherLabel.toLowerCase()} conditions.`;

    outfits.push({
      id: `curator_outfit_look3_seed_${seed}`,
      title,
      occasion: occasionLabel,
      weather: weatherLabel,
      style: "Monochrome Minimal",
      match: 94,
      total: `$${totalVal.toLocaleString("en-US")}`,
      totalValue: totalVal,
      image: heroImg,
      aiExplanation: rationale,
      styleHighlights: ["Tactile Texture", "Monochrome Depth", "Permanent Archive Line"],
      products: slots3,
    });
  }

  return outfits;
}
