"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import ProductsAdmin from "@/components/admin/ProductsAdmin";
import OrdersAdmin from "@/components/admin/OrdersAdmin";
import MessagesAdmin from "@/components/admin/MessagesAdmin";

const tabs = ["Products", "Orders", "Messages"];

export default function AdminPage() {
  const { user, token, ready } = useApp();
  const [tab, setTab] = useState("Products");

  if (!ready) return <p className="container-x py-12 text-ink/60">Loading…</p>;

  if (!user || user.role !== "admin")
    return (
      <div className="page-narrow flex min-h-[calc(100vh-14rem)] max-w-md flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-semibold">{user ? "Admins only" : "Log in as admin"}</h1>
        <p className="mt-3 text-ink/70">
          {user ? "Your account does not have access to this page." : "Please log in with an admin account."}
        </p>
        <Link href={user ? "/" : "/login"} className="btn mt-6">
          {user ? "Back to home" : "Log in"}
        </Link>
      </div>
    );

  return (
    <div className="container-x py-10 md:py-12 2xl:py-16">
      <h1 className="text-3xl font-semibold md:text-4xl 2xl:text-5xl">Admin</h1>
      <p className="mt-2 text-ink/60">Manage products, orders and customer messages.</p>

      <div className="mt-6 flex gap-6 border-b border-ink/10 text-sm">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-3 ${
              tab === t ? "border-leaf font-medium text-leaf" : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Products" && <ProductsAdmin token={token} />}
        {tab === "Orders" && <OrdersAdmin token={token} />}
        {tab === "Messages" && <MessagesAdmin token={token} />}
      </div>
    </div>
  );
}
