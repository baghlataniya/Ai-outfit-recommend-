import { Schema, model, Document, Types } from "mongoose";

export interface IAIOutfit extends Document {
  userId?: Types.ObjectId;
  occasion: string;
  style: string;
  colorPalette: string[];
  budget?: number;
  preferences?: string[];
  recommendedProducts: Types.ObjectId[];
  outfitName: string;
  aiExplanation: string;
  aiScore: number;
  image: string;
  createdAt: Date;
}

const AIOutfitSchema = new Schema<IAIOutfit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    occasion: { type: String, required: true, trim: true },
    style: { type: String, required: true, trim: true },
    colorPalette: { type: [String], default: [] },
    budget: { type: Number },
    preferences: { type: [String], default: [] },
    recommendedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    outfitName: { type: String, required: true, trim: true },
    aiExplanation: { type: String, required: true },
    aiScore: { type: Number, default: 95, min: 0, max: 100 },
    image: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AIOutfit = model<IAIOutfit>("AIOutfit", AIOutfitSchema);
