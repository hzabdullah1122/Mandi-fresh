"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      router.push("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Log in" subtitle="Use the email you signed up with.">
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-clay">{error}</p>}
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
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button disabled={loading} className="btn w-full">
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="text-sm text-ink/60">
          No account yet?{" "}
          <Link href="/register" className="font-medium text-leaf underline underline-offset-4">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
