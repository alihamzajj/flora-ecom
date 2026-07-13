import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { Address } from "../types/shared.js";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  role: "customer" | "manager" | "admin";
  avatar?: string;
  addresses: Address[];
  wishlist: Schema.Types.ObjectId[];
  cart: {
    product: Schema.Types.ObjectId;
    size: string;
    quantity: number;
  }[];
  recentlyViewed: Schema.Types.ObjectId[];
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const addressSchema = new Schema<Address>({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["customer", "manager", "admin"],
      default: "customer",
    },
    avatar: { type: String },
    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    cart: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    recentlyViewed: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUserDocument>("User", userSchema);
