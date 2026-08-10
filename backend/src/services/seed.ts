import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config({ path: path.join(__dirname, "../../.env") });

import { connectDB } from "../config/db";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { User } from "../models/User";

const SEED_CATEGORIES = [
  { name: "Women", slug: "women", description: "Monochrome luxury womenswear cut for permanence." },
  { name: "Men", slug: "men", description: "Tailored menswear and minimal wardrobe essentials." },
  { name: "Outerwear", slug: "outerwear", description: "Virgin wool coats, bonded trenches, and technical parkas." },
  { name: "Knitwear", slug: "knitwear", description: "Grade-A Mongolian cashmere and ribbed lambswool." },
  { name: "Tailoring", slug: "tailoring", description: "Half-canvassed blazers and tropical wool trousers." },
  { name: "Shoes", slug: "shoes", description: "Vegetable-tanned leather boots and burnished derbies." },
  { name: "Accessories", slug: "accessories", description: "Cashmere scarves and grained leather totes." },
  { name: "Shirting", slug: "shirting", description: "Compact poplin and silk shirting." },
  { name: "Dresses", slug: "dresses", description: "Bias-cut silk slip dresses and minimal gowns." },
  { name: "Denim", slug: "denim", description: "Raw rigid selvedge denim in dark washes." },
];

const SEED_PRODUCTS = [
  {
    slug: "atelier-coat",
    name: "Atelier Belted Coat",
    category: "Outerwear",
    price: 1290,
    compareAtPrice: 1450,
    currency: "USD",
    images: ["/assets/product-1.jpg", "/assets/product-1b.jpg"],
    thumbnail: "/assets/product-1.jpg",
    gender: "Women",
    occasion: "Formal",
    style: "Minimal",
    color: "Black",
    brand: "Maison Noir",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Charcoal", "Soft White"],
    variants: [
      { size: "XS", color: "Black", stock: 5 },
      { size: "S", color: "Black", stock: 8 },
      { size: "M", color: "Black", stock: 12 },
      { size: "L", color: "Black", stock: 4 },
      { size: "M", color: "Charcoal", stock: 6 },
    ],
    rating: 4.9,
    reviewCount: 128,
    isNew: true,
    isFeatured: true,
    stock: 35,
    material: "Virgin Wool",
    tags: ["wool", "coat", "belted", "outerwear", "minimal"],
    description: "Double-faced virgin wool, cut long and belted at the waist. An unbroken line from shoulder to hem.",
  },
  {
    slug: "cloud-knit",
    name: "Cloud Cashmere Knit",
    category: "Knitwear",
    price: 480,
    compareAtPrice: 550,
    currency: "USD",
    images: ["/assets/product-2.jpg", "/assets/product-2b.jpg"],
    thumbnail: "/assets/product-2.jpg",
    gender: "Women",
    occasion: "Casual",
    style: "Relaxed",
    color: "Soft White",
    brand: "Atelier 07",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Soft White", "Light Gray"],
    variants: [
      { size: "S", color: "Soft White", stock: 10 },
      { size: "M", color: "Soft White", stock: 15 },
      { size: "L", color: "Light Gray", stock: 8 },
    ],
    rating: 4.7,
    reviewCount: 214,
    isNew: false,
    isFeatured: true,
    stock: 33,
    material: "Mongolian Cashmere",
    tags: ["cashmere", "knit", "sweater", "white"],
    description: "Grade-A Mongolian cashmere, brushed twice for a weightless hand.",
  },
  {
    slug: "column-trouser",
    name: "Column Wool Trouser",
    category: "Tailoring",
    price: 390,
    currency: "USD",
    images: ["/assets/product-3.jpg", "/assets/product-3b.jpg"],
    thumbnail: "/assets/product-3.jpg",
    gender: "Men",
    occasion: "Work",
    style: "Tailored",
    color: "Charcoal",
    brand: "Maison Noir",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Charcoal", "Black"],
    variants: [
      { size: "30", color: "Charcoal", stock: 10 },
      { size: "32", color: "Charcoal", stock: 14 },
      { size: "34", color: "Black", stock: 8 },
    ],
    rating: 4.8,
    reviewCount: 96,
    isNew: false,
    isFeatured: true,
    stock: 32,
    material: "Tropical Wool",
    tags: ["trouser", "tailoring", "wool", "charcoal"],
    description: "A straight column leg in tropical wool, pressed to a permanent crease.",
  },
  {
    slug: "monolith-trench",
    name: "Monolith Trench",
    category: "Outerwear",
    price: 1540,
    currency: "USD",
    images: ["/assets/product-4.jpg", "/assets/product-4b.jpg"],
    thumbnail: "/assets/product-4.jpg",
    gender: "Unisex",
    occasion: "Evening",
    style: "Structured",
    color: "Black",
    brand: "Noir Studio",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
    variants: [
      { size: "S", color: "Black", stock: 4 },
      { size: "M", color: "Black", stock: 6 },
      { size: "L", color: "Black", stock: 5 },
    ],
    rating: 5.0,
    reviewCount: 42,
    isNew: true,
    isFeatured: true,
    stock: 15,
    material: "Bonded Cotton Gabardine",
    tags: ["trench", "outerwear", "black", "coat", "gabardine"],
    description: "Bonded cotton gabardine with sealed seams and a concealed placket.",
  },
  {
    slug: "ridge-overshirt",
    name: "Ridge Wool Overshirt",
    category: "Outerwear",
    price: 620,
    currency: "USD",
    images: ["/assets/editorial-1.jpg", "/assets/product-1.jpg"],
    thumbnail: "/assets/editorial-1.jpg",
    gender: "Men",
    occasion: "Casual",
    style: "Relaxed",
    color: "Charcoal",
    brand: "Atelier 07",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal", "Black"],
    variants: [
      { size: "M", color: "Charcoal", stock: 9 },
      { size: "L", color: "Charcoal", stock: 7 },
    ],
    rating: 4.6,
    reviewCount: 74,
    isNew: false,
    isFeatured: false,
    stock: 16,
    material: "Milled Wool",
    tags: ["overshirt", "wool", "casual", "shirt"],
    description: "A shirt with the weight of a jacket. Milled wool, patch pockets, no lining.",
  },
  {
    slug: "vellum-shirt",
    name: "Vellum Poplin Shirt",
    category: "Shirting",
    price: 260,
    currency: "USD",
    images: ["/assets/editorial-2.jpg", "/assets/product-2.jpg"],
    thumbnail: "/assets/editorial-2.jpg",
    gender: "Women",
    occasion: "Work",
    style: "Minimal",
    color: "Soft White",
    brand: "Objet Blanc",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Soft White"],
    variants: [
      { size: "S", color: "Soft White", stock: 12 },
      { size: "M", color: "Soft White", stock: 18 },
    ],
    rating: 4.5,
    reviewCount: 188,
    isNew: false,
    isFeatured: false,
    stock: 30,
    material: "Cotton Poplin",
    tags: ["shirt", "poplin", "white", "minimal"],
    description: "Compact poplin with a stand collar and mother-of-pearl closures.",
  },
  {
    slug: "obsidian-boot",
    name: "Obsidian Leather Boot",
    category: "Shoes",
    price: 890,
    currency: "USD",
    images: ["/assets/editorial-3.jpg", "/assets/product-4.jpg"],
    thumbnail: "/assets/editorial-3.jpg",
    gender: "Unisex",
    occasion: "Evening",
    style: "Structured",
    color: "Black",
    brand: "Noir Studio",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Black"],
    variants: [
      { size: "41", color: "Black", stock: 5 },
      { size: "42", color: "Black", stock: 8 },
      { size: "43", color: "Black", stock: 6 },
    ],
    rating: 4.8,
    reviewCount: 61,
    isNew: true,
    isFeatured: true,
    stock: 19,
    material: "Calf Leather",
    tags: ["shoes", "boots", "leather", "black"],
    description: "Vegetable-tanned calf on a blake-stitched sole, unlined at the shaft.",
  },
  {
    slug: "shadow-derby",
    name: "Shadow Derby",
    category: "Shoes",
    price: 740,
    currency: "USD",
    images: ["/assets/editorial-4.jpg", "/assets/product-3.jpg"],
    thumbnail: "/assets/editorial-4.jpg",
    gender: "Men",
    occasion: "Formal",
    style: "Tailored",
    color: "Black",
    brand: "Maison Noir",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["Black", "Charcoal"],
    variants: [
      { size: "42", color: "Black", stock: 0 },
      { size: "43", color: "Black", stock: 0 },
    ],
    rating: 4.4,
    reviewCount: 53,
    isNew: false,
    isFeatured: false,
    stock: 0,
    material: "Calfskin",
    tags: ["shoes", "derby", "formal", "black"],
    description: "A low derby with a squared toe box and a hand-burnished finish.",
  },
];

export const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();

    console.log("[Seed] Clearing existing database collections...");
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    console.log("[Seed] Inserting categories...");
    const createdCategories = await Category.insertMany(SEED_CATEGORIES);
    console.log(`[Seed] Seeded ${createdCategories.length} categories.`);

    console.log("[Seed] Inserting products...");
    const createdProducts = await Product.insertMany(SEED_PRODUCTS);
    console.log(`[Seed] Seeded ${createdProducts.length} products.`);

    console.log("[Seed] Creating default admin & client test users...");
    const testClient = new User({
      firstName: "Elena",
      lastName: "Vance",
      email: "client@maisonnoir.com",
      password: "Password123!",
      role: "user",
      addresses: [
        {
          firstName: "Elena",
          lastName: "Vance",
          phone: "+33 1 42 68 55 00",
          addressLine1: "12 Rue du Faubourg Saint-Honoré",
          city: "Paris",
          state: "Île-de-France",
          postalCode: "75008",
          country: "France",
          isDefault: true,
        },
      ],
    });
    await testClient.save();

    const testAdmin = new User({
      firstName: "Maison",
      lastName: "Admin",
      email: "admin@maisonnoir.com",
      password: "AdminPassword123!",
      role: "admin",
    });
    await testAdmin.save();

    console.log(`[Seed] Seeded test client user: client@maisonnoir.com (Password: Password123!)`);
    console.log(`[Seed] Seeded test admin user:  admin@maisonnoir.com (Password: AdminPassword123!)`);

    console.log("==================================================");
    console.log("  DATABASE SEEDING COMPLETED SUCCESSFULLY         ");
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error("[Seed Error]", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
