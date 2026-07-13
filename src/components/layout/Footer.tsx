import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-foreground/10 px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-display font-bold">
              F
            </span>
            <span className="font-display text-lg tracking-[0.25em]">FLORA</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Ritual skincare, refined for radiance. Crafted in small batches with clinically proven actives.
          </p>
        </div>

        {[
          { title: "Shop", links: [["Products", "/products"], ["Cart", "/cart"], ["Checkout", "/checkout"]] as const },
          { title: "Company", links: [["About", "/about"], ["Contact", "/contact"]] as const },
          { title: "Care", links: [["Contact", "/contact"], ["About", "/about"]] as const },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs uppercase tracking-[0.25em] text-accent">{col.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-foreground/10 pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} FLORA Beauty. All rights reserved.
      </div>
    </footer>
  );
}
