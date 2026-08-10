import { Schema, model, Document } from "mongoose";

export interface IProductVariant {
  size: string;
  color: string;
  stock: number;
  sku?: string;
  price?: number;
  image?: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  thumbnail: string;
  sizes: string[];
  colors: string[];
  variants: IProductVariant[];
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  occasion: string;
  style: string;
  gender: "Women" | "Men" | "Unisex";
  material: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IProductVariant>(
  {
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, trim: true },
    price: { type: Number },
    image: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true, default: "Maison Noir", index: true },
    category: { type: String, required: true, trim: true, index: true },
    subcategory: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: "USD" },
    images: { type: [String], required: true, default: [] },
    thumbnail: { type: String, required: true },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    variants: [VariantSchema],
    stock: { type: Number, required: true, default: 10 },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [], index: true },
    occasion: { type: String, default: "Casual", trim: true },
    style: { type: String, default: "Minimal", trim: true },
    gender: { type: String, enum: ["Women", "Men", "Unisex"], default: "Unisex", index: true },
    material: { type: String, default: "Virgin Wool", trim: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNew: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  } as any,
  { timestamps: true, suppressReservedKeysWarning: true }
);

// Create compound text index for search queries
ProductSchema.index(
  { name: "text", brand: "text", description: "text", tags: "text", category: "text" },
  { weights: { name: 10, brand: 5, category: 5, tags: 3, description: 1 } }
);

export const Product = model<IProduct>("Product", ProductSchema);
