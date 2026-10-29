import { CatalogState } from "@/components/catalog-state";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import type { ProductCollection } from "@/lib/woocommerce/store-api";

interface CatalogResultsProps {
  collection: ProductCollection;
  page: number;
  basePath: string;
  query?: Record<string, string>;
  emptyMessage?: string;
}

export function CatalogResults({ collection, page, basePath, query, emptyMessage }: CatalogResultsProps) {
  if (collection.items.length === 0) {
    return <CatalogState title="Nenhum produto encontrado" message={emptyMessage || "Não há produtos publicados para esta seleção."} />;
  }

  return (
    <>
      <p className="results-count">{collection.total} {collection.total === 1 ? "produto" : "produtos"}</p>
      <div className="product-grid">
        {collection.items.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <Pagination page={page} totalPages={collection.totalPages} basePath={basePath} query={query} />
    </>
  );
}
