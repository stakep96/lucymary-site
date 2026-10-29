import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { CartAction, CartView } from "@/features/cart/types";
import { CartApiError, requestStoreCart } from "@/lib/woocommerce/cart-api";
import { isStoreConfigured } from "@/lib/woocommerce/store-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cookieName = "lm_cart";
const responseHeaders = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };

function reply(payload: CartView | { error: string; cart?: CartView }, status: number, token: string, request: Request) {
  const response = NextResponse.json(payload, { status, headers: responseHeaders });
  if (token && token.length < 4096 && !/[\r\n]/.test(token)) {
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 48,
    });
  }
  return response;
}

function errorReply(error: unknown, token: string, request: Request) {
  if (error instanceof CartApiError) {
    return reply({ error: error.message, ...(error.currentCart ? { cart: error.currentCart } : {}) }, error.status, token, request);
  }
  return reply({ error: "O carrinho está temporariamente indisponível." }, 503, token, request);
}

async function currentToken() {
  return (await cookies()).get(cookieName)?.value || "";
}

async function ensureToken(token: string) {
  if (token) return token;
  const initial = await requestStoreCart("/cart");
  if (!initial.token) throw new CartApiError("Não foi possível iniciar a sessão do carrinho.", 503);
  return initial.token;
}

function parseAction(value: unknown): { path: string; body: Record<string, unknown> } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Partial<CartAction> & Record<string, unknown>;
  const validInteger = (number: unknown, minimum: number, maximum: number) =>
    typeof number === "number" && Number.isInteger(number) && number >= minimum && number <= maximum;
  const validKey = (key: unknown) => typeof key === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(key);
  const validCode = (code: unknown) => typeof code === "string" && code.trim().length > 0 && code.trim().length <= 80;

  switch (data.action) {
    case "add":
      return validInteger(data.id, 1, 2_147_483_647)
        && validInteger(data.quantity, 1, 9999)
        && Array.isArray(data.variation)
        && data.variation.length <= 20
        && data.variation.every((option) => option && typeof option.attribute === "string" && option.attribute.length > 0 && option.attribute.length <= 120 && typeof option.value === "string" && option.value.length > 0 && option.value.length <= 120)
        ? { path: "/cart/add-item", body: { id: data.id, quantity: data.quantity, variation: data.variation } } : null;
    case "update":
      return validKey(data.key) && validInteger(data.quantity, 1, 9999)
        ? { path: "/cart/update-item", body: { key: data.key, quantity: data.quantity } } : null;
    case "remove":
      return validKey(data.key) ? { path: "/cart/remove-item", body: { key: data.key } } : null;
    case "applyCoupon":
      return validCode(data.code) ? { path: "/cart/apply-coupon", body: { code: (data.code as string).trim() } } : null;
    case "removeCoupon":
      return validCode(data.code) ? { path: "/cart/remove-coupon", body: { code: (data.code as string).trim() } } : null;
    case "updateShipping": {
      const postcode = typeof data.postcode === "string" ? data.postcode.replace(/\D/g, "") : "";
      const city = typeof data.city === "string" ? data.city.trim() : "";
      const state = typeof data.state === "string" ? data.state.trim().toUpperCase() : "";
      return /^\d{8}$/.test(postcode) && city.length > 0 && city.length <= 100 && /^[A-Z]{2}$/.test(state)
        ? { path: "/cart/update-customer", body: { shipping_address: { postcode, city, state, country: "BR" } } } : null;
    }
    case "selectShipping":
      return validInteger(data.packageId, 0, 100) && typeof data.rateId === "string" && data.rateId.length > 0 && data.rateId.length <= 150 && !/[\r\n]/.test(data.rateId)
        ? { path: "/cart/select-shipping-rate", body: { package_id: data.packageId, rate_id: data.rateId } } : null;
    default:
      return null;
  }
}

export async function GET(request: Request) {
  if (!isStoreConfigured()) return reply({ error: "Loja não configurada." }, 503, "", request);
  const token = await currentToken();
  try {
    const result = await requestStoreCart("/cart", token || undefined);
    return reply(result.cart, 200, result.token, request);
  } catch (error) {
    if (token && error instanceof CartApiError && (error.status === 400 || error.status === 409)) {
      try {
        const fresh = await requestStoreCart("/cart");
        return reply(fresh.cart, 200, fresh.token, request);
      } catch (freshError) {
        return errorReply(freshError, "", request);
      }
    }
    return errorReply(error, "", request);
  }
}

export async function POST(request: Request) {
  if (!isStoreConfigured()) return reply({ error: "Loja não configurada." }, 503, "", request);
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  let sameOrigin = false;
  try {
    sameOrigin = Boolean(origin && host && new URL(origin).host === host && new URL(origin).protocol === new URL(request.url).protocol);
  } catch {
    // Origem ausente ou inválida.
  }
  if (!sameOrigin) {
    return reply({ error: "Origem da solicitação inválida." }, 403, "", request);
  }

  let action: { path: string; body: Record<string, unknown> } | null = null;
  try {
    const text = await request.text();
    if (text.length > 4096) return reply({ error: "Solicitação muito grande." }, 413, "", request);
    action = parseAction(JSON.parse(text));
  } catch {
    // A entrada inválida é rejeitada sem chamar o WooCommerce.
  }
  if (!action) return reply({ error: "Dados do carrinho inválidos." }, 400, "", request);

  let token = await currentToken();
  try {
    token = await ensureToken(token);
    const result = await requestStoreCart(action.path, token, action.body);
    return reply(result.cart, 200, result.token, request);
  } catch (error) {
    return errorReply(error, token, request);
  }
}
