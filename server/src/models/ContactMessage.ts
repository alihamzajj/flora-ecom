import { Schema, model, Document } from "mongoose";

export interface IContactMessageDocument extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
}

const contactMessageSchema = new Schema<IContactMessageDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ContactMessage = model<IContactMessageDocument>("ContactMessage", contactMessageSchema);
