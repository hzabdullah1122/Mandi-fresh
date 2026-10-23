"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const categories = ["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Meat", "Beverages", "Pantry"];

function Products() {
  const params = useSearchParams();
  const [category, setCategory] = useState(params.get("category") || "All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ category, search }).toString();
    api(`/products?${q}`)
      .then((d) => {
        setProducts(d);
        setError("");
      })
      .catch(() => setError("Products could not be loaded. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="container-x py-10 md:py-12 2xl:py-16">
      <h1 className="text-3xl font-semibold md:text-4xl 2xl:text-5xl">Shop</h1>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`border-b-2 pb-1 ${
                category === c
                  ? "border-leaf font-medium text-leaf"
                  : "border-transparent text-ink/60 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          className="input md:max-w-xs"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="mt-8 text-sm text-clay">{error}</p>}
      {loading ? (
        <p className="mt-10 text-ink/60">Loading…</p>
      ) : (
        <div className="mt-8 grid gap-x-5 gap-y-8 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 2xl:gap-x-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {!error && products.length === 0 && <p className="text-ink/60">Nothing matched your search.</p>}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="container-x py-12">Loading…</p>}>
      <Products />
    </Suspense>
  );
}
