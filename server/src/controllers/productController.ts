import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Brand } from "../models/Brand.js";

// Utility to generate a slug
const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

// GET /api/products
export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      search,
      category,
      brand,
      collectionName,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query: any = {};

    // 1. Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Category filter (resolves Category Slug to ID)
    if (category) {
      const catObj = await Category.findOne({ slug: category as string });
      if (catObj) {
        query.category = catObj._id;
      } else {
        // If category slug doesn't exist, return empty array immediately
        res.status(200).json({
          success: true,
          products: [],
          page: 1,
          pages: 0,
          totalProducts: 0,
        });
        return;
      }
    }

    // 3. Brand filter (resolves Brand Slug to ID)
    if (brand) {
      const brandObj = await Brand.findOne({ slug: brand as string });
      if (brandObj) {
        query.brand = brandObj._id;
      } else {
        res.status(200).json({
          success: true,
          products: [],
          page: 1,
          pages: 0,
          totalProducts: 0,
        });
        return;
      }
    }

    // 4. Collection filter
    if (collectionName) {
      query.collectionName = collectionName as string;
    }

    // 5. Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Pagination variables
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOptions: any = { createdAt: -1 }; // default: latest
    if (sort) {
      switch (sort) {
        case "price_asc":
          sortOptions = { price: 1 };
          break;
        case "price_desc":
          sortOptions = { price: -1 };
          break;
        case "rating":
          sortOptions = { rating: -1 };
          break;
        case "reviews":
          sortOptions = { reviews: -1 };
          break;
        case "latest":
          sortOptions = { createdAt: -1 };
          break;
      }
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      success: true,
      products,
      page: pageNum,
      pages,
      totalProducts,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/products/:slug
export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug })
      .populate("category", "name slug description")
      .populate("brand", "name slug logo description");

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

// POST /api/products (Admin/Manager)
export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productData = req.body;
    if (!productData.slug && productData.name) {
      productData.slug = generateSlug(productData.name);
    }

    const existingProduct = await Product.findOne({ slug: productData.slug });
    if (existingProduct) {
      res.status(400).json({ success: false, message: "Product with this slug already exists." });
      return;
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ success: true, message: "Product created successfully.", product });
  } catch (error) {
    next(error);
  }
}

// PUT /api/products/:id (Admin/Manager)
export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.name && !updates.slug) {
      updates.slug = generateSlug(updates.name);
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Product updated successfully.", product });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/products/:id (Admin/Manager)
export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    next(error);
  }
}

// GET /api/categories
export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await Category.find().populate("parentCategory", "name slug");
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
}

// POST /api/categories (Admin/Manager)
export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, image, parentCategory } = req.body;
    const slug = generateSlug(name);

    const existing = await Category.findOne({ slug });
    if (existing) {
      res.status(400).json({ success: false, message: "Category already exists." });
      return;
    }

    const category = new Category({ name, slug, description, image, parentCategory });
    await category.save();

    res.status(201).json({ success: true, message: "Category created successfully.", category });
  } catch (error) {
    next(error);
  }
}

// GET /api/brands
export async function getBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const brands = await Brand.find();
    res.status(200).json({ success: true, brands });
  } catch (error) {
    next(error);
  }
}

// POST /api/brands (Admin/Manager)
export async function createBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, logo } = req.body;
    const slug = generateSlug(name);

    const existing = await Brand.findOne({ slug });
    if (existing) {
      res.status(400).json({ success: false, message: "Brand already exists." });
      return;
    }

    const brand = new Brand({ name, slug, description, logo });
    await brand.save();

    res.status(201).json({ success: true, message: "Brand created successfully.", brand });
  } catch (error) {
    next(error);
  }
}
