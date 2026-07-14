import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { orderService, productService } from "@/lib/api";

export const Route = createFileRoute("/checkout/")({
  head: () => ({
    meta: [
      { title: "Checkout — FLORA" },
      { name: "description", content: "Complete your FLORA order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolveProductId(slug: string, existingId?: string) {
    if (existingId) return existingId;
    const res = await productService.getProductBySlug(slug);
    if (!res.product?.id) throw new Error(`Could not resolve product id for ${slug}`);
    return res.product.id;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0 || submitting) return;

    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim() || "0000000000";
    const street = String(form.get("address") || "").trim();
    const city = String(form.get("city") || "").trim();
    const state = String(form.get("state") || "").trim() || "N/A";
    const zipCode = String(form.get("postal") || "").trim();
    const country = String(form.get("country") || "").trim();

    try {
      const orderItems = [];
      for (const item of items) {
        const productId = await resolveProductId(item.product.slug, item.product.id);
        orderItems.push({
          productId,
          name: item.product.name,
          size: item.size,
          quantity: item.quantity,
        });
      }

      const shippingAddress = {
        name: `${firstName} ${lastName}`.trim(),
        street,
        city,
        state,
        country,
        zipCode,
        phone,
        email,
      };

      const created = await orderService.createOrder({
        orderItems,
        shippingAddress,
        billingAddress: shippingAddress,
      });

      // No Stripe keys → mock mode: confirm payment so order is marked paid in MongoDB
      if (created.checkoutUrl?.includes("mock=true") || created.checkoutUrl?.includes("/checkout/success")) {
        await orderService.confirmPayment(String(created.orderId));
        clear();
        toast.success("Order placed successfully");
        navigate({
          to: "/checkout/success",
          search: { orderId: String(created.orderId) },
        });
        return;
      }

      clear();
      window.location.href = created.checkoutUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to place order";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      <header className="py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Secure Checkout</p>
        <h1 className="mt-3 font-display text-display-xl">Complete your ritual</h1>
      </header>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <section className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
            <h2 className="font-display text-xl">Contact</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field name="email" label="Email" type="email" placeholder="you@flora.com" required className="sm:col-span-2" />
              <Field name="phone" label="Phone" type="tel" placeholder="+1 555 000 0000" required className="sm:col-span-2" />
            </div>
          </section>

          <section className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
            <h2 className="font-display text-xl">Shipping</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field name="firstName" label="First name" required />
              <Field name="lastName" label="Last name" required />
              <Field name="address" label="Address" required className="sm:col-span-2" />
              <Field name="city" label="City" required />
              <Field name="state" label="State / Region" required />
              <Field name="postal" label="Postal code" required />
              <Field name="country" label="Country" required className="sm:col-span-2" />
            </div>
          </section>

          <section className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
            <h2 className="flex items-center gap-2 font-display text-xl">
              <Lock className="h-4 w-4 text-accent" /> Payment
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Card fields are for demo UI only. Without Stripe keys, your order is saved to MongoDB and marked paid in sandbox mode.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field name="card" label="Card number" placeholder="•••• •••• •••• ••••" className="sm:col-span-2" autoComplete="off" />
              <Field name="expiry" label="Expiry" placeholder="MM / YY" autoComplete="off" />
              <Field name="cvc" label="CVC" placeholder="•••" autoComplete="off" />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
          <h3 className="font-display text-xl">Your order</h3>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Your bag is empty.{" "}
              <Link to="/products" className="text-accent">
                Continue shopping
              </Link>
              .
            </p>
          ) : (
            <>
              <ul className="mt-4 space-y-3">
                {items.map((i) => (
                  <li key={`${i.product.slug}-${i.size}`} className="flex justify-between text-sm">
                    <span className="min-w-0 truncate">
                      {i.product.name} ({i.size}) × {i.quantity}
                    </span>
                    <span>${(i.product.price * i.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-2 border-t border-foreground/10 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{subtotal > 100 ? "Free" : "$10.00"}</dd>
                </div>
                <div className="flex justify-between border-t border-foreground/10 pt-3 font-display text-lg">
                  <dt>Est. total*</dt>
                  <dd className="text-gradient-gold">${subtotal.toFixed(2)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-[11px] text-muted-foreground">*Final total may include tax from the server.</p>
            </>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={items.length === 0 || submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Placing order…
              </>
            ) : (
              "Place order"
            )}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  className = "",
  ...props
}: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-foreground/15 bg-background/40 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-secondary focus:outline-none"
      />
    </label>
  );
}
