import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { productService } from "@/lib/api";
import type { Product } from "@/data/products";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchDialog({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSearched(false);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({ search: q, limit: 8 });
        setResults(res.products ?? []);
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden border-foreground/15 bg-background p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-foreground/10 px-4 py-3">
          <DialogTitle className="sr-only">Search products</DialogTitle>
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search serums, creams, masks…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim().length < 2 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </p>
          )}

          {searched && !loading && results.length === 0 && query.trim().length >= 2 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No products found for “{query.trim()}”.
            </p>
          )}

          <ul className="space-y-1">
            {results.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-foreground/5"
                >
                  <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-contain bg-foreground/5" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.category} · ${p.price.toFixed(2)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
