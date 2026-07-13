import { Request, Response, NextFunction } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Coupon } from "../models/Coupon.js";
import { createStripeSession, isStripeConfigured } from "../services/stripeService.js";
import { sendEmail } from "../services/emailService.js";

// Helper to send invoice email
async function sendInvoiceEmail(order: any, customerEmail: string) {
  const itemsHtml = order.orderItems
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} (${item.size})</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #c5a880; text-align: center;">Thank you for your order!</h2>
      <p>Your order <strong>#${order._id}</strong> has been received and is being processed.</p>
      
      <h3>Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f9f9f9;">
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Item</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; text-align: right; line-height: 1.6;">
        <p>Shipping: $${order.shippingPrice.toFixed(2)}</p>
        <p>Tax: $${order.taxPrice.toFixed(2)}</p>
        <p style="font-size: 18px; font-weight: bold; color: #c5a880;">Total: $${order.totalPrice.toFixed(2)}</p>
      </div>

      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999; text-align: center;">FLORA Skincare Rituals & Beauty</p>
    </div>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Your FLORA Invoice - Order #${order._id}`,
    html,
  });
}

// POST /api/orders
export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId; // Optional, guest checkout allowed
    const { orderItems, shippingAddress, billingAddress, couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ success: false, message: "No items in order." });
      return;
    }

    // 1. Validate Stock & Calculate Prices
    let subtotal = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({ success: false, message: `Product ${item.name} not found.` });
        return;
      }

      // Check stock for the selected variant size
      const variant = product.variants.find((v) => v.size === item.size);
      if (!variant) {
        res.status(400).json({ success: false, message: `Size ${item.size} not found for ${product.name}.` });
        return;
      }

      if (variant.inventory < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (${item.size}). Only ${variant.inventory} left.`,
        });
        return;
      }

      const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
      subtotal += price * item.quantity;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        quantity: item.quantity,
        size: item.size,
        price: price,
      });
    }

    // 2. Coupon deduction
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        if (!coupon.expirationDate || coupon.expirationDate > now) {
          if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            if (!coupon.minPurchaseAmount || subtotal >= coupon.minPurchaseAmount) {
              if (coupon.discountType === "percentage") {
                discount = (subtotal * coupon.discountAmount) / 100;
              } else {
                discount = coupon.discountAmount;
              }
              coupon.usedCount += 1;
              await coupon.save();
            }
          }
        }
      }
    }

    const shippingPrice = subtotal > 100 ? 0 : 10.0;
    const taxPrice = Number((subtotal * 0.08).toFixed(2)); // 8% tax
    const totalPrice = Number((subtotal + shippingPrice + taxPrice - discount).toFixed(2));

    // 3. Create order
    const order = new Order({
      user: userId,
      orderItems: validatedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus: "pending",
    });

    await order.save();

    // 4. Create Stripe payment session or mock bypass
    if (isStripeConfigured()) {
      let email = shippingAddress.email;
      if (userId) {
        const user = await User.findById(userId);
        if (user) email = user.email;
      }

      const session = await createStripeSession({
        orderId: order._id.toString(),
        items: validatedItems,
        customerEmail: email,
        shippingPrice,
        taxPrice,
        discountAmount: discount,
      });

      res.status(201).json({
        success: true,
        orderId: order._id,
        checkoutUrl: session.url,
      });
    } else {
      // Mock sandbox checkout path
      res.status(201).json({
        success: true,
        orderId: order._id,
        checkoutUrl: `/checkout/success?order_id=${order._id}&mock=true`,
      });
    }
  } catch (error) {
    next(error);
  }
}

// POST /api/orders/confirm-payment
export async function confirmOrderPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    if (order.paymentStatus === "paid") {
      res.status(200).json({ success: true, message: "Order already paid.", order });
      return;
    }

    // Update order status
    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    await order.save();

    // Deplete inventory
    for (const item of order.orderItems) {
      await Product.updateOne(
        { _id: item.product, "variants.size": item.size },
        { $inc: { "variants.$.inventory": -item.quantity } }
      );
    }

    // Clear cart if user logged in
    if (order.user) {
      await User.findByIdAndUpdate(order.user, { $set: { cart: [] } });
    }

    // Get email to send invoice
    let email = order.shippingAddress.phone; // fallback phone
    if (order.user) {
      const user = await User.findById(order.user);
      if (user) email = user.email;
    }

    if (email.includes("@")) {
      await sendInvoiceEmail(order, email);
    }

    res.status(200).json({ success: true, message: "Order payment confirmed.", order });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/my-orders
export async function getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/:id
export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "name email");

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    // Protect order details (only owner or admins can fetch)
    if (req.user?.role === "customer" && order.user && (order.user as any)._id.toString() !== req.user.userId) {
      res.status(403).json({ success: false, message: "Forbidden." });
      return;
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders (Admin/Manager)
export async function getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
}

// PUT /api/orders/:id/status (Admin/Manager)
export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    res.status(200).json({ success: true, message: "Order status updated successfully.", order });
  } catch (error) {
    next(error);
  }
}
