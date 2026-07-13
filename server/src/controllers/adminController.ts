import { Request, Response, NextFunction } from "express";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";

// GET /api/admin/analytics
export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const paidOrders = await Order.find({ paymentStatus: "paid" });

    // 1. Total revenue
    const revenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // 2. Total orders
    const ordersCount = await Order.countDocuments();

    // 3. Total customers
    const customersCount = await User.countDocuments({ role: "customer" });

    // 4. Inventory alerts: check products where variant inventory is low (< 5)
    const products = await Product.find();
    const inventoryAlerts: any[] = [];
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.inventory < 5) {
          inventoryAlerts.push({
            productId: p._id,
            name: p.name,
            size: v.size,
            inventory: v.inventory,
            sku: v.sku,
          });
        }
      });
    });

    // 5. Best sellers (group by product in paid orders)
    const salesMap: Record<string, { name: string; qty: number; sales: number }> = {};
    paidOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const prodId = item.product.toString();
        if (salesMap[prodId]) {
          salesMap[prodId].qty += item.quantity;
          salesMap[prodId].sales += item.price * item.quantity;
        } else {
          salesMap[prodId] = {
            name: item.name,
            qty: item.quantity,
            sales: item.price * item.quantity,
          };
        }
      });
    });

    const bestSellers = Object.keys(salesMap)
      .map((id) => ({
        id,
        ...salesMap[id],
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // 6. Recent sales
    const recentSales = await Order.find({ paymentStatus: "paid" })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      analytics: {
        revenue: Number(revenue.toFixed(2)),
        ordersCount,
        customersCount,
        inventoryAlerts,
        bestSellers,
        recentSales,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/users
export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/users/:id/role
export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["customer", "manager", "admin"].includes(role)) {
      res.status(400).json({ success: false, message: "Invalid role specified." });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({ success: true, message: "User role updated successfully.", user });
  } catch (error) {
    next(error);
  }
}
