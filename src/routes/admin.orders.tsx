import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, RefreshCw, Package } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/lib/api";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — FLORA Owner" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOrdersPage,
});

type Order = {
  _id: string;
  orderItems: { name: string; size: string; quantity: number; price: number }[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    email?: string;
  };
  paymentStatus: string;
  orderStatus: string;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  createdAt: string;
};

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

function AdminOrdersPage() {
  const { ready, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getAllOrders();
      setOrders(res.orders ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load orders";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    if (!isAdmin) {
      navigate({ to: "/admin/login" });
      return;
    }
    void loadOrders();
  }, [ready, isAdmin]);

  async function onStatusChange(orderId: string, orderStatus: string) {
    setUpdatingId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, orderStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus } : o)));
      toast.success("Order status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!ready || !isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4 py-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Owner dashboard</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Customer orders</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as {user?.email}. Orders load live from MongoDB.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground/5"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate({ to: "/admin/login" });
            }}
            className="rounded-full border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground/5"
          >
            Log out
          </button>
          <Link to="/" className="rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm text-primary-foreground">
            Store front
          </Link>
        </div>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Total orders" value={String(orders.length)} />
        <Stat
          label="Paid"
          value={String(orders.filter((o) => o.paymentStatus === "paid").length)}
        />
        <Stat
          label="Revenue"
          value={`$${orders
            .filter((o) => o.paymentStatus === "paid")
            .reduce((s, o) => s + (o.totalPrice || 0), 0)
            .toFixed(2)}`}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading orders…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] py-16 text-center">
          <Package className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order._id}
              className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl">#{order._id.slice(-8)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()} · Full id: {order._id}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge tone={order.paymentStatus === "paid" ? "good" : "warn"}>
                    {order.paymentStatus}
                  </Badge>
                  <label className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-3 py-1.5">
                    <span className="text-muted-foreground">Status</span>
                    <select
                      value={order.orderStatus}
                      disabled={updatingId === order._id}
                      onChange={(e) => void onStatusChange(order._id, e.target.value)}
                      className="bg-transparent text-foreground outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-background text-foreground">
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Customer</h3>
                  <p className="mt-2 font-medium">{order.shippingAddress?.name}</p>
                  {order.shippingAddress?.email && (
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.email}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{order.shippingAddress?.phone}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {order.shippingAddress?.street}
                    <br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                    {order.shippingAddress?.zipCode}
                    <br />
                    {order.shippingAddress?.country}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Items</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    {(order.orderItems || []).map((item, idx) => (
                      <li key={idx} className="flex justify-between gap-3">
                        <span>
                          {item.name} ({item.size}) × {item.quantity}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-4 space-y-1 border-t border-foreground/10 pt-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <dt>Shipping</dt>
                      <dd>${Number(order.shippingPrice || 0).toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <dt>Tax</dt>
                      <dd>${Number(order.taxPrice || 0).toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between font-display text-lg">
                      <dt>Total</dt>
                      <dd className="text-accent">${Number(order.totalPrice || 0).toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl text-gradient-gold">{value}</p>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "good" | "warn" }) {
  return (
    <span
      className={`rounded-full px-3 py-1 uppercase tracking-wider ${
        tone === "good"
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-amber-500/15 text-amber-200"
      }`}
    >
      {children}
    </span>
  );
}
