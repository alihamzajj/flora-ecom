import serum from "@/assets/serum.png";
import cream from "@/assets/cream.png";
import mask from "@/assets/mask.png";
import drops from "@/assets/drops.png";

export type Product = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  image: string;
  ingredients: string[];
  benefits: string[];
  sizes: string[];
};

export const products: Product[] = [
  {
    slug: "radiance-serum",
    name: "Radiance Serum",
    tagline: "Vitamin C + Hyaluronic Acid",
    description:
      "Our signature brightening serum, formulated with stabilized Vitamin C and low-molecular Hyaluronic Acid to reveal luminous, plumper skin in as few as 14 nights.",
    price: 49.99,
    rating: 4.9,
    reviews: 1284,
    category: "Skincare",
    image: serum,
    ingredients: ["Vitamin C 15%", "Hyaluronic Acid", "Ferulic Acid", "Rose Extract"],
    benefits: ["Brightens dull skin", "Reduces fine lines", "Boosts hydration", "Evens tone"],
    sizes: ["30ml", "50ml", "100ml"],
  },
  {
    slug: "hydrating-cream",
    name: "Hydrating Cream",
    tagline: "72h Deep Moisture",
    description:
      "A cloud-like cream that locks in moisture for a full 72 hours. Squalane, ceramides and peptides nourish the skin barrier from within.",
    price: 62.0,
    rating: 4.8,
    reviews: 942,
    category: "Skincare",
    image: cream,
    ingredients: ["Squalane", "Ceramide NP", "Peptide Complex", "Shea Butter"],
    benefits: ["72h hydration", "Repairs barrier", "Softens texture", "Non-greasy finish"],
    sizes: ["50ml", "100ml"],
  },
  {
    slug: "night-repair-mask",
    name: "Night Repair Mask",
    tagline: "Overnight Renewal",
    description:
      "Wake up to visibly renewed skin. This retinol-infused sleeping mask works while you rest, resurfacing and refining pores.",
    price: 78.0,
    rating: 4.7,
    reviews: 651,
    category: "Anti-aging",
    image: mask,
    ingredients: ["Encapsulated Retinol", "Niacinamide", "Bakuchiol", "Panthenol"],
    benefits: ["Refines pores", "Smooths texture", "Reduces wrinkles", "Balances tone"],
    sizes: ["50ml", "100ml"],
  },
  {
    slug: "vitamin-glow-drops",
    name: "Vitamin Glow Drops",
    tagline: "Liquid Gold Elixir",
    description:
      "A weightless facial oil blend of golden marula and jojoba, delivering an instant lit-from-within glow.",
    price: 54.0,
    rating: 4.9,
    reviews: 733,
    category: "Glow",
    image: drops,
    ingredients: ["Marula Oil", "Jojoba Oil", "Vitamin E", "Golden Chamomile"],
    benefits: ["Instant glow", "Deep nourishment", "Antioxidant rich", "Fast absorbing"],
    sizes: ["15ml", "30ml"],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
