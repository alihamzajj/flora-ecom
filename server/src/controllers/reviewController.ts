import { Request, Response, NextFunction } from "express";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { uploadImage } from "../services/cloudinaryService.js";

// Helper to update product rating stats
async function updateProductRatingStats(productId: string): Promise<void> {
  const reviews = await Review.find({ product: productId });
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 5;

  await Product.findByIdAndUpdate(productId, {
    rating: Number(avg.toFixed(1)),
    reviews: count,
  });
}

// GET /api/reviews/product/:slug
export async function getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    const reviews = await Review.find({ product: product._id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
}

// POST /api/reviews/product/:slug
export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user!.userId;

    if (!rating || !comment) {
      res.status(400).json({ success: false, message: "Rating and comment are required." });
      return;
    }

    const product = await Product.findOne({ slug });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: userId, product: product._id });
    if (existingReview) {
      res.status(400).json({ success: false, message: "You have already reviewed this product." });
      return;
    }

    // Check for verified purchase
    const order = await Order.findOne({
      user: userId,
      paymentStatus: "paid",
      "orderItems.product": product._id,
    });
    const isVerifiedPurchase = !!order;

    // Handle image uploads
    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        try {
          const url = await uploadImage(file, "reviews");
          imageUrls.push(url);
        } catch (uploadErr) {
          console.error("Cloudinary upload failed for review image:", uploadErr);
        }
      }
    }

    const review = new Review({
      user: userId,
      product: product._id,
      rating: Number(rating),
      title,
      comment,
      images: imageUrls,
      isVerifiedPurchase,
    });

    await review.save();
    await updateProductRatingStats(product._id.toString());

    // Populate user info for response
    const populated = await review.populate("user", "name avatar");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review: populated,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/reviews/:id/helpful
export async function voteHelpful(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ success: false, message: "Review not found." });
      return;
    }

    const index = review.helpfulVotes.findIndex((voteId) => voteId.toString() === userId);

    if (index >= 0) {
      // Already voted, remove vote
      review.helpfulVotes.splice(index, 1);
    } else {
      // Add vote
      review.helpfulVotes.push(userId as any);
    }

    await review.save();

    res.status(200).json({
      success: true,
      helpfulVotesCount: review.helpfulVotes.length,
      hasVoted: index < 0,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/reviews/:id (Admin/Owner)
export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ success: false, message: "Review not found." });
      return;
    }

    // Only Owner or Admin/Manager can delete
    if (review.user.toString() !== userId && userRole === "customer") {
      res.status(403).json({ success: false, message: "Forbidden. Not authorized to delete this review." });
      return;
    }

    const productId = review.product.toString();
    await Review.findByIdAndDelete(id);
    await updateProductRatingStats(productId);

    res.status(200).json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    next(error);
  }
}
