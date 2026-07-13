import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  getBrands,
  createBrand,
} from "../controllers/productController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = Router();

// Category routes
router.get("/categories", getCategories);
router.post("/categories", authenticate, authorize("admin", "manager"), createCategory);

// Brand routes
router.get("/brands", getBrands);
router.post("/brands", authenticate, authorize("admin", "manager"), createBrand);

// Product routes
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.post("/", authenticate, authorize("admin", "manager"), createProduct);
router.put("/:id", authenticate, authorize("admin", "manager"), updateProduct);
router.delete("/:id", authenticate, authorize("admin", "manager"), deleteProduct);

export default router;
