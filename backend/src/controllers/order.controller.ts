import { Response } from "express";
import { Types } from "mongoose";
import { Order, IOrderItem, IShippingAddress } from "../models/Order";
import { Product } from "../models/Product";
import { Cart } from "../models/Cart";
import { ApiResponse } from "../types";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { generateOrderNumber } from "../utils/orderNumber";

/**
 * POST /api/orders
 * Create a new order with server-side validation & calculations.
 * SECURITY RULE: Never trust prices, totals, or stock quantities sent by the frontend.
 */
export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const { items, shippingAddress, paymentMethod = "Credit Card" } = req.body;

    // 1. Validate inputs
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: "Order must contain at least one item." });
      return;
    }

    if (!shippingAddress || typeof shippingAddress !== "object") {
      res.status(400).json({ success: false, message: "Shipping address is required." });
      return;
    }

    const { firstName, lastName, email, phone, address, city, state, postalCode, country } = shippingAddress;

    if (!firstName || !lastName || !email || !phone || !address || !city || !country) {
      res.status(400).json({
        success: false,
        message: "First name, last name, email, phone, address, city, and country are required.",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ success: false, message: "Invalid email format in shipping address." });
      return;
    }

    const sanitizedAddress: IShippingAddress = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state ? state.trim() : "",
      postalCode: postalCode ? postalCode.trim() : "",
      country: country.trim(),
    };

    // 2. Process items & calculate totals on server
    const processedItems: IOrderItem[] = [];
    let serverSubtotal = 0;

    for (const item of items) {
      const { productId, quantity = 1, selectedSize = "M", selectedColor = "Black" } = item;

      if (!productId || !Types.ObjectId.isValid(productId)) {
        res.status(400).json({ success: false, message: `Invalid product ID: ${productId}` });
        return;
      }

      const qty = Math.max(1, parseInt(quantity, 10) || 1);

      // Fetch actual product from DB
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        res.status(400).json({
          success: false,
          message: `Product "${product?.name || productId}" is no longer available.`,
        });
        return;
      }

      // Check overall stock
      if (product.stock < qty) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${qty}.`,
        });
        return;
      }

      // Check variant stock if variants exist
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        const variant = product.variants.find(
          (v) =>
            v.size.toLowerCase() === selectedSize.toLowerCase() &&
            v.color.toLowerCase() === selectedColor.toLowerCase()
        );

        if (variant && variant.stock < qty) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}" (${selectedSize} / ${selectedColor}). Available: ${variant.stock}.`,
          });
          return;
        }
      }

      // Current price from DB
      const priceAtPurchase = product.price;
      const itemSubtotal = priceAtPurchase * qty;
      serverSubtotal += itemSubtotal;

      processedItems.push({
        productId: product._id as Types.ObjectId,
        productName: product.name,
        image: product.images?.[0] || product.thumbnail || "/assets/product-1.jpg",
        quantity: qty,
        selectedSize,
        selectedColor,
        priceAtPurchase,
      });
    }

    // 3. Calculate shipping, tax, total server-side
    // Free shipping if subtotal >= 500
    const serverShipping = serverSubtotal >= 500 || serverSubtotal === 0 ? 0 : 25;
    const serverTax = Math.round(serverSubtotal * 0.08);
    const serverTotal = serverSubtotal + serverShipping + serverTax;

    // 4. Generate unique human-readable order number
    const orderNumber = await generateOrderNumber();

    // 5. Create Order document
    const order = new Order({
      orderNumber,
      userId,
      items: processedItems,
      subtotal: serverSubtotal,
      shipping: serverShipping,
      tax: serverTax,
      total: serverTotal,
      shippingAddress: sanitizedAddress,
      paymentMethod,
      paymentStatus: "paid",
      orderStatus: "confirmed",
    });

    await order.save();

    // 6. Decrease inventory for each product
    for (const item of items) {
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - qty);

        // Also update variant stock if matched
        if (Array.isArray(product.variants) && product.variants.length > 0) {
          const variant = product.variants.find(
            (v) =>
              v.size.toLowerCase() === (item.selectedSize || "M").toLowerCase() &&
              v.color.toLowerCase() === (item.selectedColor || "Black").toLowerCase()
          );
          if (variant) {
            variant.stock = Math.max(0, variant.stock - qty);
          }
        }

        await product.save();
      }
    }

    // 7. Clear user's cart in MongoDB
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: { order },
    });
  } catch (error) {
    console.error("[Create Order Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order. Please try again.",
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/orders
 * Get previous orders for authenticated user.
 */
export const getUserOrders = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("[Get User Orders Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order history.",
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/orders/:id
 * Get single order details by ObjectId or orderNumber.
 * SECURITY: User can only access their own order unless they are an admin.
 */
export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const orderId = (req.params.id as string) || "";

    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    let order = null;

    if (Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    }

    if (!order) {
      order = await Order.findOne({ orderNumber: orderId.toUpperCase() });
    }

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    // Ownership & Security Check
    if (order.userId.toString() !== userId.toString() && userRole !== "admin") {
      res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission to view this order.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("[Get Order By ID Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order details.",
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/admin/orders
 * Admin: Get all orders across system with filtering & pagination.
 */
export const adminGetOrders = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { status, search, page = "1", limit = "20" } = req.query;

    const query: Record<string, any> = {};

    if (status) {
      query.orderStatus = status;
    }

    if (search) {
      const searchRegex = new RegExp((search as string).trim(), "i");
      query.$or = [
        { orderNumber: searchRegex },
        { "shippingAddress.email": searchRegex },
        { "shippingAddress.firstName": searchRegex },
        { "shippingAddress.lastName": searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "firstName lastName email");

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("[Admin Get Orders Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin order list.",
      error: (error as Error).message,
    });
  }
};

/**
 * PATCH /api/admin/orders/:id/status
 * Admin: Update order status or payment status.
 */
export const adminUpdateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const orderId = (req.params.id as string) || "";
    const { orderStatus, paymentStatus } = req.body;

    const validOrderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      res.status(400).json({ success: false, message: `Invalid orderStatus: ${orderStatus}` });
      return;
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      res.status(400).json({ success: false, message: `Invalid paymentStatus: ${paymentStatus}` });
      return;
    }

    let order = null;
    if (Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: orderId.toUpperCase() });
    }

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: { order },
    });
  } catch (error) {
    console.error("[Admin Update Order Status Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: (error as Error).message,
    });
  }
};
