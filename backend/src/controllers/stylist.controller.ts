import { Request, Response } from "express";
import { generateOutfits, StylistBrief } from "../services/stylist.service";
import { AIOutfit } from "../models/AIOutfit";
import { ApiResponse } from "../types";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { Types } from "mongoose";

/**
 * POST /api/stylist/recommend
 * Generate personalized AI outfit recommendations based on client brief.
 */
export const getRecommendations = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const brief: StylistBrief = req.body || {};
    console.log(`[AI Stylist] Curating recommendations for brief:`, JSON.stringify(brief));
    const result = await generateOutfits(brief);
    console.log(`[AI Stylist] Generated ${result.outfits.length} looks via ${result.generatedBy}`);

    res.status(200).json({
      success: true,
      message: "Outfits generated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("[Stylist Controller Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to curate outfit recommendations.",
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/stylist/saved
 * Save an AI-curated outfit to user's profile in MongoDB.
 */
export const saveOutfit = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required to save outfits." });
      return;
    }

    const {
      outfitName,
      occasion,
      weather,
      style,
      colorPalette,
      budget,
      aiScore,
      aiExplanation,
      heroImage,
      totalPrice,
      items,
    } = req.body;

    if (!outfitName || !aiExplanation) {
      res.status(400).json({ success: false, message: "Outfit name and explanation are required." });
      return;
    }

    const formattedItems = Array.isArray(items)
      ? items.map((i: any) => ({
          slot: i.slot || "Top",
          product: new Types.ObjectId(i.productId || i.product?._id || i.product?.id),
        }))
      : [];

    const newOutfit = new AIOutfit({
      userId,
      outfitName: outfitName.trim(),
      occasion: occasion || "Formal",
      weather: weather || "All Season",
      style: style || "Minimal",
      colorPalette: Array.isArray(colorPalette) ? colorPalette : [],
      budget: budget || 0,
      aiScore: typeof aiScore === "number" ? aiScore : 95,
      aiExplanation: aiExplanation.trim(),
      heroImage: heroImage || "",
      totalPrice: totalPrice || 0,
      items: formattedItems,
    });

    await newOutfit.save();
    const populated = await newOutfit.populate("items.product");

    res.status(201).json({
      success: true,
      message: "Outfit saved to your private archive.",
      data: { outfit: populated },
    });
  } catch (error) {
    console.error("[Save Outfit Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to save outfit.",
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/stylist/saved
 * Retrieve all saved outfits for the authenticated user.
 */
export const getSavedOutfits = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const outfits = await AIOutfit.find({ userId })
      .sort({ createdAt: -1 })
      .populate("items.product");

    res.status(200).json({
      success: true,
      data: { outfits },
    });
  } catch (error) {
    console.error("[Get Saved Outfits Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve saved outfits.",
      error: (error as Error).message,
    });
  }
};

/**
 * DELETE /api/stylist/saved/:id
 * Remove a saved outfit from user's archive.
 */
export const deleteSavedOutfit = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const deleted = await AIOutfit.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: "Saved outfit not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Outfit removed from archive.",
    });
  } catch (error) {
    console.error("[Delete Saved Outfit Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete outfit.",
      error: (error as Error).message,
    });
  }
};

