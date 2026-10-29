import { timingSafeEqual } from "node:crypto";
import { checkStoreHealth } from "@/lib/woocommerce/diagnostics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const responseHeaders = { "Cache-Control": "private, no-store, max-age=0" };

function isAuthorized(request: Request): boolean {
  const expected = process.env.STORE_DIAGNOSTIC_TOKEN;
  const provided = request.headers.get("x-store-diagnostic-token");
  if (!expected || expected.length < 32 || !provided) return false;

  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  return expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response(null, { status: 404, headers: responseHeaders });
  }

  const health = await checkStoreHealth();
  return Response.json(health, {
    status: health.status === "ok" ? 200 : 503,
    headers: responseHeaders,
  });
}
