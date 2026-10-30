import { CatalogState } from "@/components/catalog-state";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { CatalogFilters, type CatalogFacet } from "@/components/catalog-filters";
import { catalogQueryParams, type CatalogQuery } from "@/lib/catalog/catalog-query";
import type { ProductCollection } from "@/lib/woocommerce/store-api";

interface CatalogResultsProps {
  collection: ProductCollection;
  page: number;
  basePath: string;
  query?: Record<string, string>;
  emptyMessage?: string;
  filters?: CatalogQuery;
  color?: CatalogFacet;
  material?: CatalogFacet;
}

export function CatalogResults({ collection, page, basePath, query, emptyMessage, filters, color, material }: CatalogResultsProps) {
  const paginationQuery = filters ? catalogQueryParams(filters) : query;
  const first = collection.items.length === 0 ? 0 : (page - 1) * (filters?.perPage ?? 12) + 1;
  const last = collection.items.length === 0 ? 0 : Math.min(collection.total, first + collection.items.length - 1);

  return (
    <div className={filters ? "catalog-layout" : ""}>
      {filters && <CatalogFilters basePath={basePath} query={filters} color={color} material={material} />}
      <div className="catalog-main">
        {filters ? (
          <div className="catalog-toolbar">
            <p>Exibindo {first}–{last} de {collection.total} {collection.total === 1 ? "resultado" : "resultados"}</p>
            <form action={basePath}>
              {Object.entries(paginationQuery ?? {}).filter(([key]) => key !== "por_pagina" && key !== "ordenar").map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
              <label>Por página <select name="por_pagina" defaultValue={filters.perPage}>{[8, 12, 16, 24].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
              <label>Ordenar <select name="ordenar" defaultValue={filters.sort}>
                <option value="recentes">Mais recentes</option>
                <option value="preco_menor">Menor preço</option>
                <option value="preco_maior">Maior preço</option>
                <option value="avaliacao">Melhor avaliação</option>
                <option value="populares">Mais populares</option>
              </select></label>
              <button type="submit">Atualizar</button>
            </form>
          </div>
        ) : <p className="results-count">{collection.total} {collection.total === 1 ? "produto" : "produtos"}</p>}
        {collection.items.length === 0 ? (
          <CatalogState title="Nenhum produto encontrado" message={emptyMessage || "Não há produtos publicados para esta seleção."} />
        ) : <div className="product-grid">
          {collection.items.map((product) => <ProductCard key={product.id} product={product} showCatalogAction={Boolean(filters)} />)}
        </div>}
        <Pagination page={page} totalPages={collection.totalPages} basePath={basePath} query={paginationQuery} />
      </div>
    </div>
  );
}
