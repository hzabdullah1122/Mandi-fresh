"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Accordion from "@/components/Accordion";

const topics = ["Order status", "Missing or damaged item", "Product request", "Delivery area", "Something else"];

const channels = [
  { label: "Call us", value: "+92 313 5225423", href: "tel:+923135225423", note: "Mon – Sat, 9am – 9pm" },
  { label: "WhatsApp", value: "Message us", href: "https://wa.me/923135225423", note: "Quickest for order updates" },
  { label: "Email", value: "hello@mandifresh.example", href: "mailto:hello@mandifresh.example", note: "We reply within a few hours" },
];

const faqs = [
  ["When will my order arrive?", "Orders placed before 12pm are delivered the same day, between 2pm and 8pm. Later orders go out the next day."],
  ["What if something is missing or damaged?", "Tell us within 24 hours using this form or WhatsApp and we'll replace it or refund you."],
  ["Which areas do you deliver to?", "Johar Town, Gulberg, Model Town, Wapda Town and nearby areas of Lahore. If you're not sure, send us your area."],
  ["How do I pay?", "Cash on delivery. Online payment is coming soon."],
];

const empty = { name: "", email: "", phone: "", topic: topics[0], message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await api("/contact", { method: "POST", body: form });
      setStatus("sent");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  return (
    <>
      {/* Banner */}
      <section className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/about.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/65" />
        <div className="container-x relative py-14 sm:py-20 2xl:py-28">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl 2xl:text-6xl">Get in touch</h1>
          <p className="mt-3 max-w-xl text-white/80 sm:text-lg 2xl:max-w-2xl 2xl:text-xl">
            A late order, a missing item, or something you&apos;d like us to stock. Write to us and a
            real person will reply.
          </p>
        </div>
      </section>

      {/* Quick channels */}
      <section className="container-x -mt-8 2xl:-mt-12">
        <ul className="relative grid gap-3 sm:grid-cols-3 sm:gap-4 2xl:gap-6">
          {channels.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="block h-full rounded-md border border-ink/10 bg-white p-5 shadow-sm transition hover:border-leaf hover:shadow-md 2xl:p-7"
              >
                <p className="text-xs uppercase tracking-widest text-ink/50">{c.label}</p>
                <p className="mt-1.5 break-words font-serif text-lg font-semibold 2xl:text-xl">{c.value}</p>
                <p className="mt-1 text-sm text-ink/60">{c.note}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Form + FAQ */}
      <section className="container-x mt-12 grid gap-12 lg:grid-cols-5 2xl:mt-20 2xl:gap-20">
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-semibold md:text-3xl">Send us a message</h2>

          {status === "sent" ? (
            <div className="mt-6 rounded-md bg-sand p-8">
              <p className="font-serif text-2xl">Thanks, {form.name.split(" ")[0]}. We have your message.</p>
              <p className="mt-2 text-ink/70">
                We&apos;ll reply to {form.email}, usually within a few hours.
              </p>
              <button
                onClick={() => {
                  setForm(empty);
                  setStatus("idle");
                }}
                className="btn-outline mt-6"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Your name</label>
                  <input className="input" required value={form.name} onChange={set("name")} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Phone <span className="font-normal text-ink/50">(optional)</span>
                  </label>
                  <input className="input" type="tel" value={form.phone} onChange={set("phone")} />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input className="input" type="email" required value={form.email} onChange={set("email")} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">What is it about?</label>
                  <select className="input" value={form.topic} onChange={set("topic")}>
                    {topics.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Message</label>
                <textarea
                  className="input"
                  rows={6}
                  required
                  maxLength={2000}
                  placeholder="Include your order number if you have one."
                  value={form.message}
                  onChange={set("message")}
                />
                <p className="mt-1 text-right text-xs text-ink/40">{form.message.length} / 2000</p>
              </div>
              {error && <p className="text-sm text-clay">{error}</p>}
              <button disabled={status === "sending"} className="btn !px-8">
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold md:text-3xl">Quick answers</h2>
          <div className="mt-6">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
