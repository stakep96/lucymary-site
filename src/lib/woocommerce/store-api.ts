import "server-only";

import type { StoreCategory, StoreProduct } from "./types";

const STORE_API_PATH = "/wp-json/wc/store/v1";
const PUBLIC_REVALIDATE_SECONDS = 60;

export class StoreApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreApiError";
  }
}

export function isStoreConfigured(): boolean {
  return Boolean(process.env.WOOCOMMERCE_STORE_URL?.trim());
}

function getStoreBaseUrl(): URL {
  const configured = process.env.WOOCOMMERCE_STORE_URL?.trim();
  if (!configured) throw new StoreApiError("A URL da loja não foi configurada.");

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new StoreApiError("A URL da loja é inválida.");
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new StoreApiError("A URL da loja deve usar HTTP(S) e não conter credenciais.");
  }

  return url;
}

export function buildStoreApiUrl(path: string, params?: URLSearchParams): URL {
  const base = getStoreBaseUrl();
  const url = new URL(`${base.pathname.replace(/\/$/, "")}${STORE_API_PATH}${path}`, base.origin);
  if (params) url.search = params.toString();
  return url;
}

async function getPublicResponse(path: string, params?: URLSearchParams): Promise<Response> {
  const url = buildStoreApiUrl(path, params);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    });
  } catch {
    throw new StoreApiError("Não foi possível conectar ao catálogo.");
  }

  if (!response.ok) {
    throw new StoreApiError(`O catálogo retornou HTTP ${response.status}.`);
  }

  return response;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new StoreApiError("O catálogo retornou dados inválidos.");
  }
}

export interface ProductQuery {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
  slug?: string;
  sort?: "recentes" | "preco_menor" | "preco_maior" | "avaliacao" | "populares";
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  attributes?: Array<{ taxonomy: string; slug: string }>;
}

export interface StoreAttribute {
  id: number;
  name: string;
  taxonomy: string;
}

export interface StoreAttributeTerm {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface CatalogPriceRange {
  min: number;
  max: number;
}

export async function getCatalogPriceRange(category?: string): Promise<CatalogPriceRange> {
  const params = new URLSearchParams({ calculate_price_range: "true" });
  if (category) params.set("category", category);
  const data = await readJson(await getPublicResponse("/products/collection-data", params));
  const range = (data as { price_range?: { min_price?: string; max_price?: string; currency_minor_unit?: number } })?.price_range;
  const divisor = 10 ** Number(range?.currency_minor_unit);
  const min = Number(range?.min_price) / divisor;
  const max = Number(range?.max_price) / divisor;
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(divisor) || divisor < 1 || min < 0 || max <= min) {
    throw new StoreApiError("A faixa de preços do catálogo é inválida.");
  }
  return { min: Math.floor(min), max: Math.ceil(max) };
}

export async function getProductAttributes(): Promise<StoreAttribute[]> {
  const data = await readJson(await getPublicResponse("/products/attributes"));
  if (!Array.isArray(data)) throw new StoreApiError("Os atributos do catálogo são inválidos.");
  return data as StoreAttribute[];
}

export async function getAttributeTerms(id: number): Promise<StoreAttributeTerm[]> {
  const data = await readJson(await getPublicResponse(`/products/attributes/${id}/terms`));
  if (!Array.isArray(data)) throw new StoreApiError("Os termos do atributo são inválidos.");
  return data as StoreAttributeTerm[];
}

export interface ProductCollection {
  items: StoreProduct[];
  total: number;
  totalPages: number;
}

export async function listProducts(query: ProductQuery = {}): Promise<ProductCollection> {
  const page = Math.max(1, Math.floor(query.page || 1));
  const perPage = Math.min(100, Math.max(1, Math.floor(query.perPage || 12)));
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    orderby: "date",
    order: "desc",
  });
  if (query.sort === "preco_menor" || query.sort === "preco_maior") {
    params.set("orderby", "price");
    params.set("order", query.sort === "preco_menor" ? "asc" : "desc");
  } else if (query.sort === "avaliacao" || query.sort === "populares") {
    params.set("orderby", query.sort === "avaliacao" ? "rating" : "popularity");
  }
  if (query.minPrice !== undefined) params.set("min_price", String(Math.round(query.minPrice * 100)));
  if (query.maxPrice !== undefined) params.set("max_price", String(Math.round(query.maxPrice * 100)));
  if (query.rating !== undefined) params.set("rating", String(query.rating));
  query.attributes?.forEach((attribute, index) => {
    params.set(`attributes[${index}][attribute]`, attribute.taxonomy);
    params.set(`attributes[${index}][slug]`, attribute.slug);
  });
  if (query.category) params.set("category", query.category);
  if (query.search) params.set("search", query.search);
  if (query.slug) params.set("slug", query.slug);

  const response = await getPublicResponse("/products", params);
  const data = await readJson(response);
  if (!Array.isArray(data)) throw new StoreApiError("O catálogo retornou uma lista inválida.");

  const totalHeader = response.headers.get("X-WP-Total");
  const totalPagesHeader = response.headers.get("X-WP-TotalPages");
  const total = totalHeader === null ? NaN : Number(totalHeader);
  const totalPages = totalPagesHeader === null ? NaN : Number(totalPagesHeader);
  return {
    items: data as StoreProduct[],
    total: Number.isFinite(total) ? total : data.length,
    totalPages: Number.isFinite(totalPages) ? totalPages : Math.ceil(data.length / perPage),
  };
}

export async function getProducts(limit = 8): Promise<StoreProduct[]> {
  return (await listProducts({ perPage: limit })).items;
}

export async function getProductBySlug(slug: string): Promise<StoreProduct | null> {
  // O WooCommerce pode retornar a variação antes do produto pai quando ambos
  // compartilham o mesmo slug. Percorra os resultados até encontrar o pai.
  const firstPage = await listProducts({ slug, perPage: 100 });
  const findParent = (items: StoreProduct[]) => items.find(
    (product) => product.slug === slug && product.type !== "variation" && !product.parent,
  );
  const initialMatch = findParent(firstPage.items);
  if (initialMatch) return initialMatch;

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const result = await listProducts({ slug, page, perPage: 100 });
    const match = findParent(result.items);
    if (match) return match;
  }
  return null;
}

export async function getVariationById(id: number): Promise<StoreProduct | null> {
  const response = await getPublicResponse(`/products/${id}`);
  const data = await readJson(response);
  if (!data || Array.isArray(data) || typeof data !== "object") {
    throw new StoreApiError("O catálogo retornou uma variação inválida.");
  }
  return data as StoreProduct;
}

export async function getCategories(includeEmpty = false): Promise<StoreCategory[]> {
  const response = await getPublicResponse(
    "/products/categories",
    new URLSearchParams({ per_page: "100", hide_empty: includeEmpty ? "false" : "true" }),
  );
  const data = await readJson(response);
  if (!Array.isArray(data)) throw new StoreApiError("O catálogo retornou categorias inválidas.");
  return data as StoreCategory[];
}
