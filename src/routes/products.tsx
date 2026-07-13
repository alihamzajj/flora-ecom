import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { products as staticProducts } from "@/data/products";
import { productService } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Shop — FLORA" },
      { name: "description", content: "Explore FLORA's collection of premium skincare, glow-boosting serums, and ritual essentials." },
      { property: "og:title", content: "Shop — FLORA" },
      { property: "og:description", content: "Explore FLORA's collection of premium skincare and ritual essentials." },
    ],
  }),
  component: Products,
});

const categories = ["All", "Skincare", "Glow", "Anti-aging"];

function Products() {
  const [cat, setCat] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["products", cat],
    queryFn: async () => {
      try {
        const res = await productService.getProducts(
          cat === "All" ? {} : { category: cat.toLowerCase() }
        );
        if (res.success && res.products.length > 0) {
          return res.products;
        }
        return cat === "All"
          ? staticProducts
          : staticProducts.filter((p) => p.category === cat);
      } catch (err) {
        console.warn("Using local static products fallback due to:", err);
        return cat === "All"
          ? staticProducts
          : staticProducts.filter((p) => p.category === cat);
      }
    },
    initialData: cat === "All"
      ? staticProducts
      : staticProducts.filter((p) => p.category === cat),
  });

  const displayProducts = data || [];

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24">
      <header className="py-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Boutique</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Our Collection</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Every FLORA formulation is crafted in small batches with the finest actives.
        </p>
      </header>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-5 py-2 text-sm transition ${
              cat === c
                ? "border-secondary bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                : "border-foreground/15 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayProducts.map((p: any) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </div>
  );
}

