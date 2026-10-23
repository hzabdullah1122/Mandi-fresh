"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money, formatDate } from "@/lib/format";
import StatusBadge, { STATUSES } from "@/components/StatusBadge";
import Select from "@/components/Select";
import { useToast } from "@/components/Toast";

export default function OrdersAdmin({ token }) {
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const load = useCallback(() => {
    api("/admin/orders", { token })
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, [token]);
  useEffect(load, [load]);

  const setStatus = async (id, status) => {
    try {
      await api(`/admin/orders/${id}`, { method: "PATCH", token, body: { status } });
      toast.success(`${id} is now "${status}"`);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const shown = (orders || []).filter((o) => filter === "All" || o.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/60">{orders ? `${shown.length} order(s)` : ""}</p>
        <Select
          className="w-48"
          value={filter}
          onChange={setFilter}
          options={["All", ...STATUSES]}
          ariaLabel="Filter by status"
        />
      </div>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
      {!orders && !error && <p className="mt-6 text-ink/60">Loading…</p>}
      {orders && shown.length === 0 && <p className="mt-6 text-ink/60">No orders here yet.</p>}

      <ul className="mt-5 space-y-4">
        {shown.map((o) => (
          <li key={o.id} className="rounded-md border border-ink/10 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-lg font-semibold">{o.id}</p>
                <p className="text-sm text-ink/60">{formatDate(o.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <Select
                  compact
                  className="w-44"
                  value={o.status}
                  onChange={(s) => setStatus(o.id, s)}
                  options={STATUSES}
                  ariaLabel="Change status"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-ink/50">Customer</p>
                <p>{o.customer.name}</p>
                <p className="text-ink/60">{o.customer.email}</p>
              </div>
              <div>
                <p className="text-ink/50">Deliver to</p>
                <p>{o.address}</p>
              </div>
              <div>
                <p className="text-ink/50">Items</p>
                {o.items.map((i) => (
                  <p key={i.id}>
                    {i.name} <span className="text-ink/50">× {i.qty}</span>
                  </p>
                ))}
                <p className="mt-1 font-medium">Total {money(o.total)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
