"use client";

import { useApp } from "@/context/AppContext";
import { money } from "@/lib/format";
import { useToast } from "@/components/Toast";
import { imageSrc } from "@/lib/api";

export default function ProductCard({ product }) {
  const { addToCart } = useApp();
  const toast = useToast();
  const soldOut = product.inStock === false;

  return (
    <article className="flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-md bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc(product.image) || "/images/placeholder.svg"}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/placeholder.svg";
          }}
          className={`h-full w-full object-cover transition duration-500 hover:scale-105 ${soldOut ? "opacity-60" : ""}`}
        />
        {soldOut && (
          <span className="absolute left-2 top-2 rounded bg-ink px-2 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-ink/50">{product.category}</p>
      <h3 className="text-lg leading-snug">{product.name}</h3>
      <p className="text-sm text-ink/60">{product.unit}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{money(product.price)}</span>
        <button
          onClick={() => {
            addToCart(product);
            toast.success(`${product.name} added to your cart`);
          }}
          disabled={soldOut}
          className="rounded-md border border-leaf px-3 py-1.5 text-sm font-medium text-leaf transition hover:bg-leaf hover:text-white disabled:cursor-not-allowed disabled:border-ink/20 disabled:text-ink/40 disabled:hover:bg-transparent disabled:hover:text-ink/40"
        >
          {soldOut ? "Unavailable" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
