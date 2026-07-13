import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/flora";
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.warn("MongoDB connection failed. App running in Sandbox Mode without live DB.");
  }
}
