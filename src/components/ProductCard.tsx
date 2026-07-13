import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { add, open } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-b from-foreground/[0.04] to-transparent p-5 transition duration-500 hover:-translate-y-1 hover:border-secondary/40">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/40 via-wine to-background"
      >
        <div className="absolute inset-0 opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
             style={{ background: "radial-gradient(circle at 50% 60%, oklch(0.65 0.22 0 / 45%), transparent 60%)" }} />
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="relative h-full w-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
        />
        <span className="absolute left-4 top-4 rounded-full bg-background/60 px-3 py-1 text-[10px] uppercase tracking-widest text-accent backdrop-blur">
          {product.category}
        </span>
      </Link>

      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg">{product.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{product.tagline}</p>
          </div>
          <p className="shrink-0 font-display text-lg text-accent">${product.price.toFixed(2)}</p>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.round(product.rating) ? "fill-accent text-accent" : "text-foreground/20"}`}
            />
          ))}
          <span className="ml-1">{product.rating} ({product.reviews})</span>
        </div>

        <button
          onClick={() => {
            add(product, product.sizes[0], 1);
            open();
          }}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-foreground/5 px-4 py-2.5 text-sm transition hover:border-secondary/60 hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-primary-foreground"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to bag
        </button>
      </div>
    </div>
  );
}
