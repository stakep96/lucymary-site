import type { CartCurrency } from "./types";

export function formatCartAmount(amount: string, currency: CartCurrency): string {
  const value = Number(amount);
  if (!Number.isFinite(value) || !Number.isInteger(currency.minorUnit) || currency.minorUnit < 0 || currency.minorUnit > 6) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.code,
    }).format(value / 10 ** currency.minorUnit);
  } catch {
    return "—";
  }
}
