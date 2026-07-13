export interface Address {
  _id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email?: string;
  isDefault?: boolean;
}

export type UserRole = "customer" | "manager" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  addresses?: Address[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string | Category;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface ProductVariant {
  size: string;
  inventory: number;
  sku: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string | Category;
  subcategory?: string;
  brand: string | Brand;
  collectionName?: string;
  variants: ProductVariant[];
  sku: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  badges: string[];
  rating: number;
  reviews: number;
  ingredients: string[];
  benefits: string[];
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  } | string;
  product: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: string[]; // user IDs
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  image: string;
  quantity: number;
  size: string;
  price: number;
}

export interface Order {
  _id: string;
  user: User | string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentIntentId?: string;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountAmount: number;
  minPurchaseAmount?: number;
  expirationDate?: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Newsletter {
  _id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}
