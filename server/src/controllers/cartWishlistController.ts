import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";

// Helper to populate user cart
async function getPopulatedCart(userId: string) {
  const user = await User.findById(userId).populate({
    path: "cart.product",
    select: "name slug price salePrice images variants stockStatus category brand",
  });
  return user ? user.cart : [];
}

// GET /api/cart
export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const cart = await getPopulatedCart(userId);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
}

// POST /api/cart/sync
export async function syncCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { items } = req.body; // Array of { productSlug/productId, size, quantity }

    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: "Items must be an array." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    for (const item of items) {
      let productObj;
      if (item.productId) {
        productObj = await Product.findById(item.productId);
      } else if (item.productSlug) {
        productObj = await Product.findOne({ slug: item.productSlug });
      }

      if (!productObj) continue;

      const idx = user.cart.findIndex(
        (c) => c.product.toString() === productObj._id.toString() && c.size === item.size
      );

      if (idx >= 0) {
        // Merge quantity
        user.cart[idx].quantity += item.quantity;
      } else {
        // Add new item
        user.cart.push({
          product: productObj._id as any,
          size: item.size,
          quantity: item.quantity,
        });
      }
    }

    await user.save();
    const cart = await getPopulatedCart(userId);

    res.status(200).json({ success: true, message: "Cart synced successfully.", cart });
  } catch (error) {
    next(error);
  }
}

// POST /api/cart/add
export async function addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { productId, size, quantity = 1 } = req.body;

    if (!productId || !size) {
      res.status(400).json({ success: false, message: "Product ID and size are required." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const idx = user.cart.findIndex(
      (c) => c.product.toString() === productId && c.size === size
    );

    if (idx >= 0) {
      user.cart[idx].quantity += Number(quantity);
    } else {
      user.cart.push({
        product: productId as any,
        size,
        quantity: Number(quantity),
      });
    }

    await user.save();
    const cart = await getPopulatedCart(userId);

    res.status(200).json({ success: true, message: "Item added to cart.", cart });
  } catch (error) {
    next(error);
  }
}

// PUT /api/cart/update
export async function updateCartQty(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { productId, size, quantity } = req.body;

    if (!productId || !size || quantity === undefined) {
      res.status(400).json({ success: false, message: "Product ID, size and quantity are required." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const idx = user.cart.findIndex(
      (c) => c.product.toString() === productId && c.size === size
    );

    if (idx >= 0) {
      if (quantity <= 0) {
        user.cart.splice(idx, 1);
      } else {
        user.cart[idx].quantity = Number(quantity);
      }
      await user.save();
    }

    const cart = await getPopulatedCart(userId);
    res.status(200).json({ success: true, message: "Cart updated.", cart });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/cart/remove
export async function removeFromCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { productId, size } = req.body;

    if (!productId || !size) {
      res.status(400).json({ success: false, message: "Product ID and size are required." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    user.cart = user.cart.filter(
      (c) => !(c.product.toString() === productId && c.size === size)
    );

    await user.save();
    const cart = await getPopulatedCart(userId);

    res.status(200).json({ success: true, message: "Item removed from cart.", cart });
  } catch (error) {
    next(error);
  }
}

// GET /api/wishlist
export async function getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await User.findById(userId).populate({
      path: "wishlist",
      select: "name slug price salePrice images rating reviews tagline stockStatus",
    });

    res.status(200).json({ success: true, wishlist: user ? user.wishlist : [] });
  } catch (error) {
    next(error);
  }
}

// POST /api/wishlist/toggle
export async function toggleWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: "Product ID is required." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const index = user.wishlist.findIndex((id) => id.toString() === productId);

    if (index >= 0) {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
      await user.save();
      res.status(200).json({ success: true, message: "Removed from wishlist.", inWishlist: false });
    } else {
      // Add to wishlist
      user.wishlist.push(productId as any);
      await user.save();
      res.status(200).json({ success: true, message: "Added to wishlist.", inWishlist: true });
    }
  } catch (error) {
    next(error);
  }
}
