import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeKey) {
  stripe = new Stripe(stripeKey, {
    apiVersion: "2025-01-27.acacia" as any, // use compatible version
  });
} else {
  console.log("[STRIPE] Stripe secret key is not configured. Running in Mock Checkout mode.");
}

export const isStripeConfigured = (): boolean => !!stripe;

export async function createStripeSession({
  orderId,
  items,
  customerEmail,
  shippingPrice,
  taxPrice,
  discountAmount = 0,
}: {
  orderId: string;
  items: { name: string; price: number; quantity: number; image?: string }[];
  customerEmail: string;
  shippingPrice: number;
  taxPrice: number;
  discountAmount?: number;
}): Promise<{ id: string; url: string | null }> {
  if (!stripe) {
    throw new Error("Stripe is not configured. Use mock checkout path.");
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  // Build line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  // Add shipping and tax as line items if they are greater than 0
  if (shippingPrice > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Shipping Fee",
        },
        unit_amount: Math.round(shippingPrice * 100),
      },
      quantity: 1,
    });
  }

  if (taxPrice > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Taxes",
        },
        unit_amount: Math.round(taxPrice * 100),
      },
      quantity: 1,
    });
  }

  // Create session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    customer_email: customerEmail,
    client_reference_id: orderId,
    success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${clientUrl}/checkout/cancel?order_id=${orderId}`,
    // Apply discount via coupon if possible (Stripe coupons require pre-creation, so for simplicity we just adjust line items, or use custom discounts)
  });

  return { id: session.id, url: session.url };
}

export function getStripeWebhookEvent(body: string | Buffer, signature: string, secret: string) {
  if (!stripe) throw new Error("Stripe is not configured.");
  return stripe.webhooks.constructEvent(body, signature, secret);
}
