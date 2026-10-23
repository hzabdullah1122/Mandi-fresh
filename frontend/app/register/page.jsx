"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import AuthShell from "@/components/AuthShell";
import { useToast } from "@/components/Toast";

export default function RegisterPage() {
  const { register } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      toast.success("Your account is ready. Welcome to Mandi Fresh!");
      router.push("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="It takes a minute, and saves your orders.">
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-clay">{error}</p>}
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            className="input"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            className="input"
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button disabled={loading} className="btn w-full">
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="text-sm text-ink/60">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-leaf underline underline-offset-4">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
