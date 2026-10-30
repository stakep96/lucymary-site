export type CatalogSort = "recentes" | "preco_menor" | "preco_maior" | "avaliacao" | "populares";

export interface CatalogQuery {
  page: number;
  perPage: 8 | 12 | 16 | 24;
  sort: CatalogSort;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  color?: string;
  material?: string;
}

type RawQuery = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function price(value: string | undefined): number | undefined {
  if (!value || !/^\d+(?:[.,]\d{1,2})?$/.test(value)) return undefined;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1_000_000 ? parsed : undefined;
}

export function parseCatalogQuery(raw: RawQuery): CatalogQuery {
  const pageValue = Number(one(raw.pagina));
  const perPageValue = Number(one(raw.por_pagina));
  const ratingValue = Number(one(raw.avaliacao));
  const sortValue = one(raw.ordenar);
  const minPrice = price(one(raw.preco_min));
  const maxPrice = price(one(raw.preco_max));
  const slug = (value: string | undefined) => value && /^[a-z0-9-]{1,80}$/.test(value) ? value : undefined;

  return {
    page: Number.isSafeInteger(pageValue) && pageValue > 0 && pageValue <= 1000 ? pageValue : 1,
    perPage: ([8, 12, 16, 24] as const).find((size) => size === perPageValue) ?? 16,
    sort: (["recentes", "preco_menor", "preco_maior", "avaliacao", "populares"] as const).find((sort) => sort === sortValue) ?? "recentes",
    minPrice,
    maxPrice: maxPrice !== undefined && (minPrice === undefined || maxPrice >= minPrice) ? maxPrice : undefined,
    rating: Number.isInteger(ratingValue) && ratingValue >= 1 && ratingValue <= 5 ? ratingValue : undefined,
    color: slug(one(raw.cor)),
    material: slug(one(raw.material)),
  };
}

export function catalogQueryParams(query: CatalogQuery): Record<string, string> {
  const params: Record<string, string> = {};
  if (query.perPage !== 16) params.por_pagina = String(query.perPage);
  if (query.sort !== "recentes") params.ordenar = query.sort;
  if (query.minPrice !== undefined) params.preco_min = String(query.minPrice);
  if (query.maxPrice !== undefined) params.preco_max = String(query.maxPrice);
  if (query.rating !== undefined) params.avaliacao = String(query.rating);
  if (query.color) params.cor = query.color;
  if (query.material) params.material = query.material;
  return params;
}
