import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — FLORA" },
      { name: "description", content: "Get in touch with FLORA's concierge team." },
      { property: "og:title", content: "Contact — FLORA" },
      { property: "og:description", content: "Get in touch with FLORA's concierge team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      <header className="py-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Concierge</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Say hello</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Our team is here to help with product advice, orders, and ritual guidance.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: "alihamzabhatti@gmail.com" },
            { icon: Phone, label: "Phone", value: "+1 (800) 555-GLOW" },
            { icon: MapPin, label: "Studio", value: "18 Rue de la Rose, Paris" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/50 to-secondary/40 text-accent">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
                <p className="truncate">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); alert("Thanks — we'll be in touch."); }}
          className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-1">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Name</span>
              <input required className="w-full rounded-xl border border-foreground/15 bg-background/40 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
            </label>
            <label className="block sm:col-span-1">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <input type="email" required className="w-full rounded-xl border border-foreground/15 bg-background/40 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Message</span>
              <textarea required rows={5} className="w-full rounded-xl border border-foreground/15 bg-background/40 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
            </label>
          </div>
          <button className="mt-5 rounded-full bg-gradient-to-r from-primary to-secondary px-7 py-3.5 text-sm text-primary-foreground transition hover:opacity-95">
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
