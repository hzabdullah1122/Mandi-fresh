"use client";

import { useEffect, useId, useRef, useState } from "react";

// A styled replacement for <select>. Works with mouse, touch and keyboard
// (Arrow keys, Home/End, Enter/Space, Esc, and typing a letter to jump).
// options: ["A", "B"] or [{ value: "a", label: "A" }]
export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  ariaLabel,
  compact = false,
  className = "",
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const selectedIndex = opts.findIndex((o) => o.value === value);
  const current = opts[selectedIndex];

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: "", timer: null });
  const listId = useId();

  const openList = () => {
    // Open upwards when there is not enough room below the button.
    const rect = wrapRef.current.getBoundingClientRect();
    setDropUp(window.innerHeight - rect.bottom < 280 && rect.top > 280);
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };
  const choose = (i) => {
    onChange(opts[i].value);
    setOpen(false);
  };

  // Close when clicking or tapping anywhere else.
  useEffect(() => {
    if (!open) return;
    const away = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("touchstart", away);
    };
  }, [open]);

  // Keep the highlighted option visible when moving with the keyboard.
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onKeyDown = (e) => {
    const last = opts.length - 1;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return openList();
      setActive((a) => (e.key === "ArrowDown" ? Math.min(a + 1, last) : Math.max(a - 1, 0)));
    } else if (e.key === "Home" && open) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End" && open) {
      e.preventDefault();
      setActive(last);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open ? choose(active) : openList();
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      // Type-ahead: "pa" jumps to the first option starting with "pa".
      const t = typed.current;
      clearTimeout(t.timer);
      t.text += e.key.toLowerCase();
      t.timer = setTimeout(() => (t.text = ""), 600);
      const hit = opts.findIndex((o) => o.label.toLowerCase().startsWith(t.text));
      if (hit >= 0) {
        if (!open) openList();
        setActive(hit);
      }
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center justify-between gap-3 rounded-md border bg-white text-left text-sm outline-none transition ${
          open ? "border-leaf" : "border-ink/20 hover:border-ink/40 focus-visible:border-leaf"
        } ${compact ? "px-3 py-1.5" : "px-3.5 py-2.5"}`}
      >
        <span className={`truncate ${current ? "" : "text-ink/40"}`}>{current ? current.label : placeholder}</span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-ink/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          className={`absolute left-0 z-30 max-h-64 min-w-full overflow-auto rounded-md border border-ink/10 bg-white py-1 shadow-lg ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {opts.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()} // keep focus on the button
              onClick={() => choose(i)}
              className={`flex cursor-pointer items-center justify-between gap-4 whitespace-nowrap px-3.5 py-2 text-sm ${
                i === active ? "bg-sand" : ""
              } ${o.value === value ? "font-medium text-leaf" : ""}`}
            >
              {o.label}
              {o.value === value && (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
                  <path d="M4 10.5l4 4 8-9" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
