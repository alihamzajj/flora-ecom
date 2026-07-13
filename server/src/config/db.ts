import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const MONGO_URI = process.env.MONGO_URI || "";

  if (!MONGO_URI) {
    console.error("[DB] MONGO_URI is missing. Set it in Railway Variables.");
    return;
  }

  // Log host only (never password)
  try {
    const host = MONGO_URI.split("@")[1]?.split("/")[0] || "unknown-host";
    console.log(`[DB] Connecting to Mongo host: ${host}`);
  } catch {
    console.log("[DB] Connecting...");
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("[DB] Connected to MongoDB successfully");
  } catch (error: any) {
    console.error("[DB] MongoDB connection failed:", error?.message || error);
    console.error(
      "[DB] Check: 1) MONGO_URI value 2) Atlas Network Access allows 0.0.0.0/0 3) Redeploy after saving Variables",
    );
  }
}
