"use client";

import { useApp } from "@/context/AppContext";
import { money } from "@/lib/format";

export default function ProductCard({ product }) {
  const { addToCart } = useApp();

  return (
    <article className="flex flex-col">
      <div className="aspect-square overflow-hidden rounded-md bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-ink/50">{product.category}</p>
      <h3 className="text-lg leading-snug">{product.name}</h3>
      <p className="text-sm text-ink/60">{product.unit}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{money(product.price)}</span>
        <button
          onClick={() => addToCart(product)}
          className="rounded-md border border-leaf px-3 py-1.5 text-sm font-medium text-leaf transition hover:bg-leaf hover:text-white"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
