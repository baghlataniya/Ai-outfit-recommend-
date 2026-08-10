import { Request, Response } from "express";
import { Product } from "../models/Product";
import { ApiResponse } from "../types";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const getProducts = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "50",
      category,
      gender,
      search,
      minPrice,
      maxPrice,
      featured,
      newArrival,
      sort = "newest",
    } = req.query;

    const query: Record<string, any> = { isActive: true };

    if (category) {
      query.category = { $regex: new RegExp(`^${(category as string).trim()}$`, "i") };
    }

    if (gender) {
      query.$or = [
        { gender: { $regex: new RegExp(`^${(gender as string).trim()}$`, "i") } },
        { gender: "Unisex" },
      ];
    }

    if (search) {
      const searchRegex = new RegExp((search as string).trim(), "i");
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    if (newArrival === "true") {
      query.isNew = true;
    }

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sort) {
      case "price-asc":
        sortOptions = { price: 1 };
        break;
      case "price-desc":
        sortOptions = { price: -1 };
        break;
      case "featured":
        sortOptions = { isFeatured: -1, rating: -1 };
        break;
      case "best":
        sortOptions = { reviewCount: -1 };
        break;
      case "alpha":
        sortOptions = { name: 1 };
        break;
      case "newest":
      default:
        sortOptions = { isNew: -1, createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products.",
      error: (error as Error).message,
    });
  }
};

export const getProductById = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const id = (req.params.id as string) || "";

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }

    if (!product) {
      product = await Product.findOne({ slug: id.toLowerCase() });
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product details.",
      error: (error as Error).message,
    });
  }
};

export const getProductBySlug = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const slug = (req.params.slug as string) || "";
    const product = await Product.findOne({ slug: slug.toLowerCase() });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product by slug.",
      error: (error as Error).message,
    });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const productData = req.body;
    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create product.",
      error: (error as Error).message,
    });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update product.",
      error: (error as Error).message,
    });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product.",
      error: (error as Error).message,
    });
  }
};
