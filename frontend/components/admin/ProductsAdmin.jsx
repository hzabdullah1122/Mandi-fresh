"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import ComboBox from "@/components/ComboBox";

const CATEGORIES = ["Fruits", "Vegetables", "Dairy", "Bakery", "Meat", "Beverages", "Pantry"];
const blank = { name: "", category: "Fruits", price: "", unit: "", image: "", description: "", inStock: true };

export default function ProductsAdmin({ token }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {id,...} = existing
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    api("/products")
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const openNew = () => {
    setForm(blank);
    setFormError("");
    setEditing({});
  };
  const openEdit = (p) => {
    setForm({ ...blank, ...p, price: String(p.price) });
    setFormError("");
    setEditing(p);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const body = { ...form, price: Number(form.price) };
      if (editing.id) await api(`/products/${editing.id}`, { method: "PUT", token, body });
      else await api("/products", { method: "POST", token, body });
      setEditing(null);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api(`/products/${p.id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleStock = async (p) => {
    try {
      await api(`/products/${p.id}`, { method: "PUT", token, body: { ...p, inStock: !p.inStock } });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Suggestions: the usual aisles plus any category an admin already created.
  const categories = [...new Set([...CATEGORIES, ...(products || []).map((p) => p.category)])];
  const shown = (products || []).filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={openNew} className="btn">Add product</button>
      </div>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
      {!products && !error && <p className="mt-6 text-ink/60">Loading…</p>}

      {products && (
        <div className="mt-5 overflow-x-auto rounded-md border border-ink/10 bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-ink/10 bg-sand text-xs uppercase tracking-wider text-ink/60">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {shown.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image || "/images/placeholder.svg"}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/placeholder.svg";
                        }}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-ink/50">{p.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{money(p.price)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStock(p)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        p.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
                      }`}
                      title="Click to change"
                    >
                      {p.inStock ? "In stock" : "Out of stock"}
                    </button>
                  </td>
                  <td className="space-x-4 p-3 text-right">
                    <button onClick={() => openEdit(p)} className="font-medium text-leaf underline underline-offset-4">
                      Edit
                    </button>
                    <button onClick={() => remove(p)} className="font-medium text-clay underline underline-offset-4">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-ink/60">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 sm:items-center">
          <form onSubmit={save} className="w-full max-w-lg space-y-4 rounded-md bg-cream p-6">
            <h2 className="text-2xl font-semibold">{editing.id ? "Edit product" : "Add product"}</h2>
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input className="input" required value={form.name} onChange={set("name")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <ComboBox
                  required
                  value={form.category}
                  onChange={(v) => setForm({ ...form, category: v })}
                  options={categories}
                  placeholder="Pick or type a new one"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Unit</label>
                <input className="input" required placeholder="1 kg" value={form.unit} onChange={set("unit")} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Price (Rs.)</label>
              <input className="input" type="number" min="0" step="1" required value={form.price} onChange={set("price")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Image link <span className="font-normal text-ink/50">(optional)</span>
              </label>
              <input
                className="input"
                placeholder="https://..."
                value={form.image}
                onChange={set("image")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={set("description")} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.inStock} onChange={set("inStock")} />
              In stock
            </label>
            {formError && <p className="text-sm text-clay">{formError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">
                Cancel
              </button>
              <button disabled={saving} className="btn">
                {saving ? "Saving…" : "Save product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
