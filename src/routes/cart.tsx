import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — FLORA" },
      { name: "description", content: "Review the FLORA rituals in your bag." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQty, remove, subtotal } = useCart();

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      <header className="py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Your bag</p>
        <h1 className="mt-3 font-display text-5xl">Shopping Bag</h1>
      </header>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-16 text-center">
          <p className="font-display text-2xl">Your bag is empty.</p>
          <p className="mt-2 text-muted-foreground">Discover the rituals your skin has been craving.</p>
          <Link to="/products" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-primary to-secondary px-7 py-3 text-sm text-primary-foreground">
            Shop the collection
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={`${item.product.slug}-${item.size}`} className="flex flex-col gap-4 rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-4 sm:flex-row">
                <div className="grid h-32 w-full shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/40 to-secondary/20 sm:w-32">
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-contain p-2" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg">{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.size} • {item.product.category}</p>
                    </div>
                    <button onClick={() => remove(item.product.slug, item.size)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center rounded-full border border-foreground/15">
                      <button onClick={() => updateQty(item.product.slug, item.size, item.quantity - 1)} className="grid h-8 w-8 place-items-center">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.slug, item.size, item.quantity + 1)} className="grid h-8 w-8 place-items-center">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="font-display text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
            <h3 className="font-display text-xl">Order summary</h3>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>Free</dd></div>
              <div className="flex justify-between border-t border-foreground/10 pt-3 font-display text-lg">
                <dt>Total</dt><dd className="text-gradient-gold">${subtotal.toFixed(2)}</dd>
              </div>
            </dl>
            <Link to="/checkout" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm text-primary-foreground">
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
