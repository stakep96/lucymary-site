"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { CartAction, CartView } from "./types";

interface CartContextValue {
  cart: CartView | null;
  status: "loading" | "ready" | "error";
  busy: boolean;
  error: string | null;
  drawerRequest: number;
  refresh: () => Promise<void>;
  perform: (action: CartAction) => Promise<CartView>;
  openDrawer: () => void;
  clearError: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function errorMessage(value: unknown): string {
  return value instanceof Error ? value.message : "Não foi possível atualizar a sacola. Tente novamente.";
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerRequest, setDrawerRequest] = useState(0);
  const busyRef = useRef(false);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/cart", { cache: "no-store", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.items)) throw new Error(data.error || "Não foi possível carregar a sacola.");
      setCart(data as CartView);
      setStatus("ready");
    } catch (cause) {
      setStatus("error");
      setError(errorMessage(cause));
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/cart", { cache: "no-store", credentials: "same-origin", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.items)) throw new Error(data.error || "Não foi possível carregar a sacola.");
        return data as CartView;
      })
      .then((data) => {
        setCart(data);
        setStatus("ready");
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setStatus("error");
        setError(errorMessage(cause));
      });
    return () => controller.abort();
  }, []);

  const perform = useCallback(async (action: CartAction): Promise<CartView> => {
    if (busyRef.current) throw new Error("Aguarde a atualização da sacola.");
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.cart && Array.isArray(data.cart.items)) setCart(data.cart as CartView);
        throw new Error(data.error || "Não foi possível atualizar a sacola.");
      }
      if (!Array.isArray(data.items)) throw new Error("A loja retornou uma sacola inválida.");
      setCart(data as CartView);
      setStatus("ready");
      return data as CartView;
    } catch (cause) {
      const message = errorMessage(cause);
      setError(message);
      throw new Error(message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  return (
    <CartContext.Provider value={{
      cart, status, busy, error, drawerRequest, refresh, perform,
      openDrawer: () => setDrawerRequest((request) => request + 1),
      clearError: () => setError(null),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("O carrinho precisa do CartProvider.");
  return context;
}
