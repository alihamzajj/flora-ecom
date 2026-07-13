import { products as staticProducts, type Product } from "@/data/products";

const getBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.API_BASE_URL || "http://localhost:5000/api";
  }
  // Client-side can call the relative path which will be proxied by Vite in dev
  // In production, it can also be configured
  return (import.meta.env.VITE_API_URL as string) || "/api";
};

/** Map MongoDB product docs into the shape the UI expects (string category, asset image, sizes). */
export function normalizeProduct(raw: any): Product {
  const local = staticProducts.find((p) => p.slug === raw?.slug);
  const category =
    typeof raw?.category === "object" && raw.category
      ? String(raw.category.name ?? "")
      : String(raw?.category ?? local?.category ?? "");

  const sizes: string[] =
    Array.isArray(raw?.sizes) && raw.sizes.length > 0
      ? raw.sizes.map(String)
      : Array.isArray(raw?.variants)
        ? raw.variants.map((v: { size?: string }) => String(v.size ?? "")).filter(Boolean)
        : (local?.sizes ?? []);

  return {
    id: raw?._id ? String(raw._id) : raw?.id ? String(raw.id) : local?.id,
    slug: String(raw?.slug ?? local?.slug ?? ""),
    name: String(raw?.name ?? local?.name ?? ""),
    tagline: String(raw?.tagline ?? local?.tagline ?? ""),
    description: String(raw?.description ?? local?.description ?? ""),
    price: Number(raw?.price ?? local?.price ?? 0),
    rating: Number(raw?.rating ?? local?.rating ?? 0),
    reviews: Number(raw?.reviews ?? local?.reviews ?? 0),
    category,
    image: local?.image ?? String(raw?.image ?? raw?.images?.[0] ?? ""),
    ingredients: Array.isArray(raw?.ingredients) ? raw.ingredients.map(String) : (local?.ingredients ?? []),
    benefits: Array.isArray(raw?.benefits) ? raw.benefits.map(String) : (local?.benefits ?? []),
    sizes,
  };
}

const BASE_URL = getBaseUrl();

// Retrieve standard accessToken from storage if available
const getHeaders = () => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data as T;
}

export const api = {
  // GET helper
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<T>(res);
  },

  // POST helper
  async post<T>(path: string, body: any): Promise<T> {
    const isFormData = body instanceof FormData;
    const headers = getHeaders();
    if (isFormData) {
      // Fetch will automatically set content-type with boundary when sending FormData
      delete (headers as any)["Content-Type"];
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  // PUT helper
  async put<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  // DELETE helper
  async delete<T>(path: string, body?: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },
};

// API Services mapping the endpoints
export const authService = {
  async register(name: string, email: string, password: string) {
    return api.post<{ success: boolean; message: string; user: any }>("/auth/register", { name, email, password });
  },
  async login(email: string, password: string) {
    const data = await api.post<{ success: boolean; accessToken: string; user: any }>("/auth/login", { email, password });
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    return data;
  },
  async logout() {
    await api.post<any>("/auth/logout", {});
    localStorage.removeItem("accessToken");
  },
  async refresh() {
    const data = await api.post<{ success: boolean; accessToken: string; user: any }>("/auth/refresh", {});
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    return data;
  },
  async getMe() {
    return api.get<{ success: boolean; user: any }>("/auth/me");
  },
};

export const productService = {
  async getProducts(params?: {
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    const data = await api.get<{
      success: boolean;
      products: any[];
      page: number;
      pages: number;
      totalProducts: number;
    }>(`/products?${queryString}`);
    return {
      ...data,
      products: (data.products ?? []).map(normalizeProduct),
    };
  },
  async getProductBySlug(slug: string) {
    const data = await api.get<{ success: boolean; product: any }>(`/products/${slug}`);
    return {
      ...data,
      product: data.product ? normalizeProduct(data.product) : data.product,
    };
  },
  async getCategories() {
    return api.get<{ success: boolean; categories: any[] }>("/products/categories");
  },
  async getBrands() {
    return api.get<{ success: boolean; brands: any[] }>("/products/brands");
  },
};

export const cartService = {
  async getCart() {
    return api.get<{ success: boolean; cart: any[] }>("/cart");
  },
  async syncCart(items: { productId?: string; productSlug?: string; size: string; quantity: number }[]) {
    return api.post<{ success: boolean; cart: any[] }>("/cart/sync", { items });
  },
  async addToCart(productId: string, size: string, quantity: number = 1) {
    return api.post<{ success: boolean; cart: any[] }>("/cart/add", { productId, size, quantity });
  },
  async updateQty(productId: string, size: string, quantity: number) {
    return api.put<{ success: boolean; cart: any[] }>("/cart/update", { productId, size, quantity });
  },
  async removeFromCart(productId: string, size: string) {
    return api.post<{ success: boolean; cart: any[] }>("/cart/remove", { productId, size });
  },
};

export const wishlistService = {
  async getWishlist() {
    return api.get<{ success: boolean; wishlist: any[] }>("/wishlist");
  },
  async toggle(productId: string) {
    return api.post<{ success: boolean; message: string; inWishlist: boolean }>("/wishlist/toggle", { productId });
  },
};

export const reviewService = {
  async getReviews(productSlug: string) {
    return api.get<{ success: boolean; reviews: any[] }>(`/reviews/product/${productSlug}`);
  },
  async createReview(productSlug: string, rating: number, title: string, comment: string, files?: File[]) {
    const formData = new FormData();
    formData.append("rating", String(rating));
    formData.append("title", title);
    formData.append("comment", comment);
    if (files) {
      files.forEach((file) => formData.append("images", file));
    }
    return api.post<{ success: boolean; review: any }>(`/reviews/product/${productSlug}`, formData);
  },
  async voteHelpful(reviewId: string) {
    return api.post<{ success: boolean; helpfulVotesCount: number; hasVoted: boolean }>(`/reviews/${reviewId}/helpful`, {});
  },
};

export const orderService = {
  async createOrder(orderData: {
    orderItems: { productId: string; name: string; size: string; quantity: number }[];
    shippingAddress: any;
    billingAddress?: any;
    couponCode?: string;
  }) {
    return api.post<{ success: boolean; orderId: string; checkoutUrl: string }>("/orders", orderData);
  },
  async confirmPayment(orderId: string) {
    return api.post<{ success: boolean; order: any }>("/orders/confirm-payment", { orderId });
  },
  async getMyOrders() {
    return api.get<{ success: boolean; orders: any[] }>("/orders/my-orders");
  },
  async getOrderById(id: string) {
    return api.get<{ success: boolean; order: any }>(`/orders/${id}`);
  },
  async getAllOrders() {
    return api.get<{ success: boolean; orders: any[] }>("/orders");
  },
  async updateOrderStatus(id: string, orderStatus: string, trackingNumber?: string) {
    return api.put<{ success: boolean; message: string; order: any }>(`/orders/${id}/status`, {
      orderStatus,
      trackingNumber,
    });
  },
};

export const adminService = {
  async getAnalytics() {
    return api.get<{ success: boolean; analytics: any }>("/admin/analytics");
  },
  async getUsers() {
    return api.get<{ success: boolean; users: any[] }>("/admin/users");
  },
  async updateUserRole(userId: string, role: string) {
    return api.put<{ success: boolean; message: string; user: any }>(`/admin/users/${userId}/role`, { role });
  },
};
