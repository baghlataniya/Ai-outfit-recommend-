import { Schema, model, Document, Types } from "mongoose";

export interface IAIOutfitItem {
  slot: string;
  product: Types.ObjectId;
}

export interface IAIOutfit extends Document {
  userId?: Types.ObjectId;
  outfitName: string;
  occasion: string;
  weather: string;
  style: string;
  colorPalette: string[];
  budget?: number;
  aiScore: number;
  aiExplanation: string;
  heroImage: string;
  totalPrice?: number;
  items: IAIOutfitItem[];
  createdAt: Date;
}

const AIOutfitItemSchema = new Schema<IAIOutfitItem>(
  {
    slot: { type: String, required: true, trim: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { _id: false }
);

const AIOutfitSchema = new Schema<IAIOutfit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    outfitName: { type: String, required: true, trim: true },
    occasion: { type: String, required: true, trim: true },
    weather: { type: String, default: "All Season", trim: true },
    style: { type: String, required: true, trim: true },
    colorPalette: { type: [String], default: [] },
    budget: { type: Number },
    aiScore: { type: Number, default: 95, min: 0, max: 100 },
    aiExplanation: { type: String, required: true },
    heroImage: { type: String, default: "" },
    totalPrice: { type: Number, default: 0 },
    items: [AIOutfitItemSchema],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AIOutfit = model<IAIOutfit>("AIOutfit", AIOutfitSchema);
