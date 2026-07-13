import { Router } from "express";
import {
  getProductReviews,
  createReview,
  voteHelpful,
  deleteReview,
} from "../controllers/reviewController.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/product/:slug", getProductReviews);
router.post(
  "/product/:slug",
  authenticate,
  upload.array("images", 5), // allow up to 5 images
  createReview
);
router.post("/:id/helpful", authenticate, voteHelpful);
router.delete("/:id", authenticate, deleteReview);

export default router;
