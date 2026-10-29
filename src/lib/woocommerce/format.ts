import type { StorePrices } from "./types";

export function formatStorePrice(prices: StorePrices | undefined, amount = prices?.price): string {
  if (!prices || !amount || !prices.currency_code) return "Consulte o preço";

  const minorUnit = prices.currency_minor_unit;
  const value = Number(amount);
  if (!Number.isFinite(value) || !Number.isInteger(minorUnit) || minorUnit < 0 || minorUnit > 6) {
    return "Consulte o preço";
  }

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: prices.currency_code,
    }).format(value / 10 ** minorUnit);
  } catch {
    return "Consulte o preço";
  }
}
