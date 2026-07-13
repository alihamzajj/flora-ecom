import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, ArrowRight, Sparkles, Leaf, ShieldCheck, Heart } from "lucide-react";
import serumImg from "@/assets/serum.png";
import { useQuery } from "@tanstack/react-query";
import { products as staticProducts } from "@/data/products";
import { productService } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data } = useQuery({
    queryKey: ["bestsellers"],
    queryFn: async () => {
      try {
        const res = await productService.getProducts({ limit: 4 });
        if (res.success && res.products.length > 0) {
          return res.products;
        }
        return staticProducts;
      } catch (err) {
        console.warn("Home page products load failed, using local static data fallback:", err);
        return staticProducts;
      }
    },
    initialData: staticProducts,
  });

  const displayProducts = data || [];
  const hero = displayProducts[0] || staticProducts[0];

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative mx-4 rounded-[2rem] px-6 pb-20 pt-16 sm:px-12 lg:px-16 lg:pt-24" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-secondary/40 blur-[120px]" />
          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/50 blur-[140px]" />
        </div>

        <div className="relative grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              {["Skincare", "Glow", "Anti-aging"].map((t) => (
                <span key={t} className="rounded-full border border-foreground/15 bg-background/30 px-3 py-1 text-xs uppercase tracking-widest text-accent backdrop-blur">
                  {t}
                </span>
              ))}
            </div>

            <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Glow Naturally.
              <br />
              <span className="italic text-gradient-gold">Reveal</span> Your Beauty.
            </h1>

            <p className="mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
              Premium skincare rituals formulated with clinically-proven actives and botanical extracts — for radiant, healthy skin at every age.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-7 py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[0_20px_60px_-15px_oklch(0.65_0.22_0/55%)] transition hover:scale-[1.02]"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center rounded-full border border-foreground/20 px-7 py-3.5 text-sm tracking-wide text-foreground transition hover:bg-foreground/5"
              >
                Explore Collection
              </Link>
            </div>

            <div className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                ["120k+", "Rituals shipped"],
                ["4.9", "Average rating"],
                ["100%", "Cruelty free"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="font-display text-2xl text-gradient-gold">{k}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product hero */}
          <div className="relative mx-auto flex h-[520px] w-full max-w-md items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary/50 to-primary/40 blur-3xl animate-pulse-glow" />
            <div className="absolute inset-8 rounded-full border border-foreground/10" />
            <div className="absolute inset-16 rounded-full border border-foreground/5" />

            <img
              src={serumImg}
              alt="FLORA Radiance Serum"
              width={1024}
              height={1280}
              className="relative z-10 h-[520px] w-auto max-w-none animate-float-slow object-contain drop-shadow-[0_40px_60px_oklch(0.20_0.10_10/70%)]"
            />

            <div className="glass absolute bottom-6 left-2 z-20 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_20px_60px_-20px_oklch(0_0_0/60%)]">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Radiance Serum</p>
                <p className="font-display text-sm">Vitamin C + HA</p>
              </div>
            </div>

            <div className="glass absolute right-0 top-10 z-20 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-1 font-display text-xl text-gradient-gold">$49.99</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="my-16 overflow-hidden border-y border-foreground/10 py-6">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-16 pr-16 font-display text-2xl text-muted-foreground/60">
              <span>Radiance</span><span>✦</span>
              <span>Hydration</span><span>✦</span>
              <span>Ritual</span><span>✦</span>
              <span>Botanicals</span><span>✦</span>
              <span>Renewal</span><span>✦</span>
              <span>Glow</span><span>✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Products showcase */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">The Collection</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Bestselling rituals</h2>
          </div>
          <Link to="/products" className="hidden text-sm text-muted-foreground hover:text-accent sm:inline-flex sm:items-center sm:gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.map((p: any) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Leaf, title: "Natural Ingredients", text: "Sourced from ethical farms across the globe." },
            { icon: ShieldCheck, title: "Dermatologist Tested", text: "Clinically validated for all skin types." },
            { icon: Heart, title: "Cruelty Free", text: "Never tested on animals — always on us." },
            { icon: Sparkles, title: "Premium Quality", text: "Small-batch formulations, no compromises." },
          ].map((b) => (
            <div key={b.title} className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6 transition hover:border-accent/40">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/50 to-secondary/40 text-accent">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured product */}
      <section className="mx-4 mt-24 rounded-[2rem] p-10 sm:p-16" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative mx-auto h-96 w-full max-w-sm">
            <div className="absolute inset-0 rounded-full bg-secondary/40 blur-3xl animate-pulse-glow" />
            <img src={hero.image} alt={hero.name} loading="lazy" className="relative h-full w-full object-contain animate-float-slow" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Signature</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">The {hero.name}</h2>
            <p className="mt-4 text-muted-foreground">{hero.description}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {hero.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="h-1 w-4 rounded-full bg-accent" /> {b}
                </li>
              ))}
            </ul>
            <Link
              to="/products/$slug"
              params={{ slug: hero.slug }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-7 py-3.5 text-sm text-primary-foreground transition hover:scale-[1.02]"
            >
              Discover ritual <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Loved by thousands</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Community glow</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Amelia R.", text: "My skin has never looked so plump and luminous. The Radiance Serum is an absolute staple.", initial: "A" },
            { name: "Jasmine K.", text: "The packaging alone is worth it, but the formulas are truly transformative. Obsessed.", initial: "J" },
            { name: "Sofia M.", text: "I ditched my 8-step routine for FLORA's three essentials and my skin thanks me.", initial: "S" },
          ].map((r) => (
            <div key={r.name} className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-display">
                  {r.initial}
                </div>
                <div>
                  <p className="font-medium">{r.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-accent text-accent" />)}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">"{r.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-4 mt-24 rounded-[2rem] px-6 py-16 text-center" style={{ background: "var(--gradient-hero)" }}>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Join</p>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl">The Glow Community</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Rituals, launches and early access — sent with intention.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="flex-1 rounded-full border border-foreground/15 bg-background/40 px-5 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-secondary focus:outline-none"
          />
          <button className="rounded-full bg-gradient-to-r from-primary to-secondary px-7 py-3.5 text-sm text-primary-foreground transition hover:opacity-95">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
