import "server-only";

import { buildStoreApiUrl } from "./store-api";

type CheckName = "products" | "categories" | "search";
type CheckError = "http" | "invalid_response" | "network" | "timeout";

interface StoreCheck {
  name: CheckName;
  ok: boolean;
  durationMs: number;
  httpStatus?: number;
  itemCount?: number;
  error?: CheckError;
}

export interface StoreHealth {
  status: "ok" | "unavailable" | "configuration_error";
  targetHost?: string;
  checkedAt: string;
  checks: StoreCheck[];
}

const checks = [
  { name: "products", path: "/products", params: new URLSearchParams({ per_page: "1" }) },
  { name: "categories", path: "/products/categories", params: new URLSearchParams({ per_page: "1" }) },
  { name: "search", path: "/products", params: new URLSearchParams({ search: "anel", per_page: "1" }) },
] as const;

async function checkEndpoint(name: CheckName, url: URL): Promise<StoreCheck> {
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    const durationMs = Date.now() - startedAt;

    if (!response.ok) {
      return { name, ok: false, durationMs, httpStatus: response.status, error: "http" };
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return { name, ok: false, durationMs, httpStatus: response.status, error: "invalid_response" };
    }

    if (!Array.isArray(data)) {
      return { name, ok: false, durationMs, httpStatus: response.status, error: "invalid_response" };
    }

    return { name, ok: true, durationMs, httpStatus: response.status, itemCount: data.length };
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return { name, ok: false, durationMs: Date.now() - startedAt, error: timedOut ? "timeout" : "network" };
  }
}

export async function checkStoreHealth(): Promise<StoreHealth> {
  const checkedAt = new Date().toISOString();
  let urls: { name: CheckName; url: URL }[];

  try {
    urls = checks.map(({ name, path, params }) => ({ name, url: buildStoreApiUrl(path, params) }));
  } catch {
    return { status: "configuration_error", checkedAt, checks: [] };
  }

  const results = await Promise.all(urls.map(({ name, url }) => checkEndpoint(name, url)));
  return {
    status: results.every((result) => result.ok) ? "ok" : "unavailable",
    targetHost: urls[0].url.host,
    checkedAt,
    checks: results,
  };
}
