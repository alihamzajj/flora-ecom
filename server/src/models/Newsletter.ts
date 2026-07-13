import { Schema, model, Document } from "mongoose";

export interface INewsletterDocument extends Document {
  email: string;
  isActive: boolean;
}

const newsletterSchema = new Schema<INewsletterDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Newsletter = model<INewsletterDocument>("Newsletter", newsletterSchema);
