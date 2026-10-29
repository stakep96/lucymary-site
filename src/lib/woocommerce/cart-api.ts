import "server-only";

import type { CartView } from "@/features/cart/types";
import { buildStoreApiUrl } from "./store-api";

interface WooCart {
  items: Array<{
    key: string;
    id: number;
    name: string;
    quantity: number;
    quantity_limits?: { minimum?: number; maximum?: number; multiple_of?: number; editable?: boolean };
    images?: Array<{ src: string; alt: string }>;
    prices?: { price?: string };
    totals?: { line_total?: string };
    variation?: Array<{ attribute: string; value: string }>;
  }>;
  items_count?: number;
  coupons?: Array<{ code: string; totals?: { total_discount?: string } }>;
  totals: {
    total_items?: string;
    total_discount?: string;
    total_shipping?: string;
    total_tax?: string;
    total_price?: string;
    currency_code?: string;
    currency_minor_unit?: number;
  };
  needs_shipping?: boolean;
  has_calculated_shipping?: boolean;
  shipping_address?: { postcode?: string; city?: string; state?: string; country?: string };
  shipping_rates?: Array<{
    package_id: number;
    name: string;
    shipping_rates?: Array<{
      rate_id: string;
      name: string;
      price: string;
      selected: boolean;
      delivery_time?: string;
    }>;
  }>;
}

export class CartApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly currentCart?: CartView,
  ) {
    super(message);
    this.name = "CartApiError";
  }
}

export function toCartView(raw: WooCart): CartView {
  const currency = {
    code: raw.totals.currency_code || "BRL",
    minorUnit: raw.totals.currency_minor_unit ?? 2,
  };

  return {
    items: raw.items.map((item) => ({
      key: item.key,
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      quantityLimits: {
        minimum: item.quantity_limits?.minimum ?? 1,
        maximum: item.quantity_limits?.maximum ?? 99,
        multiple: item.quantity_limits?.multiple_of ?? 1,
        editable: item.quantity_limits?.editable ?? true,
      },
      image: item.images?.[0] ? { src: item.images[0].src, alt: item.images[0].alt || item.name } : null,
      price: item.prices?.price || "0",
      lineTotal: item.totals?.line_total || "0",
      variation: (item.variation || []).map(({ attribute, value }) => ({ attribute, value })),
    })),
    itemsCount: raw.items_count ?? raw.items.reduce((count, item) => count + item.quantity, 0),
    coupons: (raw.coupons || []).map((coupon) => ({ code: coupon.code, discount: coupon.totals?.total_discount || "0" })),
    totals: {
      items: raw.totals.total_items || "0",
      discount: raw.totals.total_discount || "0",
      shipping: raw.totals.total_shipping || "0",
      tax: raw.totals.total_tax || "0",
      total: raw.totals.total_price || "0",
    },
    currency,
    shipping: {
      needed: Boolean(raw.needs_shipping),
      calculated: Boolean(raw.has_calculated_shipping),
      address: {
        postcode: raw.shipping_address?.postcode || "",
        city: raw.shipping_address?.city || "",
        state: raw.shipping_address?.state || "",
        country: raw.shipping_address?.country || "BR",
      },
      packages: (raw.shipping_rates || []).map((shippingPackage) => ({
        id: shippingPackage.package_id,
        name: shippingPackage.name,
        rates: (shippingPackage.shipping_rates || []).map((rate) => ({
          id: rate.rate_id,
          name: rate.name,
          price: rate.price,
          selected: rate.selected,
          deliveryTime: rate.delivery_time || "",
        })),
      })),
    },
  };
}

function isWooCart(value: unknown): value is WooCart {
  if (!value || typeof value !== "object") return false;
  const cart = value as Partial<WooCart>;
  return Array.isArray(cart.items) && Boolean(cart.totals && typeof cart.totals === "object");
}

export async function requestStoreCart(path: string, token?: string, body?: Record<string, unknown>) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Cart-Token"] = token;
  if (body) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(buildStoreApiUrl(path), {
      method: body ? "POST" : "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    throw new CartApiError("Não foi possível conectar ao carrinho da loja. Tente novamente.", 503);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new CartApiError("O carrinho da loja retornou dados inválidos.", 502);
  }

  if (!response.ok) {
    const error = data && typeof data === "object" ? data as {
      message?: unknown;
      data?: { cart?: unknown };
    } : null;
    const message = typeof error?.message === "string" && response.status < 500
      ? error.message.replace(/<[^>]*>/g, "").slice(0, 240)
      : "Não foi possível atualizar o carrinho. Tente novamente.";
    throw new CartApiError(
      message,
      response.status === 409 ? 409 : response.status >= 500 ? 503 : 400,
      isWooCart(error?.data?.cart) ? toCartView(error.data.cart) : undefined,
    );
  }

  if (!isWooCart(data)) throw new CartApiError("O carrinho da loja retornou dados inválidos.", 502);
  return { cart: toCartView(data), token: response.headers.get("Cart-Token") || token || "" };
}
