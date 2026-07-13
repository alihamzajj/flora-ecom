import { Schema, model, Document } from "mongoose";

export interface IProductVariant {
  size: string;
  inventory: number;
  sku: string;
}

export interface IProductDocument extends Document {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: Schema.Types.ObjectId;
  subcategory?: string;
  brand: Schema.Types.ObjectId;
  collectionName?: string;
  variants: IProductVariant[];
  sku: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  badges: string[];
  rating: number;
  reviews: number;
  ingredients: string[];
  benefits: string[];
  isBestseller: boolean;
  isFeatured: boolean;
}

const variantSchema = new Schema<IProductVariant>({
  size: { type: String, required: true },
  inventory: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true },
});

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    images: [{ type: String, required: true }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    collectionName: { type: String },
    variants: [variantSchema],
    sku: { type: String, required: true },
    stockStatus: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock"],
      default: "in_stock",
    },
    badges: [{ type: String }],
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    ingredients: [{ type: String }],
    benefits: [{ type: String }],
    isBestseller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.image = ret.images && ret.images.length > 0 ? ret.images[0] : "";
        ret.sizes = ret.variants ? ret.variants.map((v: any) => v.size) : [];
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.image = ret.images && ret.images.length > 0 ? ret.images[0] : "";
        ret.sizes = ret.variants ? ret.variants.map((v: any) => v.size) : [];
        return ret;
      },
    },
  }
);

export const Product = model<IProductDocument>("Product", productSchema);

