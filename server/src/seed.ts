import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "./models/Category.js";
import { Brand } from "./models/Brand.js";
import { Product } from "./models/Product.js";
import { User } from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/flora";

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully. Cleaning database...");

    // Clear existing collections
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    
    // Seed Categories
    console.log("Seeding categories...");
    const skincareCategory = new Category({
      name: "Skincare",
      slug: "skincare",
      description: "Premium daily skincare rituals",
    });
    const antiagingCategory = new Category({
      name: "Anti-aging",
      slug: "anti-aging",
      description: "Effective age-defying formulations",
    });
    const glowCategory = new Category({
      name: "Glow",
      slug: "glow",
      description: "Get radiant lit-from-within skin",
    });

    await skincareCategory.save();
    await antiagingCategory.save();
    await glowCategory.save();

    // Seed Brands
    console.log("Seeding brands...");
    const floraBrand = new Brand({
      name: "FLORA",
      slug: "flora",
      description: "Premium luxury clean skincare rituals formulated with botanical extracts.",
      logo: "",
    });
    await floraBrand.save();

    // Seed Products
    console.log("Seeding products...");
    const products = [
      {
        name: "Radiance Serum",
        slug: "radiance-serum",
        tagline: "Vitamin C + Hyaluronic Acid",
        description: "Our signature brightening serum, formulated with stabilized Vitamin C and low-molecular Hyaluronic Acid to reveal luminous, plumper skin in as few as 14 nights.",
        price: 49.99,
        images: ["/src/assets/serum.png"],
        category: skincareCategory._id,
        brand: floraBrand._id,
        collectionName: "Signature",
        variants: [
          { size: "30ml", inventory: 25, sku: "FLR-RAD-SRM-30" },
          { size: "50ml", inventory: 40, sku: "FLR-RAD-SRM-50" },
          { size: "100ml", inventory: 15, sku: "FLR-RAD-SRM-100" },
        ],
        sku: "FLR-RAD-SRM",
        stockStatus: "in_stock",
        badges: ["Bestseller", "New"],
        rating: 4.9,
        reviews: 1284,
        ingredients: ["Vitamin C 15%", "Hyaluronic Acid", "Ferulic Acid", "Rose Extract"],
        benefits: ["Brightens dull skin", "Reduces fine lines", "Boosts hydration", "Evens tone"],
        isBestseller: true,
        isFeatured: true,
      },
      {
        name: "Hydrating Cream",
        slug: "hydrating-cream",
        tagline: "72h Deep Moisture",
        description: "A cloud-like cream that locks in moisture for a full 72 hours. Squalane, ceramides and peptides nourish the skin barrier from within.",
        price: 62.00,
        images: ["/src/assets/cream.png"],
        category: skincareCategory._id,
        brand: floraBrand._id,
        collectionName: "Signature",
        variants: [
          { size: "50ml", inventory: 30, sku: "FLR-HYD-CRM-50" },
          { size: "100ml", inventory: 20, sku: "FLR-HYD-CRM-100" },
        ],
        sku: "FLR-HYD-CRM",
        stockStatus: "in_stock",
        badges: ["Hydration"],
        rating: 4.8,
        reviews: 942,
        ingredients: ["Squalane", "Ceramide NP", "Peptide Complex", "Shea Butter"],
        benefits: ["72h hydration", "Repairs barrier", "Softens texture", "Non-greasy finish"],
        isBestseller: true,
        isFeatured: false,
      },
      {
        name: "Night Repair Mask",
        slug: "night-repair-mask",
        tagline: "Overnight Renewal",
        description: "Wake up to visibly renewed skin. This retinol-infused sleeping mask works while you rest, resurfacing and refining pores.",
        price: 78.00,
        images: ["/src/assets/mask.png"],
        category: antiagingCategory._id,
        brand: floraBrand._id,
        collectionName: "Signature",
        variants: [
          { size: "50ml", inventory: 12, sku: "FLR-NGT-MSK-50" },
          { size: "100ml", inventory: 8, sku: "FLR-NGT-MSK-100" },
        ],
        sku: "FLR-NGT-MSK",
        stockStatus: "in_stock",
        badges: ["Renewal"],
        rating: 4.7,
        reviews: 651,
        ingredients: ["Encapsulated Retinol", "Niacinamide", "Bakuchiol", "Panthenol"],
        benefits: ["Refines pores", "Smooths texture", "Reduces wrinkles", "Balances tone"],
        isBestseller: false,
        isFeatured: false,
      },
      {
        name: "Vitamin Glow Drops",
        slug: "vitamin-glow-drops",
        tagline: "Liquid Gold Elixir",
        description: "A weightless facial oil blend of golden marula and jojoba, delivering an instant lit-from-within glow.",
        price: 54.00,
        images: ["/src/assets/drops.png"],
        category: glowCategory._id,
        brand: floraBrand._id,
        collectionName: "Signature",
        variants: [
          { size: "15ml", inventory: 20, sku: "FLR-VIT-DRP-15" },
          { size: "30ml", inventory: 35, sku: "FLR-VIT-DRP-30" },
        ],
        sku: "FLR-VIT-DRP",
        stockStatus: "in_stock",
        badges: ["Glow"],
        rating: 4.9,
        reviews: 733,
        ingredients: ["Marula Oil", "Jojoba Oil", "Vitamin E", "Golden Chamomile"],
        benefits: ["Instant glow", "Deep nourishment", "Antioxidant rich", "Fast absorbing"],
        isBestseller: true,
        isFeatured: false,
      },
    ];

    for (const p of products) {
      const product = new Product(p);
      await product.save();
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
