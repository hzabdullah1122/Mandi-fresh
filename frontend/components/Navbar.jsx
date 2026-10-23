"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout, cartCount } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The home page has a full-screen photo behind the header, so it starts transparent
  // and turns solid after a small scroll. Every other page is solid from the start.
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = (href) =>
    `text-sm 2xl:text-base transition-colors ${
      transparent
        ? "text-white/90 hover:text-white"
        : pathname === href
        ? "font-medium text-leaf"
        : "text-ink/70 hover:text-ink"
    }`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
          transparent
            ? "border-transparent bg-transparent"
            : "border-ink/10 bg-cream/95 shadow-sm backdrop-blur"
        }`}
      >
        <nav className="container-x flex h-16 items-center justify-between 2xl:h-20">
          <Link
            href="/"
            className={`font-serif text-xl font-semibold tracking-tight transition-colors sm:text-2xl 2xl:text-3xl ${
              transparent ? "text-white" : "text-ink"
            }`}
          >
            Mandi<span className={transparent ? "text-[#a8d5b0]" : "text-leaf"}>Fresh</span>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass(l.href)}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-5 md:flex">
            {user ? (
              <>
                <span className={`text-sm 2xl:text-base ${transparent ? "text-white/90" : "text-ink/70"}`}>
                  {user.name.split(" ")[0]}
                </span>
                <button onClick={logout} className={linkClass("")}>
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" className={linkClass("/login")}>
                Log in
              </Link>
            )}
            <Link
              href="/cart"
              className={`btn !py-2 2xl:!text-base ${transparent ? "!bg-white !text-ink hover:!bg-sand" : ""}`}
            >
              Cart ({cartCount})
            </Link>
          </div>

          <button
            className={`text-sm font-medium md:hidden ${transparent ? "text-white" : "text-ink"}`}
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </nav>

        {open && (
          <div
            className="container-x space-y-3 border-t border-ink/10 py-4 md:hidden"
            onClick={() => setOpen(false)}
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="block text-sm">
                {l.label}
              </Link>
            ))}
            <Link href="/cart" className="block text-sm font-medium">
              Cart ({cartCount})
            </Link>
            {user ? (
              <button onClick={logout} className="block text-sm">Log out</button>
            ) : (
              <>
                <Link href="/login" className="block text-sm">Log in</Link>
                <Link href="/register" className="block text-sm">Create account</Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* The header is fixed, so other pages need room for it. The home hero goes underneath. */}
      {!isHome && <div className="h-16 2xl:h-20" />}
    </>
  );
}
