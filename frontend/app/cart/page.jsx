"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { money } from "@/lib/format";

export default function CartPage() {
  const { cart, setQty, cartTotal, clearCart, user, token } = useApp();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    if (!user) return router.push("/login");
    setLoading(true);
    setError("");
    try {
      const o = await api("/orders", {
        method: "POST",
        token,
        body: { address, items: cart.map((i) => ({ id: i.product.id, qty: i.qty })) },
      });
      setOrder(o);
      clearCart();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (order)
    return (
      <div className="page-narrow flex min-h-[calc(100vh-14rem)] max-w-xl flex-col items-center justify-center py-16 text-center 2xl:max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Thank you, your order is in.</h1>
        <p className="mt-4 text-ink/70">
          Order <b>{order.id}</b> for {money(order.total)} will be delivered to {order.address}. Pay
          cash when it arrives.
        </p>
        <Link href="/products" className="btn mt-8">Keep shopping</Link>
      </div>
    );

  if (cart.length === 0)
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
          <path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6" />
          <circle cx="9.5" cy="19.5" r="1.2" />
          <circle cx="17" cy="19.5" r="1.2" />
        </svg>
        <h1 className="text-3xl font-semibold sm:text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-ink/70">Add a few things and they will show up here.</p>
        <Link href="/products" className="btn mt-8">Browse the shop</Link>
      </div>
    );

  return (
    <div className="container-x grid gap-10 py-10 md:py-12 lg:grid-cols-3 lg:gap-12 2xl:grid-cols-[1fr_28rem] 2xl:py-16">
      <div className="lg:col-span-2 2xl:col-span-1">
        <h1 className="text-3xl font-semibold md:text-4xl">Cart</h1>
        <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          {cart.map(({ product, qty }) => (
            <li key={product.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt="" className="h-16 w-16 rounded-md object-cover sm:h-20 sm:w-20" />
              <div className="min-w-0 flex-1 basis-40">
                <p className="font-serif text-lg">{product.name}</p>
                <p className="text-sm text-ink/60">
                  {money(product.price)} · {product.unit}
                </p>
              </div>
              <div className="flex items-center rounded-md border border-ink/20 text-sm">
                <button onClick={() => setQty(product.id, qty - 1)} className="px-3 py-1.5">−</button>
                <span className="w-6 text-center">{qty}</span>
                <button onClick={() => setQty(product.id, qty + 1)} className="px-3 py-1.5">+</button>
              </div>
              <p className="ml-auto w-24 text-right font-medium">{money(product.price * qty)}</p>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-md bg-sand p-6">
        <h2 className="text-xl font-semibold">Checkout</h2>
        <div className="mt-4 flex justify-between">
          <span>Total</span>
          <b>{money(cartTotal)}</b>
        </div>
        <p className="mt-1 text-xs text-ink/60">Cash on delivery</p>
        <textarea
          className="input mt-5"
          rows={3}
          placeholder="Delivery address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {error && <p className="mt-2 text-sm text-clay">{error}</p>}
        <button onClick={checkout} disabled={loading || !address.trim()} className="btn mt-4 w-full">
          {loading ? "Placing order…" : user ? "Place order" : "Log in to place order"}
        </button>
      </aside>
    </div>
  );
}
