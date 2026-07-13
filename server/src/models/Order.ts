import { Schema, model, Document } from "mongoose";
import { Address } from "../types/shared.js";

export interface IOrderItem {
  product: Schema.Types.ObjectId;
  name: string;
  image: string;
  quantity: number;
  size: string;
  price: number;
}

export interface IOrderDocument extends Document {
  user?: Schema.Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentIntentId?: string;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  invoiceUrl?: string;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new Schema<IOrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" }, // optional for guest checkout
    orderItems: [orderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },
    billingAddress: {
      name: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },
    paymentMethod: { type: String, required: true, default: "stripe" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentIntentId: { type: String },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: { type: String },
    invoiceUrl: { type: String },
  },
  { timestamps: true }
);

export const Order = model<IOrderDocument>("Order", orderSchema);
