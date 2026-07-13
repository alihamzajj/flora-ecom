import { Schema, model, Document } from "mongoose";

export interface IReviewDocument extends Document {
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: Schema.Types.ObjectId[];
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulVotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Compounding index to ensure user reviews a product only once (standard practice)
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = model<IReviewDocument>("Review", reviewSchema);
