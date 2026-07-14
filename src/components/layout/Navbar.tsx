import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { SearchDialog } from "@/components/SearchDialog";

export function Navbar() {
  const { count, open } = useCart();
  const { isAdmin } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav className="glass flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-display font-bold text-foreground shadow-[0_0_20px_oklch(0.65_0.22_0/40%)]">
              F
            </span>
            <span className="font-display text-base tracking-[0.18em] sm:text-lg sm:tracking-[0.25em]">FLORA</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {[
              { to: "/products", label: "Products" },
              { to: "/products", label: "Collections" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map((l, i) => (
              <Link
                key={i}
                to={l.to}
                className="text-sm text-foreground/80 transition-colors hover:text-accent"
                activeProps={{ className: "text-accent" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground"
              aria-label="Search products"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              to={isAdmin ? "/admin/orders" : "/admin/login"}
              className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground"
              aria-label={isAdmin ? "Owner orders" : "Owner login"}
              title={isAdmin ? "Owner orders" : "Owner login"}
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={open}
              className="relative grid h-9 w-9 place-items-center rounded-full text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-secondary px-1 text-[10px] font-semibold text-secondary-foreground">
                  {count}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
