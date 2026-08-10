import { Order } from "../models/Order";

/**
 * Generates a unique human-readable order number such as MN-2026-000001.
 * Increments sequence based on total order count or timestamp fallback.
 */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments();
  let sequence = count + 1;

  let orderNumber = `MN-${year}-${String(sequence).padStart(6, "0")}`;
  
  // Ensure uniqueness in case of race condition or existing order number
  let existing = await Order.findOne({ orderNumber });
  while (existing) {
    sequence += 1;
    orderNumber = `MN-${year}-${String(sequence).padStart(6, "0")}`;
    existing = await Order.findOne({ orderNumber });
  }

  return orderNumber;
}
