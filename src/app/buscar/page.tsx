import type { Metadata } from "next";
import { CatalogResults } from "@/components/catalog-results";
import { CatalogState } from "@/components/catalog-state";
import { parsePage } from "@/lib/catalog/parse-page";
import { listProducts } from "@/lib/woocommerce/store-api";

export const metadata: Metadata = { title: "Buscar produtos | LucyMary" };
export const revalidate = 60;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; pagina?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (rawQuery || "").trim().slice(0, 80);
  const page = parsePage(params.pagina);

  let collection = null;
  let failed = false;
  if (query) {
    try {
      collection = await listProducts({ search: query, page, perPage: 12 });
    } catch {
      failed = true;
    }
  }

  return (
    <section className="catalog-page shell">
      <div className="catalog-intro">
        <span className="eyebrow">Catálogo LucyMary</span>
        <h1>Buscar produtos</h1>
        <form className="search-page-form" action="/buscar" method="get" role="search">
          <label className="sr-only" htmlFor="catalog-query">Nome do produto</label>
          <input id="catalog-query" type="search" name="q" defaultValue={query} placeholder="O que você procura?" required />
          <button type="submit">Buscar</button>
        </form>
      </div>
      {!query ? (
        <CatalogState title="O que você procura?" message="Digite o nome de uma peça para encontrar produtos publicados na loja." />
      ) : failed ? (
        <CatalogState title="Busca indisponível" message="Não foi possível consultar o catálogo agora." retry retryHref={`/buscar?q=${encodeURIComponent(query)}`} />
      ) : collection ? (
        <>
          <p className="search-summary">Resultados para “{query}”</p>
          <CatalogResults collection={collection} page={page} basePath="/buscar" query={{ q: query }} emptyMessage="Nenhum produto publicado corresponde a esta busca." />
        </>
      ) : null}
    </section>
  );
}
