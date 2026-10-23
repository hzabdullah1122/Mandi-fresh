"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]); // [{ product, qty }]
  const [ready, setReady] = useState(false);

  // Restore session + cart from localStorage
  useEffect(() => {
    const t = localStorage.getItem("token");
    const c = localStorage.getItem("cart_v2");
    if (c) setCart(JSON.parse(c));
    if (t) {
      api("/auth/me", { token: t })
        .then((d) => {
          setUser(d.user);
          setToken(t);
        })
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setReady(true));
    } else setReady(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart_v2", JSON.stringify(cart));
  }, [cart]);

  const authenticate = (data) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };
  const login = async (body) => authenticate(await api("/auth/login", { method: "POST", body }));
  const register = async (body) => authenticate(await api("/auth/register", { method: "POST", body }));
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const addToCart = (product) =>
    setCart((c) => {
      const found = c.find((i) => i.product.id === product.id);
      return found
        ? c.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { product, qty: 1 }];
    });
  const setQty = (id, qty) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((i) => i.product.id !== id)
        : c.map((i) => (i.product.id === id ? { ...i, qty } : i))
    );
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);
  const cartTotal = cart.reduce((n, i) => n + i.qty * i.product.price, 0);

  return (
    <AppContext.Provider
      value={{ user, setUser, token, ready, login, register, logout, cart, addToCart, setQty, clearCart, cartCount, cartTotal }}
    >
      {children}
    </AppContext.Provider>
  );
}
