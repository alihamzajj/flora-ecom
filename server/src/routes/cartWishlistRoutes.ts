import { Router } from "express";
import {
  getCart,
  syncCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  getWishlist,
  toggleWishlist,
} from "../controllers/cartWishlistController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Auth only on cart/wishlist paths — do not mount authenticate on the whole /api router
router.get("/cart", authenticate, getCart);
router.post("/cart/sync", authenticate, syncCart);
router.post("/cart/add", authenticate, addToCart);
router.put("/cart/update", authenticate, updateCartQty);
router.post("/cart/remove", authenticate, removeFromCart);

router.get("/wishlist", authenticate, getWishlist);
router.post("/wishlist/toggle", authenticate, toggleWishlist);

export default router;
