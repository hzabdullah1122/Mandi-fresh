"use client";

import { useEffect, useId, useRef, useState } from "react";

// A text box with a custom suggestion list. You can pick a suggestion or type something new.
export default function ComboBox({ value, onChange, options, placeholder, required }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const listId = useId();

  // Show everything when the text matches an option exactly, otherwise filter as the user types.
  const exact = options.some((o) => o.toLowerCase() === value.trim().toLowerCase());
  const shown = exact || !value.trim() ? options : options.filter((o) => o.toLowerCase().includes(value.trim().toLowerCase()));

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

  const pick = (o) => {
    onChange(o);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (e.key === "ArrowDown" ? Math.min(a + 1, shown.length - 1) : Math.max(a - 1, 0)));
    } else if (e.key === "Enter" && open && active >= 0) {
      e.preventDefault();
      pick(shown[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        className="input pr-9"
        required={required}
        placeholder={placeholder}
        value={value}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      >
        <path d="M5 8l5 5 5-5" />
      </svg>

      {open && shown.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 max-h-56 min-w-full overflow-auto rounded-md border border-ink/10 bg-white py-1 shadow-lg"
        >
          {shown.map((o, i) => (
            <li
              key={o}
              role="option"
              aria-selected={o === value}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(o)}
              className={`cursor-pointer px-3.5 py-2 text-sm ${i === active ? "bg-sand" : ""} ${
                o === value ? "font-medium text-leaf" : ""
              }`}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
