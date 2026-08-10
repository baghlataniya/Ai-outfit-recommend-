import { Schema, model, Document, Types } from "mongoose";
import { AddressSchema, IAddress } from "./Address";

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  price: number;
  image: string;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress: IAddress;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { type: String, required: true },
    selectedColor: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    shippingAddress: { type: AddressSchema, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
      index: true,
    },
    paymentMethod: { type: String, default: "Card", trim: true },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", OrderSchema);
