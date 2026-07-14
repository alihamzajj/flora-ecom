import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Owner Login — FLORA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login, isAdmin, ready } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (ready && isAdmin) {
      navigate({ to: "/admin/orders" });
    }
  }, [ready, isAdmin, navigate]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    try {
      const next = await login(email, password);
      if (next.role !== "admin" && next.role !== "manager") {
        setError("This account is not an owner/admin.");
        toast.error("Owner access only");
        return;
      }
      toast.success("Welcome back");
      navigate({ to: "/admin/orders" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 pb-24">
      <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Owner</p>
            <h1 className="font-display text-3xl">Admin login</h1>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Sign in with your private owner account to view customer orders.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4" autoComplete="on">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="username"
              className="w-full rounded-xl border border-foreground/15 bg-background/40 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Password</span>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-foreground/15 bg-background/40 px-4 py-3 pr-20 text-sm focus:border-secondary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm text-primary-foreground disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in as owner"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="text-accent hover:underline">
            Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
