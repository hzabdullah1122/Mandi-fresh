"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done)
    return <p className="text-sm text-white/80">Thanks, you&apos;re on the list. We&apos;ll email you once a week.</p>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="w-full rounded-md border border-white/25 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/60"
      />
      <button className="shrink-0 rounded-md bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-sand">
        Subscribe
      </button>
    </form>
  );
}
