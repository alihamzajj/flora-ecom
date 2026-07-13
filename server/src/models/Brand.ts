import { Schema, model, Document } from "mongoose";

export interface IBrandDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

const brandSchema = new Schema<IBrandDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    logo: { type: String },
  },
  { timestamps: true }
);

export const Brand = model<IBrandDocument>("Brand", brandSchema);
