import { Response } from "express";
import { Wishlist } from "../models/Wishlist";
import { Product } from "../models/Product";
import { ApiResponse } from "../types";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const getWishlist = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }

    const items = await Wishlist.find({ userId: req.user._id });
    const productIds: string[] = [];
    const products = [];

    for (const item of items) {
      const pid = item.productId.toString();
      let prod = null;
      if (pid.match(/^[0-9a-fA-F]{24}$/)) {
        prod = await Product.findById(pid);
      }
      if (!prod) {
        prod = await Product.findOne({ slug: pid.toLowerCase() });
      }

      if (prod) {
        productIds.push(prod._id.toString());
        products.push(prod);
      }
    }

    res.status(200).json({
      success: true,
      data: { productIds, products },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve wishlist.",
      error: (error as Error).message,
    });
  }
};

export const syncWishlist = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }

    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
      res.status(400).json({ success: false, message: "productIds must be an array." });
      return;
    }

    for (const pid of productIds) {
      if (!pid) continue;
      let prod = null;
      const pidStr = pid.toString();
      if (pidStr.match(/^[0-9a-fA-F]{24}$/)) {
        prod = await Product.findById(pidStr);
      }
      if (!prod) {
        prod = await Product.findOne({ slug: pidStr.toLowerCase() });
      }

      if (prod) {
        await Wishlist.updateOne(
          { userId: req.user._id, productId: prod._id },
          { $setOnInsert: { userId: req.user._id, productId: prod._id } },
          { upsert: true }
        );
      }
    }

    const items = await Wishlist.find({ userId: req.user._id });
    const updatedIds: string[] = [];
    const products = [];

    for (const item of items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        updatedIds.push(prod._id.toString());
        products.push(prod);
      }
    }

    res.status(200).json({
      success: true,
      message: "Wishlist merged successfully",
      data: { productIds: updatedIds, products },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to sync wishlist.",
      error: (error as Error).message,
    });
  }
};

export const toggleWishlist = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }

    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: "productId is required." });
      return;
    }

    let prod = null;
    const pidStr = productId.toString();
    if (pidStr.match(/^[0-9a-fA-F]{24}$/)) {
      prod = await Product.findById(pidStr);
    }
    if (!prod) {
      prod = await Product.findOne({ slug: pidStr.toLowerCase() });
    }

    if (!prod) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    const existing = await Wishlist.findOne({ userId: req.user._id, productId: prod._id });
    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
    } else {
      await Wishlist.create({ userId: req.user._id, productId: prod._id });
    }

    const items = await Wishlist.find({ userId: req.user._id });
    const updatedIds: string[] = [];
    const products = [];

    for (const item of items) {
      const p = await Product.findById(item.productId);
      if (p) {
        updatedIds.push(p._id.toString());
        products.push(p);
      }
    }

    res.status(200).json({
      success: true,
      message: existing ? "Removed from wishlist" : "Added to wishlist",
      data: { productIds: updatedIds, products },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle wishlist item.",
      error: (error as Error).message,
    });
  }
};
