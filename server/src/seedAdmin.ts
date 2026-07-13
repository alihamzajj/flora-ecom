import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/flora";

const OWNER_EMAIL = "owner@flora.com";
const OWNER_PASSWORD = "Owner12345";

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    // Always recreate so password hashing never gets double-applied
    await User.deleteOne({ email: OWNER_EMAIL });

    await User.create({
      name: "FLORA Owner",
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      role: "admin",
      isVerified: true,
    });

    console.log("Owner account ready:");
    console.log(`  Email: ${OWNER_EMAIL}`);
    console.log(`  Password: ${OWNER_PASSWORD}`);
    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  }
}

seedAdmin();
