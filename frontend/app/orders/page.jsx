"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { money, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export default function OrdersPage() {
  const { user, token, ready } = useApp();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api("/orders", { token })
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    setError("");
    try {
      await api(`/orders/${id}/cancel`, { method: "PATCH", token });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!ready) return <p className="container-x py-12 text-ink/60">Loading…</p>;

  if (!user)
    return (
      <div className="page-narrow flex min-h-[calc(100vh-14rem)] max-w-md flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-semibold">Log in to see your orders</h1>
        <Link href="/login" className="btn mt-6">Log in</Link>
      </div>
    );

  if (orders?.length === 0)
    return (
      <div className="page-narrow flex min-h-[calc(100vh-14rem)] max-w-xl flex-col items-center justify-center py-16 text-center 2xl:max-w-2xl">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-5 h-14 w-14 text-leaf/70"
          aria-hidden="true"
        >
          <path d="M4 7.5L12 3l8 4.5v9L12 21l-8-4.5v-9z" />
          <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
        </svg>
        <h1 className="text-3xl font-semibold sm:text-4xl">No orders yet</h1>
        <p className="mt-3 text-ink/70">When you place an order, you can follow it here.</p>
        <Link href="/products" className="btn mt-8">Start shopping</Link>
      </div>
    );

  return (
    <div className="container-x py-10 md:py-12 2xl:py-16">
      <h1 className="text-3xl font-semibold md:text-4xl 2xl:text-5xl">My orders</h1>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
      {!orders && !error && <p className="mt-8 text-ink/60">Loading…</p>}

      <ul className="mt-8 space-y-5">
        {orders?.map((o) => (
          <li key={o.id} className="rounded-md border border-ink/10 bg-white p-5 2xl:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-serif text-lg font-semibold">{o.id}</p>
                <p className="text-sm text-ink/60">{formatDate(o.createdAt)}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10 text-sm">
              {o.items.map((i) => (
                <li key={i.id} className="flex justify-between py-2">
                  <span>
                    {i.name} <span className="text-ink/50">× {i.qty}</span>
                  </span>
                  <span>{money(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <p className="max-w-md text-sm text-ink/60">Deliver to: {o.address}</p>
              <div className="flex items-center gap-4">
                <p className="font-medium">Total {money(o.total)}</p>
                {o.status === "Placed" && (
                  <button onClick={() => cancel(o.id)} className="text-sm font-medium text-clay underline underline-offset-4">
                    Cancel order
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
