"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

function PasswordInput({ label, value, onChange, minLength, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          className="input pr-16"
          type={show ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink/50 hover:text-ink"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function Card({ title, text, children, tone }) {
  return (
    <section
      className={`rounded-md border bg-white p-6 md:p-8 ${tone === "danger" ? "border-clay/30" : "border-ink/10"}`}
    >
      <h2 className={`text-xl font-semibold ${tone === "danger" ? "text-clay" : ""}`}>{title}</h2>
      {text && <p className="mt-1 text-sm text-ink/60">{text}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Note({ ok, bad }) {
  if (!ok && !bad) return null;
  return <p className={`text-sm ${ok ? "text-leaf" : "text-clay"}`}>{ok || bad}</p>;
}

export default function AccountPage() {
  const { user, token, ready, setUser, logout } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [confirming, setConfirming] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [orderCount, setOrderCount] = useState(null);
  const [note, setNote] = useState({}); // { profile: {ok, bad}, password: {...}, danger: {...} }

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (token)
      api("/orders", { token })
        .then((o) => setOrderCount(o.length))
        .catch(() => {});
  }, [token]);

  const say = (key, ok, bad) => setNote((n) => ({ ...n, [key]: { ok, bad } }));

  const saveName = async (e) => {
    e.preventDefault();
    try {
      const d = await api("/auth/me", { method: "PUT", token, body: { name } });
      setUser(d.user);
      say("profile", "Saved.");
    } catch (x) {
      say("profile", "", x.message);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      await api("/auth/me", { method: "PUT", token, body: pw });
      setPw({ currentPassword: "", newPassword: "" });
      say("password", "Your password has been changed.");
    } catch (x) {
      say("password", "", x.message);
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm("Delete your account for good? This cannot be undone.")) return;
    try {
      await api("/auth/me", { method: "DELETE", token, body: { password: delPw } });
      logout();
      router.push("/");
    } catch (x) {
      say("danger", "", x.message);
    }
  };

  if (!ready) return <p className="container-x py-12 text-ink/60">Loading…</p>;
  if (!user)
    return (
      <div className="page-narrow flex min-h-[calc(100vh-14rem)] max-w-md flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-semibold">Log in to manage your account</h1>
        <Link href="/login" className="btn mt-6">Log in</Link>
      </div>
    );

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const since = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-PK", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="container-x py-10 md:py-12 2xl:py-16">
      <h1 className="text-3xl font-semibold md:text-4xl 2xl:text-5xl">My account</h1>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[19rem_1fr] lg:gap-8 2xl:grid-cols-[22rem_1fr]">
        {/* Summary */}
        <aside className="rounded-md bg-sand p-6 lg:sticky lg:top-24">
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-leaf font-serif text-2xl text-white">
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-serif text-xl font-semibold">{user.name}</p>
              <p className="truncate text-sm text-ink/60">{user.email}</p>
              {user.role === "admin" && (
                <span className="mt-2 inline-block rounded-full bg-ink px-2.5 py-0.5 text-xs font-medium text-white">
                  Admin
                </span>
              )}
            </div>
          </div>

          <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            {since && (
              <div className="flex justify-between py-3">
                <dt className="text-ink/60">Customer since</dt>
                <dd className="font-medium">{since}</dd>
              </div>
            )}
            <div className="flex justify-between py-3">
              <dt className="text-ink/60">Orders placed</dt>
              <dd className="font-medium">{orderCount ?? "…"}</dd>
            </div>
          </dl>

          <div className="mt-6 space-y-2 text-sm font-medium">
            <Link href="/orders" className="btn w-full">View my orders</Link>
            {user.role === "admin" && (
              <Link href="/admin" className="btn-outline w-full">Open admin panel</Link>
            )}
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="block w-full py-2 text-ink/60 underline underline-offset-4 hover:text-ink"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Settings */}
        <div className="space-y-6">
          <Card title="Personal details" text="This is the name we use on your orders.">
            <form onSubmit={saveName} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Full name</label>
                  <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input className="input cursor-not-allowed bg-sand/60 text-ink/60" value={user.email} disabled />
                </div>
              </div>
              <p className="text-xs text-ink/50">Your email is your login, so it can&apos;t be changed here.</p>
              <div className="flex items-center gap-4">
                <button className="btn" disabled={!name.trim() || name.trim() === user.name}>
                  Save changes
                </button>
                <Note {...note.profile} />
              </div>
            </form>
          </Card>

          <Card title="Password" text="Use at least 6 characters. You'll stay logged in on this device.">
            <form onSubmit={savePassword} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordInput
                  label="Current password"
                  autoComplete="current-password"
                  value={pw.currentPassword}
                  onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                />
                <PasswordInput
                  label="New password"
                  autoComplete="new-password"
                  minLength={6}
                  value={pw.newPassword}
                  onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4">
                <button className="btn">Update password</button>
                <Note {...note.password} />
              </div>
            </form>
          </Card>

          <Card
            tone="danger"
            title="Delete account"
            text="Your login is removed for good. Past orders stay on the shop's records."
          >
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="rounded-md border border-clay px-5 py-2.5 text-sm font-medium text-clay transition hover:bg-clay hover:text-white"
              >
                Delete my account…
              </button>
            ) : (
              <form onSubmit={deleteAccount} className="space-y-4">
                <PasswordInput
                  label="Enter your password to confirm"
                  autoComplete="current-password"
                  value={delPw}
                  onChange={(e) => setDelPw(e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button className="rounded-md bg-clay px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
                    Yes, delete my account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(false);
                      setDelPw("");
                      say("danger");
                    }}
                    className="btn-outline"
                  >
                    Keep my account
                  </button>
                  <Note {...note.danger} />
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
