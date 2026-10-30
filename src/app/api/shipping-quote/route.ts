import { NextResponse } from "next/server";
import { CartApiError, requestStoreCart } from "@/lib/woocommerce/cart-api";
import { isStoreConfigured } from "@/lib/woocommerce/store-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store, max-age=0" };

function response(payload: Record<string, unknown>, status: number) {
  return NextResponse.json(payload, { status, headers });
}

function sameOrigin(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    return Boolean(origin && host && new URL(origin).host === host && new URL(origin).protocol === new URL(request.url).protocol);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isStoreConfigured()) return response({ error: "Loja não configurada." }, 503);
  if (!sameOrigin(request)) return response({ error: "Origem da solicitação inválida." }, 403);

  let id: number;
  let quantity: number;
  let variation: Array<{ attribute: string; value: string }>;
  let postcode: string;
  try {
    const text = await request.text();
    if (text.length > 2048) return response({ error: "Solicitação muito grande." }, 413);
    const data = JSON.parse(text) as Record<string, unknown>;
    id = data.id as number;
    quantity = data.quantity as number;
    variation = data.variation as Array<{ attribute: string; value: string }>;
    postcode = typeof data.postcode === "string" ? data.postcode.replace(/\D/g, "") : "";
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99
      || !Array.isArray(variation) || variation.length > 20
      || !variation.every((item) => item && typeof item.attribute === "string" && item.attribute.length > 0 && item.attribute.length <= 120 && typeof item.value === "string" && item.value.length > 0 && item.value.length <= 120)
      || !/^\d{8}$/.test(postcode)) {
      return response({ error: "Informe um CEP válido e selecione o produto." }, 400);
    }
  } catch {
    return response({ error: "Dados de frete inválidos." }, 400);
  }

  try {
    const initial = await requestStoreCart("/cart");
    if (!initial.token) throw new CartApiError("Não foi possível iniciar a consulta de frete.", 503);
    await requestStoreCart("/cart/add-item", initial.token, { id, quantity, variation });
    const result = await requestStoreCart("/cart/update-customer", initial.token, {
      shipping_address: { postcode, country: "BR" },
    });
    return response({
      postcode: result.cart.shipping.address.postcode || postcode,
      packages: result.cart.shipping.packages,
      currency: result.cart.currency,
      calculated: result.cart.shipping.calculated,
      needed: result.cart.shipping.needed,
    }, 200);
  } catch (error) {
    return response({ error: error instanceof CartApiError && error.status < 500 ? error.message : "Não foi possível calcular o frete agora." },
      error instanceof CartApiError && error.status < 500 ? 400 : 503);
  }
}
