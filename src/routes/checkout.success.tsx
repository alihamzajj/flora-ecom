import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: z.object({
    orderId: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Order confirmed — FLORA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  const { orderId } = Route.useSearch();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <Check className="h-8 w-8" />
      </div>
      <h1 className="mt-8 font-display text-4xl">Order placed</h1>
      <p className="mt-3 text-muted-foreground">
        Thank you — your order was saved to the database
        {orderId ? (
          <>
            {" "}
            as <span className="text-accent">#{orderId}</span>
          </>
        ) : null}
        .
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/products"
          className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm text-primary-foreground"
        >
          Continue shopping
        </Link>
        <Link to="/" className="rounded-full border border-foreground/20 px-6 py-3 text-sm hover:bg-foreground/5">
          Home
        </Link>
      </div>
    </div>
  );
}
