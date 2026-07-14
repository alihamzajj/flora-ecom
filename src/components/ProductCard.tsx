import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { add, open } = useCart();
  const category =
    typeof product.category === "string"
      ? product.category
      : (product.category as { name?: string })?.name || "Skincare";

  return (
    <div className="group relative flex flex-col rounded-3xl border border-foreground/10 bg-foreground/[0.04] p-4 sm:p-5">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block h-56 rounded-2xl bg-gradient-to-br from-primary/30 via-wine to-background sm:h-64"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="relative z-10 h-full w-full max-w-full object-contain p-5 sm:p-6"
        />
        <span className="absolute left-3 top-3 z-20 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-widest text-accent">
          {category}
        </span>
      </Link>

      <div className="mt-4 flex flex-1 flex-col sm:mt-5">
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
          type="button"
          onClick={() => {
            add(product, product.sizes[0], 1);
            open();
          }}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-foreground/5 px-4 py-2.5 text-sm transition hover:border-secondary/60 hover:bg-secondary/20"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to bag
        </button>
      </div>
    </div>
  );
}
