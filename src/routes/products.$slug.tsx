import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Minus, Plus, ShoppingBag, Heart, ArrowRight } from "lucide-react";
import { getProduct, products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";

import { productService } from "@/lib/api";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await productService.getProductBySlug(params.slug);
      if (res.success && res.product) {
        return { product: res.product };
      }
    } catch (err) {
      console.warn("Product backend load failed, using local static data fallback:", err);
    }
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — FLORA` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — FLORA` },
          { property: "og:description", content: loaderData.product.description },
        ]
      : [{ title: "Product not found — FLORA" }],
  }),
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md py-32 text-center">
      <h1 className="font-display text-4xl">Not found</h1>
      <p className="mt-3 text-muted-foreground">This product doesn't exist.</p>
      <Link to="/products" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">
        Back to shop
      </Link>
    </div>
  ),
});

function ProductDetail() {
  const { product } = Route.useLoaderData() as { product: import("@/data/products").Product };
  const { add, open } = useCart();
  const [size, setSize] = useState<string>(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24">
      <div className="grid gap-12 py-12 lg:grid-cols-2">
        {/* Image */}
        <div
          className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-[1.5rem] sm:h-[420px] sm:rounded-[2rem] lg:h-[520px]"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute inset-12 rounded-full bg-secondary/20 animate-pulse-glow" />
          <div className="pointer-events-none absolute inset-10 hidden rounded-full bg-secondary/35 blur-3xl md:block" />
          <img
            src={product.image}
            alt={product.name}
            width={800}
            height={1000}
            decoding="async"
            className="relative z-10 h-full w-full max-w-full animate-float-slow object-contain p-8 sm:p-12 lg:p-16"
          />
        </div>

        {/* Details */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">
            {typeof product.category === "string" ? product.category : (product.category as { name?: string })?.name || "Skincare"}
          </p>
          <h1 className="mt-3 font-display text-display-lg sm:text-5xl">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.tagline}</p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-accent text-accent" : "text-foreground/20"}`} />
            ))}
            <span className="text-muted-foreground">{product.rating} • {product.reviews} reviews</span>
          </div>

          <p className="mt-6 font-display text-3xl text-accent sm:text-4xl">${product.price.toFixed(2)}</p>

          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Size</p>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-full border px-5 py-2 text-sm transition ${
                    size === s ? "border-secondary bg-secondary/20 text-foreground" : "border-foreground/15 text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-foreground/20">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center hover:bg-foreground/5">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center hover:bg-foreground/5">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button className="grid h-11 w-11 place-items-center rounded-full border border-foreground/20 text-muted-foreground transition hover:text-secondary">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => { add(product, size, qty); open(); }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-foreground/20 bg-foreground/5 px-6 py-3.5 text-sm transition hover:bg-foreground/10"
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
            <Link
              to="/checkout"
              onClick={() => add(product, size, qty)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm text-primary-foreground transition hover:opacity-95"
            >
              Buy Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5">
              <h3 className="font-display text-lg">Ingredients</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {product.ingredients.map((i) => <li key={i}>· {i}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5">
              <h3 className="font-display text-lg">Benefits</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {product.benefits.map((i) => <li key={i}>· {i}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="mb-6 font-display text-3xl">You may also love</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </div>
    </div>
  );
}
