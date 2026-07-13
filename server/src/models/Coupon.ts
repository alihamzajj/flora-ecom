import { Schema, model, Document } from "mongoose";

export interface ICouponDocument extends Document {
  code: string;
  discountType: "percentage" | "flat";
  discountAmount: number;
  minPurchaseAmount?: number;
  expirationDate?: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

const couponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "flat"], required: true },
    discountAmount: { type: Number, required: true },
    minPurchaseAmount: { type: Number },
    expirationDate: { type: Date },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Coupon = model<ICouponDocument>("Coupon", couponSchema);
