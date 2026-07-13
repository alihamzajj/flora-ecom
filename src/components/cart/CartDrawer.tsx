import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const { isOpen, close, items, updateQty, remove, subtotal } = useCart();

  return (
    <div
      className={`fixed inset-0 z-[60] transition ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-5">
          <h3 className="font-display text-xl">Your Bag</h3>
          <button onClick={close} className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-foreground/5 text-2xl">✦</div>
              <p className="mt-4 text-sm text-muted-foreground">Your bag is empty.</p>
              <Link
                to="/products"
                onClick={close}
                className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Shop products
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={`${item.product.slug}-${item.size}`}
                  className="flex gap-4 rounded-2xl bg-foreground/[0.03] p-3"
                >
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/40 to-secondary/20">
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-contain" loading="lazy" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.size}</p>
                      </div>
                      <button
                        onClick={() => remove(item.product.slug, item.size)}
                        className="text-muted-foreground transition hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-foreground/15">
                        <button
                          onClick={() => updateQty(item.product.slug, item.size, item.quantity - 1)}
                          className="grid h-7 w-7 place-items-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.product.slug, item.size, item.quantity + 1)}
                          className="grid h-7 w-7 place-items-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-foreground/10 px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-xl">${subtotal.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
            <Link
              to="/checkout"
              onClick={close}
              className="mt-4 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm font-medium tracking-wide text-primary-foreground transition hover:opacity-95"
            >
              Checkout — ${subtotal.toFixed(2)}
            </Link>
            <Link
              to="/cart"
              onClick={close}
              className="mt-2 flex items-center justify-center rounded-full border border-foreground/15 px-6 py-3 text-sm transition hover:bg-foreground/5"
            >
              View bag
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
