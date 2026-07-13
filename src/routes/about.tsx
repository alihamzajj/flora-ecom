import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — FLORA" },
      { name: "description", content: "FLORA is a modern beauty house committed to ritual, radiance and results." },
      { property: "og:title", content: "About — FLORA" },
      { property: "og:description", content: "FLORA is a modern beauty house committed to ritual, radiance and results." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-24">
      <header className="py-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Our story</p>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl">
          A ritual house of <span className="italic text-gradient-gold">radiance</span>
        </h1>
      </header>

      <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
        <p>
          FLORA was born from a simple belief: skincare should feel like a ritual, not a routine.
          Every formulation is developed in our lab at the intersection of botanical wisdom and
          clinical science — small-batch, ethically sourced, and dermatologist tested.
        </p>
        <p>
          From our signature Radiance Serum to our overnight Renewal Mask, each product is designed
          to become a moment in your day — a pause, a breath, a glow.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          ["Founded", "2021"],
          ["Products", "24"],
          ["Countries", "38"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-8 text-center">
            <p className="font-display text-4xl text-gradient-gold">{v}</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{k}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] p-10 text-center" style={{ background: "var(--gradient-hero)" }}>
        <h2 className="font-display text-3xl">Discover the ritual</h2>
        <Link to="/products" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-primary to-secondary px-7 py-3.5 text-sm text-primary-foreground">
          Shop the collection
        </Link>
      </div>
    </div>
  );
}
