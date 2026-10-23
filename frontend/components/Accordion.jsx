"use client";

import { useState } from "react";

// items: [[question, answer], ...]. One answer is open at a time and opens/closes with a height transition.
export default function Accordion({ items, defaultOpen = 0, large = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div key={q}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className={`flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-leaf ${
                large ? "font-serif text-lg font-medium 2xl:text-xl" : "font-medium"
              } ${isOpen ? "text-leaf" : ""}`}
            >
              {q}
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-lg leading-none transition-all duration-300 ${
                  isOpen ? "rotate-45 border-leaf bg-leaf text-white" : "border-ink/20 text-leaf"
                }`}
              >
                +
              </span>
            </button>
            {/* 0fr -> 1fr animates the real height of the answer, no fixed pixel values needed */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className={`max-w-2xl pb-5 text-ink/70 ${large ? "2xl:text-lg" : "text-sm 2xl:text-base"}`}>{a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
