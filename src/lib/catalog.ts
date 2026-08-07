import product1 from "@/assets/product-1.jpg";
import product1b from "@/assets/product-1b.jpg";
import product2 from "@/assets/product-2.jpg";
import product2b from "@/assets/product-2b.jpg";
import product3 from "@/assets/product-3.jpg";
import product3b from "@/assets/product-3b.jpg";
import product4 from "@/assets/product-4.jpg";
import product4b from "@/assets/product-4b.jpg";
import editorial1 from "@/assets/editorial-1.jpg";
import editorial2 from "@/assets/editorial-2.jpg";
import editorial3 from "@/assets/editorial-3.jpg";
import editorial4 from "@/assets/editorial-4.jpg";
import catOuterwear from "@/assets/cat-outerwear.jpg";
import catKnitwear from "@/assets/cat-knitwear.jpg";
import catTailoring from "@/assets/cat-tailoring.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

export type SizeVariant = { value: string; stock: number };

export type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  priceValue: number;
  image: string;
  hoverImage: string;
  gallery: string[];
  tag?: string;
  gender: "Women" | "Men" | "Unisex";
  occasion: string;
  style: string;
  season: string;
  color: string;
  brand: string;
  sizes: string[]; // derived from sizeVariants for backward-compat
  sizeVariants: SizeVariant[];
  colors: string[];
  rating: number;
  reviews: number;
  aiMatch: number;
  isNew: boolean;
  inStock: boolean;
  bestSeller?: boolean;
  description: string;
  addedIndex: number;
};

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

type Seed = Omit<Product, "price" | "gallery" | "addedIndex" | "sizes"> & {
  gallery?: string[];
  sizes: string[];
  sizeVariants?: SizeVariant[];
};

const SEEDS: Seed[] = [
  {
    id: "atelier-coat",
    name: "Atelier Belted Coat",
    category: "Outerwear",
    priceValue: 1290,
    image: product1,
    hoverImage: product1b,
    tag: "New",
    gender: "Women",
    occasion: "Formal",
    style: "Minimal",
    season: "Winter",
    color: "Black",
    brand: "Maison Noir",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Charcoal", "Soft White"],
    rating: 4.9,
    reviews: 128,
    aiMatch: 96,
    isNew: true,
    inStock: true,
    description:
      "Double-faced virgin wool, cut long and belted at the waist. An unbroken line from shoulder to hem.",
  },
  {
    id: "cloud-knit",
    name: "Cloud Cashmere Knit",
    category: "Knitwear",
    priceValue: 480,
    image: product2,
    hoverImage: product2b,
    gender: "Women",
    occasion: "Casual",
    style: "Relaxed",
    season: "Autumn",
    color: "Soft White",
    brand: "Atelier 07",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Soft White", "Light Gray"],
    rating: 4.7,
    reviews: 214,
    aiMatch: 91,
    isNew: false,
    inStock: true,
    bestSeller: true,
    description: "Grade-A Mongolian cashmere, brushed twice for a weightless hand.",
  },
  {
    id: "column-trouser",
    name: "Column Wool Trouser",
    category: "Tailoring",
    priceValue: 390,
    image: product3,
    hoverImage: product3b,
    gender: "Men",
    occasion: "Work",
    style: "Tailored",
    season: "All Season",
    color: "Charcoal",
    brand: "Maison Noir",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Charcoal", "Black"],
    rating: 4.8,
    reviews: 96,
    aiMatch: 88,
    isNew: false,
    inStock: true,
    bestSeller: true,
    description: "A straight column leg in tropical wool, pressed to a permanent crease.",
  },
  {
    id: "monolith-trench",
    name: "Monolith Trench",
    category: "Outerwear",
    priceValue: 1540,
    image: product4,
    hoverImage: product4b,
    tag: "Limited",
    gender: "Unisex",
    occasion: "Evening",
    style: "Structured",
    season: "Autumn",
    color: "Black",
    brand: "Noir Studio",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
    rating: 5,
    reviews: 42,
    aiMatch: 94,
    isNew: true,
    inStock: true,
    description: "Bonded cotton gabardine with sealed seams and a concealed placket.",
  },
  {
    id: "ridge-overshirt",
    name: "Ridge Wool Overshirt",
    category: "Outerwear",
    priceValue: 620,
    image: editorial1,
    hoverImage: product1,
    gender: "Men",
    occasion: "Casual",
    style: "Relaxed",
    season: "Autumn",
    color: "Charcoal",
    brand: "Atelier 07",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal", "Black"],
    rating: 4.6,
    reviews: 74,
    aiMatch: 84,
    isNew: false,
    inStock: true,
    description: "A shirt with the weight of a jacket. Milled wool, patch pockets, no lining.",
  },
  {
    id: "vellum-shirt",
    name: "Vellum Poplin Shirt",
    category: "Shirting",
    priceValue: 260,
    image: editorial2,
    hoverImage: product2,
    gender: "Women",
    occasion: "Work",
    style: "Minimal",
    season: "Summer",
    color: "Soft White",
    brand: "Objet Blanc",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Soft White"],
    rating: 4.5,
    reviews: 188,
    aiMatch: 79,
    isNew: false,
    inStock: true,
    description: "Compact poplin with a stand collar and mother-of-pearl closures.",
  },
  {
    id: "obsidian-boot",
    name: "Obsidian Leather Boot",
    category: "Shoes",
    priceValue: 890,
    image: editorial3,
    hoverImage: product4,
    tag: "New",
    gender: "Unisex",
    occasion: "Evening",
    style: "Structured",
    season: "Winter",
    color: "Black",
    brand: "Noir Studio",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Black"],
    rating: 4.8,
    reviews: 61,
    aiMatch: 92,
    isNew: true,
    inStock: true,
    description: "Vegetable-tanned calf on a blake-stitched sole, unlined at the shaft.",
  },
  {
    id: "shadow-derby",
    name: "Shadow Derby",
    category: "Shoes",
    priceValue: 740,
    image: editorial4,
    hoverImage: product3,
    gender: "Men",
    occasion: "Formal",
    style: "Tailored",
    season: "All Season",
    color: "Black",
    brand: "Maison Noir",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["Black", "Charcoal"],
    rating: 4.4,
    reviews: 53,
    aiMatch: 76,
    isNew: false,
    inStock: false,
    description: "A low derby with a squared toe box and a hand-burnished finish.",
  },
  {
    id: "plane-blazer",
    name: "Plane Single Blazer",
    category: "Tailoring",
    priceValue: 980,
    image: catTailoring,
    hoverImage: product1b,
    gender: "Women",
    occasion: "Work",
    style: "Tailored",
    season: "All Season",
    color: "Charcoal",
    brand: "Maison Noir",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Charcoal", "Black"],
    rating: 4.9,
    reviews: 87,
    aiMatch: 93,
    isNew: false,
    inStock: true,
    bestSeller: true,
    description: "Half-canvassed, single button, softened shoulder. Cut to sit away from the body.",
  },
  {
    id: "quarry-knit",
    name: "Quarry Ribbed Knit",
    category: "Knitwear",
    priceValue: 420,
    image: catKnitwear,
    hoverImage: product2b,
    gender: "Men",
    occasion: "Casual",
    style: "Relaxed",
    season: "Winter",
    color: "Light Gray",
    brand: "Atelier 07",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Light Gray", "Charcoal"],
    rating: 4.6,
    reviews: 143,
    aiMatch: 81,
    isNew: false,
    inStock: true,
    description: "A heavy 7-gauge rib in undyed lambswool.",
  },
  {
    id: "slate-parka",
    name: "Slate Technical Parka",
    category: "Outerwear",
    priceValue: 1180,
    image: catOuterwear,
    hoverImage: editorial3,
    gender: "Unisex",
    occasion: "Travel",
    style: "Structured",
    season: "Winter",
    color: "Black",
    brand: "Noir Studio",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Charcoal"],
    rating: 4.7,
    reviews: 39,
    aiMatch: 87,
    isNew: true,
    inStock: true,
    description: "Three-layer membrane shell with taped seams and a storm hood.",
  },
  {
    id: "ash-scarf",
    name: "Ash Cashmere Scarf",
    category: "Accessories",
    priceValue: 220,
    image: catAccessories,
    hoverImage: gallery2,
    gender: "Unisex",
    occasion: "Casual",
    style: "Minimal",
    season: "Winter",
    color: "Light Gray",
    brand: "Objet Blanc",
    sizes: ["One Size"],
    colors: ["Light Gray", "Black"],
    rating: 4.3,
    reviews: 231,
    aiMatch: 72,
    isNew: false,
    inStock: true,
    bestSeller: true,
    description: "Two metres of double-faced cashmere with hand-rolled ends.",
  },
  {
    id: "null-tote",
    name: "Null Leather Tote",
    category: "Accessories",
    priceValue: 690,
    image: gallery1,
    hoverImage: gallery4,
    gender: "Women",
    occasion: "Work",
    style: "Minimal",
    season: "All Season",
    color: "Black",
    brand: "Maison Noir",
    sizes: ["One Size"],
    colors: ["Black"],
    rating: 4.8,
    reviews: 66,
    aiMatch: 89,
    isNew: false,
    inStock: true,
    description: "One panel of grained calf, folded and stitched once.",
  },
  {
    id: "meridian-dress",
    name: "Meridian Slip Dress",
    category: "Dresses",
    priceValue: 560,
    image: gallery2,
    hoverImage: gallery5,
    tag: "New",
    gender: "Women",
    occasion: "Evening",
    style: "Fluid",
    season: "Summer",
    color: "Black",
    brand: "Objet Blanc",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Soft White"],
    rating: 4.7,
    reviews: 58,
    aiMatch: 90,
    isNew: true,
    inStock: true,
    description: "Bias-cut silk with a bound neckline and adjustable straps.",
  },
  {
    id: "gravel-denim",
    name: "Gravel Rigid Denim",
    category: "Denim",
    priceValue: 340,
    image: gallery3,
    hoverImage: gallery6,
    gender: "Men",
    occasion: "Casual",
    style: "Relaxed",
    season: "All Season",
    color: "Charcoal",
    brand: "Atelier 07",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Charcoal", "Black"],
    rating: 4.4,
    reviews: 112,
    aiMatch: 74,
    isNew: false,
    inStock: true,
    description: "14oz rigid selvedge, overdyed once and washed never.",
  },
  {
    id: "linen-column",
    name: "Linen Column Skirt",
    category: "Tailoring",
    priceValue: 310,
    image: gallery4,
    hoverImage: gallery1,
    gender: "Women",
    occasion: "Work",
    style: "Minimal",
    season: "Summer",
    color: "Soft White",
    brand: "Objet Blanc",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Soft White", "Light Gray"],
    rating: 4.2,
    reviews: 47,
    aiMatch: 70,
    isNew: false,
    inStock: false,
    description: "Heavy Belgian linen, unlined, with a hidden side zip.",
  },
  {
    id: "monogram-belt",
    name: "Monogram Leather Belt",
    category: "Accessories",
    priceValue: 180,
    image: gallery5,
    hoverImage: gallery3,
    gender: "Unisex",
    occasion: "Formal",
    style: "Minimal",
    season: "All Season",
    color: "Black",
    brand: "Maison Noir",
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    rating: 4.1,
    reviews: 305,
    aiMatch: 68,
    isNew: false,
    inStock: true,
    description: "A 25mm strap with a matte brushed buckle.",
  },
  {
    id: "eclipse-sneaker",
    name: "Eclipse Low Sneaker",
    category: "Shoes",
    priceValue: 450,
    image: gallery6,
    hoverImage: editorial4,
    gender: "Unisex",
    occasion: "Casual",
    style: "Relaxed",
    season: "Spring",
    color: "Soft White",
    brand: "Noir Studio",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Soft White", "Black"],
    rating: 4.6,
    reviews: 174,
    aiMatch: 83,
    isNew: true,
    inStock: true,
    bestSeller: true,
    description: "Full-grain leather upper on a vulcanised rubber cup sole.",
  },
];

// Realistic stock pattern per size index (wraps around if more than 8 sizes)
const STOCK_PATTERN = [8, 12, 6, 4, 2, 10, 3, 7];

export const products: Product[] = SEEDS.map((s, i) => {
  const sizeVariants: SizeVariant[] =
    s.sizeVariants ??
    s.sizes.map((value, idx) => ({ value, stock: STOCK_PATTERN[idx % STOCK_PATTERN.length] }));
  return {
    ...s,
    price: money(s.priceValue),
    gallery: s.gallery ?? [s.image, s.hoverImage, editorial2, editorial3],
    addedIndex: SEEDS.length - i,
    sizeVariants,
    sizes: sizeVariants.map((sv) => sv.value),
  };
});

export const getProduct = (idOrSlug?: string): Product | undefined => {
  if (!idOrSlug) return undefined;
  try {
    const raw = decodeURIComponent(idOrSlug).trim();
    const lower = raw.toLowerCase();
    const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const targetSlug = slugify(raw);

    return products.find((p) => {
      if (!p || !p.id) return false;
      if (p.id === raw || p.id.toLowerCase() === lower) return true;
      if (slugify(p.id) === targetSlug) return true;
      if (p.name && slugify(p.name) === targetSlug) return true;
      if (p.name && p.name.toLowerCase() === lower) return true;
      return false;
    });
  } catch (e) {
    return undefined;
  }
};

export const featured: Product[] = products.slice(0, 4);
export const bestSellers: Product[] = products.filter((p) => p.bestSeller).slice(0, 4);

/* ----------------------------- Filter metadata ---------------------------- */

const uniq = (values: string[]) => Array.from(new Set(values));

export const FILTER_GROUPS = [
  { key: "category" as const, label: "Category", options: uniq(products.map((p) => p.category)) },
  { key: "gender" as const, label: "Gender", options: uniq(products.map((p) => p.gender)) },
  { key: "occasion" as const, label: "Occasion", options: uniq(products.map((p) => p.occasion)) },
  { key: "style" as const, label: "Style", options: uniq(products.map((p) => p.style)) },
  { key: "season" as const, label: "Season", options: uniq(products.map((p) => p.season)) },
  { key: "color" as const, label: "Colour", options: uniq(products.map((p) => p.color)) },
  { key: "brand" as const, label: "Brand", options: uniq(products.map((p) => p.brand)) },
  { key: "size" as const, label: "Size", options: uniq(products.flatMap((p) => p.sizes)) },
];

export type FilterKey = (typeof FILTER_GROUPS)[number]["key"];

export type Filters = Record<FilterKey, string[]> & {
  maxPrice: number;
  inStockOnly: boolean;
};

export const PRICE_MAX = Math.max(...products.map((p) => p.priceValue));

export const emptyFilters = (): Filters => ({
  category: [],
  gender: [],
  occasion: [],
  style: [],
  season: [],
  color: [],
  brand: [],
  size: [],
  maxPrice: PRICE_MAX,
  inStockOnly: false,
});

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "best", label: "Best Selling" },
  { value: "price-asc", label: "Price Low to High" },
  { value: "price-desc", label: "Price High to Low" },
  { value: "recommended", label: "Recommended" },
  { value: "alpha", label: "Alphabetical" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function applyFilters(list: Product[], f: Filters) {
  return list.filter((p) => {
    if (f.category.length && !f.category.includes(p.category)) return false;
    if (f.gender.length && !f.gender.includes(p.gender)) return false;
    if (f.occasion.length && !f.occasion.includes(p.occasion)) return false;
    if (f.style.length && !f.style.includes(p.style)) return false;
    if (f.season.length && !f.season.includes(p.season)) return false;
    if (f.color.length && !f.color.includes(p.color)) return false;
    if (f.brand.length && !f.brand.includes(p.brand)) return false;
    if (f.size.length && !p.sizes.some((s) => f.size.includes(s))) return false;
    if (p.priceValue > f.maxPrice) return false;
    if (f.inStockOnly && !p.inStock) return false;
    return true;
  });
}

export function sortProducts(list: Product[], sort: SortValue) {
  const out = [...list];
  switch (sort) {
    case "newest":
      return out.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.addedIndex - a.addedIndex);
    case "featured":
      return out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "best":
      return out.sort((a, b) => b.reviews - a.reviews);
    case "price-asc":
      return out.sort((a, b) => a.priceValue - b.priceValue);
    case "price-desc":
      return out.sort((a, b) => b.priceValue - a.priceValue);
    case "recommended":
      return out.sort((a, b) => b.aiMatch - a.aiMatch);
    case "alpha":
      return out.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return out;
  }
}

/* -------------------------------- Categories ------------------------------ */

export type CategoryDef = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  match: (p: Product) => boolean;
  chips: string[];
};

export const CATEGORY_PAGES: CategoryDef[] = [
  {
    slug: "women",
    title: "Women",
    eyebrow: "AW26 — Womenswear",
    description:
      "Long lines, softened shoulders and undyed fibres. The women's wardrobe is built around six silhouettes that repeat, season after season.",
    image: editorial2,
    match: (p) => p.gender === "Women" || p.gender === "Unisex",
    chips: ["Outerwear", "Knitwear", "Tailoring", "Dresses"],
  },
  {
    slug: "men",
    title: "Men",
    eyebrow: "AW26 — Menswear",
    description:
      "Tailoring stripped of ornament: half-canvas construction, tropical wools and a straight column leg.",
    image: editorial4,
    match: (p) => p.gender === "Men" || p.gender === "Unisex",
    chips: ["Tailoring", "Outerwear", "Knitwear", "Denim"],
  },
  {
    slug: "shoes",
    title: "Shoes",
    eyebrow: "Footwear — Vegetable tanned",
    description:
      "Blake-stitched, unlined, and made to be resoled. Four lasts, developed over three seasons in Tuscany.",
    image: editorial3,
    match: (p) => p.category === "Shoes",
    chips: ["Boots", "Derby", "Sneaker"],
  },
  {
    slug: "accessories",
    title: "Accessories",
    eyebrow: "Objects — Leather & cashmere",
    description: "The last two per cent of a look. Grained calf, brushed hardware, no logos.",
    image: catAccessories,
    match: (p) => p.category === "Accessories",
    chips: ["Bags", "Scarves", "Belts"],
  },
  {
    slug: "summer-collection",
    title: "Summer Collection",
    eyebrow: "SS26 — Light structure",
    description: "Belgian linen, compact poplin and bias-cut silk. Weight removed, line intact.",
    image: gallery2,
    match: (p) => p.season === "Summer" || p.season === "Spring",
    chips: ["Linen", "Poplin", "Silk"],
  },
  {
    slug: "winter-collection",
    title: "Winter Collection",
    eyebrow: "AW26 — Weight & shell",
    description: "Double-faced wool, three-layer shells and 7-gauge ribs for the coldest months.",
    image: catOuterwear,
    match: (p) => p.season === "Winter",
    chips: ["Coats", "Parkas", "Cashmere"],
  },
  {
    slug: "formal",
    title: "Formal",
    eyebrow: "Occasion — Evening & work",
    description: "Pieces cut for rooms that ask for precision. Nothing shines except the finish.",
    image: catTailoring,
    match: (p) => p.occasion === "Formal" || p.occasion === "Evening",
    chips: ["Blazers", "Trousers", "Derby"],
  },
  {
    slug: "casual",
    title: "Casual",
    eyebrow: "Everyday — Relaxed line",
    description: "The off-duty half of the archive: rigid denim, heavy knits and low sneakers.",
    image: gallery6,
    match: (p) => p.occasion === "Casual" || p.occasion === "Travel",
    chips: ["Denim", "Knitwear", "Sneakers"],
  },
];

export const getCategory = (slug: string) => CATEGORY_PAGES.find((c) => c.slug === slug);

export const TRENDING_SEARCHES = [
  "Belted coat",
  "Cashmere",
  "Column trouser",
  "Monolith trench",
  "Leather tote",
];
