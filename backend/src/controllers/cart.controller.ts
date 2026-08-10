import { Response } from "express";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { ApiResponse } from "../types";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const calculateCartSummary = async (items: any[]) => {
  let subtotal = 0;
  const enrichedItems = [];

  for (const item of items) {
    let product = null;
    const pid = item.productId ? item.productId.toString() : null;

    if (pid && pid.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(pid);
    }
    if (!product && pid) {
      product = await Product.findOne({ slug: pid.toLowerCase() });
    }

    const price = product ? product.price : Number(item.price) || 0;
    const name = product ? product.name : item.name || "Maison Item";
    const image = product ? (product.thumbnail || product.images?.[0]) : item.image || "";
    const category = product ? product.category : item.category || "";
    const stock = product ? product.stock : 10;
    const qty = Math.max(1, Math.min(stock > 0 ? stock : 1, item.quantity || 1));

    const lineTotal = price * qty;
    subtotal += lineTotal;

    enrichedItems.push({
      _id: item._id,
      productId: product ? product._id : item.productId,
      slug: product ? product.slug : pid,
      name,
      price,
      image,
      category,
      quantity: qty,
      selectedSize: item.selectedSize || "M",
      selectedColor: item.selectedColor || "Black",
      stock,
      lineTotal,
    });
  }

  const delivery = subtotal > 500 || subtotal === 0 ? 0 : 25;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + delivery + tax;

  return {
    items: enrichedItems,
    summary: {
      subtotal,
      delivery,
      tax,
      total,
      itemCount: enrichedItems.reduce((acc, i) => acc + i.quantity, 0),
    },
  };
};

export const getCart = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const { items, summary } = await calculateCartSummary(cart.items);

    res.status(200).json({
      success: true,
      data: { items, summary },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve cart.",
      error: (error as Error).message,
    });
  }
};

export const syncCart = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }

    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: "Items must be an array." });
      return;
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    for (const clientItem of items) {
      const { productId, quantity = 1, selectedSize = "M", selectedColor = "Black" } = clientItem;
      if (!productId) continue;

      let product = null;
      const pidStr = productId.toString();
      if (pidStr.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(pidStr);
      }
      if (!product) {
        product = await Product.findOne({ slug: pidStr.toLowerCase() });
      }

      if (!product) continue;

      const existingIndex = cart.items.findIndex(
        (i) =>
          i.productId.toString() === product._id.toString() &&
          i.selectedSize === selectedSize &&
          i.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        cart.items.push({
          productId: product._id,
          quantity,
          selectedSize,
          selectedColor,
          price: product.price,
          image: product.thumbnail || product.images[0] || "",
          addedAt: new Date(),
        });
      }
    }

    await cart.save();

    const { items: enrichedItems, summary } = await calculateCartSummary(cart.items);

    res.status(200).json({
      success: true,
      message: "Cart merged successfully",
      data: { items: enrichedItems, summary },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to sync cart.",
      error: (error as Error).message,
    });
  }
};

export const updateCart = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }

    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: "Items must be an array." });
      return;
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const updatedItems = [];
    for (const item of items) {
      let product = null;
      const pidStr = item.productId ? item.productId.toString() : "";
      if (pidStr.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(pidStr);
      }
      if (!product && pidStr) {
        product = await Product.findOne({ slug: pidStr.toLowerCase() });
      }

      if (!product) continue;

      updatedItems.push({
        productId: product._id,
        quantity: Math.max(1, item.quantity || 1),
        selectedSize: item.selectedSize || "M",
        selectedColor: item.selectedColor || "Black",
        price: product.price,
        image: product.thumbnail || product.images[0] || "",
        addedAt: new Date(),
      });
    }

    cart.items = updatedItems as any;
    await cart.save();

    const { items: enrichedItems, summary } = await calculateCartSummary(cart.items);

    res.status(200).json({
      success: true,
      data: { items: enrichedItems, summary },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart.",
      error: (error as Error).message,
    });
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }

    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] }, { upsert: true });

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: { items: [], summary: { subtotal: 0, delivery: 0, tax: 0, total: 0, itemCount: 0 } },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cart.",
      error: (error as Error).message,
    });
  }
};
