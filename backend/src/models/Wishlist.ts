import { Schema, model, Document, Types } from "mongoose";

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate wishlist items for the same user & product
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Wishlist = model<IWishlist>("Wishlist", WishlistSchema);
