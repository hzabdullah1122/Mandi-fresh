"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Accordion from "@/components/Accordion";

const categories = [
  { name: "Fruits", image: "/products/apples.jpg" },
  { name: "Vegetables", image: "/products/carrots.jpg" },
  { name: "Dairy", image: "/products/milk.jpg" },
  { name: "Bakery", image: "/products/bread.jpg" },
  { name: "Meat", image: "/products/chicken.jpg" },
  { name: "Pantry", image: "/products/rice.jpg" },
];

const steps = [
  ["01", "Choose", "Browse the shop and add what you need. Prices are the same all day."],
  ["02", "We pick and pack", "Our team packs your order from that morning's market stock, with dairy and meat kept chilled."],
  ["03", "Delivered to you", "A rider brings it to your door between 2pm and 8pm. Pay cash when it arrives."],
];

const reasons = [
  ["Bought that morning", "Nothing sits in cold storage for days. What you get was at the market a few hours ago."],
  ["Honest weights", "Fruit and vegetables are weighed in front of the packing camera, so you get what you pay for."],
  ["Replace or refund", "If something isn't right, tell us within 24 hours and we'll replace it or refund you."],
];

const reviews = [
  ["The tomatoes and spinach were properly fresh, not like what I get at the supermarket. Rider was on time too.", "Ayesha K.", "Johar Town"],
  ["I order milk, eggs and bread every Monday. It has become part of our routine and I haven't had a bad order yet.", "Imran S.", "Gulberg"],
  ["One banana pack was bruised, I messaged them on WhatsApp and they sent a replacement the same evening.", "Sara M.", "Model Town"],
];

const areas = [
  "Johar Town",
  "Gulberg",
  "Model Town",
  "Wapda Town",
  "Faisal Town",
  "Garden Town",
  "Iqbal Town",
  "Bahria Town",
  "Lahore Cantt",
];

const faqs = [
  ["When will my order arrive?", "Orders placed before 12pm are delivered the same day, between 2pm and 8pm. Orders after that go out the next day."],
  ["Which areas of Lahore do you deliver to?", "Johar Town, Gulberg, Model Town, Wapda Town, Faisal Town, Garden Town, Iqbal Town, Bahria Town and Lahore Cantt. We are adding more areas, so message us if yours isn't listed."],
  ["Is there a delivery charge?", "Delivery is free on orders above Rs. 2,000. Below that, a small delivery fee may apply depending on your area."],
  ["How do I pay?", "Cash on delivery. Keep the amount ready when the rider arrives. Online payment is coming soon."],
  ["What if an item is missing, bruised or not fresh?", "Tell us within 24 hours on WhatsApp or through the contact form. We'll replace the item or refund you."],
  ["Can I change or cancel my order?", "Yes, until it is packed. Message us as soon as possible with your order number and we'll update it."],
  ["Do I need an account to order?", "Yes, a free account lets us keep your orders and delivery details in one place. It takes under a minute to create."],
];

const tabs = ["Fruits", "Vegetables", "Dairy", "Bakery"];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("Vegetables");
  const [error, setError] = useState("");

  useEffect(() => {
    api("/products")
      .then(setProducts)
      .catch(() => setError("Products could not be loaded. Make sure the backend is running."));
  }, []);

  const picks = [1, 7, 9, 13].map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const tabProducts = products.filter((p) => p.category === tab).slice(0, 4);

  const heading = "text-2xl font-semibold md:text-3xl 2xl:text-4xl";
  const section = "container-x mt-16 md:mt-24 2xl:mt-32";

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero.jpg"
          alt="Vegetable stalls at a market"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Muted looping video over the photo. The photo shows while it loads, and for people who
            have "reduce motion" turned on. */}
        <video
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          src="/videos/hero.mp4"
          poster="/images/hero.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="container-x relative flex flex-1 flex-col justify-center pb-16 pt-28 2xl:pt-36">
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl 2xl:max-w-4xl 2xl:text-7xl">
            Market-fresh groceries, at your door by evening.
          </h1>
          <p className="mt-5 max-w-lg text-base text-white/85 sm:text-lg 2xl:max-w-2xl 2xl:text-xl">
            Order before noon and we deliver the same day. Fruit, vegetables, dairy and everyday
            staples, picked up fresh each morning.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn !bg-white !text-ink hover:!bg-sand">
              Start shopping
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-md border border-white/60 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              How it works
            </Link>
          </div>
        </div>

        {/* Sits at the bottom of the first screen on every device */}
        <div className="relative border-t border-white/20 bg-ink/40 backdrop-blur-sm">
          <ul className="container-x grid gap-1 py-3 text-center text-xs text-white/90 sm:grid-cols-3 sm:text-sm 2xl:py-4 2xl:text-base">
            <li>Same-day delivery on orders before 12pm</li>
            <li>Free delivery above Rs. 2,000</li>
            <li>Pay cash on delivery</li>
          </ul>
        </div>
      </section>

      {/* Categories */}
      <section className={section}>
        <h2 className={heading}>Browse by aisle</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 2xl:gap-6">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/products?category=${c.name}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <span className="absolute bottom-3 left-3 font-serif text-lg text-white">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Picks */}
      <section className={section}>
        <div className="flex items-end justify-between gap-4">
          <h2 className={heading}>This week&apos;s picks</h2>
          <Link href="/products" className="text-sm font-medium text-leaf underline-offset-4 hover:underline">
            See everything
          </Link>
        </div>
        {error && <p className="mt-4 text-sm text-clay">{error}</p>}
        <div className="mt-6 grid gap-x-5 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-4 2xl:gap-x-8">
          {picks.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-16 bg-sand py-14 md:mt-24 md:py-20 2xl:mt-32 2xl:py-28">
        <div className="container-x">
          <h2 className={heading}>How an order works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10 2xl:gap-16">
            {steps.map(([n, title, text]) => (
              <li key={n} className="border-t-2 border-leaf pt-5">
                <span className="font-serif text-4xl text-leaf/40 2xl:text-5xl">{n}</span>
                <h3 className="mt-2 text-xl font-semibold 2xl:text-2xl">{title}</h3>
                <p className="mt-2 text-ink/70 2xl:text-lg">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Promo tiles */}
      <section className={section}>
        <div className="grid gap-4 md:grid-cols-5 2xl:gap-6">
          <Link
            href="/products?category=Fruits"
            className="group relative min-h-[18rem] overflow-hidden rounded-md md:col-span-3 md:min-h-[26rem] 2xl:min-h-[34rem]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/products/strawberries.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            <div className="absolute bottom-0 p-6 text-white md:p-8">
              <p className="text-xs uppercase tracking-widest text-white/70">In season</p>
              <h3 className="mt-1 text-2xl font-semibold md:text-3xl 2xl:text-4xl">Sweet, ripe fruit</h3>
              <p className="mt-1 text-white/80">Strawberries, oranges, apples and more.</p>
              <span className="mt-4 inline-block border-b border-white pb-0.5 text-sm font-medium">
                Shop fruit
              </span>
            </div>
          </Link>

          <div className="grid gap-4 md:col-span-2 2xl:gap-6">
            <Link href="/products?category=Bakery" className="group relative min-h-[13rem] overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/products/croissants.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="text-xl font-semibold 2xl:text-2xl">Baked every morning</h3>
                <span className="text-sm text-white/80">Bread and croissants →</span>
              </div>
            </Link>
            <Link href="/products?category=Dairy" className="group relative min-h-[13rem] overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/products/eggs.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="text-xl font-semibold 2xl:text-2xl">Eggs, milk and cheese</h3>
                <span className="text-sm text-white/80">Everyday dairy →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className={section}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className={heading}>Fresh in the shop</h2>
          <div className="flex gap-5 text-sm">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-b-2 pb-1 ${
                  tab === t ? "border-leaf font-medium text-leaf" : "border-transparent text-ink/60 hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-x-5 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-4 2xl:gap-x-8">
          {tabProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className={`${section} grid items-center gap-10 md:grid-cols-2 md:gap-14 2xl:gap-24`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/about.jpg"
          alt="Fresh vegetables in baskets"
          className="aspect-[4/3] w-full rounded-md object-cover"
        />
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl 2xl:text-5xl">
            We shop the market so you don&apos;t have to.
          </h2>
          <dl className="mt-8 space-y-6">
            {reasons.map(([t, d]) => (
              <div key={t} className="border-l-2 border-leaf pl-4">
                <dt className="font-serif text-lg font-semibold 2xl:text-xl">{t}</dt>
                <dd className="mt-1 text-ink/70 2xl:text-lg">{d}</dd>
              </div>
            ))}
          </dl>
          <Link href="/about" className="btn-outline mt-8">
            Read our story
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <section className={section}>
        <h2 className={heading}>What customers say</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3 2xl:gap-8">
          {reviews.map(([quote, name, area]) => (
            <figure key={name} className="flex flex-col justify-between rounded-md border border-ink/10 bg-white p-6 2xl:p-8">
              <blockquote className="font-serif text-lg leading-relaxed 2xl:text-xl">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm text-ink/60">
                <span className="font-medium text-ink">{name}</span>, {area}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA + delivery areas */}
      <section className="relative mt-16 md:mt-24 2xl:mt-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/products/tomatoes.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="container-x relative py-16 text-center text-white md:py-24 2xl:py-32">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight md:text-4xl 2xl:max-w-3xl 2xl:text-6xl">
            Ready for your first order?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/80 sm:text-lg 2xl:max-w-xl 2xl:text-xl">
            Create a free account, fill your cart, and we&apos;ll deliver tonight if you order
            before noon.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn !bg-white !px-7 !text-ink hover:!bg-sand">
              Create account
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center rounded-md border border-white/60 px-7 py-2.5 text-sm font-medium hover:bg-white/10"
            >
              Browse the shop
            </Link>
          </div>

          <div className="mx-auto mt-12 max-w-3xl border-t border-white/20 pt-6 2xl:mt-16 2xl:max-w-4xl">
            <p className="text-xs uppercase tracking-widest text-white/60">We deliver to</p>
            <p className="mt-3 text-sm leading-7 text-white/90 2xl:text-base 2xl:leading-8">
              {areas.join("  ·  ")}
            </p>
            <p className="mt-2 text-sm text-white/60">
              Not on the list?{" "}
              <Link href="/contact" className="underline underline-offset-4 hover:text-white">
                Ask us
              </Link>
              , we add new areas every month.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x mt-16 md:mt-24 2xl:mt-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-leaf">FAQs</p>
          <h2 className="mt-2 text-3xl font-semibold md:text-4xl 2xl:text-5xl">Frequently asked questions</h2>
          <p className="mt-3 text-ink/70 2xl:text-lg">
            Quick answers about delivery, payment and refunds. Still unsure? Just message us.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16 2xl:mt-14 2xl:gap-24">
          {/* The photo fills whatever height the answers take, so both columns end together */}
          <div className="relative min-h-[18rem] overflow-hidden rounded-md sm:min-h-[24rem] lg:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/faq.jpg"
              alt="Paper bags filled with fruit, vegetables and bread"
              className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-6 pt-20 text-white">
              <p className="font-serif text-xl font-semibold 2xl:text-2xl">Still have a question?</p>
              <p className="mt-1 text-sm text-white/80">We reply within a few hours.</p>
              <Link
                href="/contact"
                className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-sand"
              >
                Contact us
              </Link>
            </div>
          </div>

          <Accordion items={faqs} large />
        </div>
      </section>
    </>
  );
}
