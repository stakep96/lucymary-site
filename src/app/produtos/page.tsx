import type { Metadata } from "next";
import Link from "next/link";
import { CatalogResults } from "@/components/catalog-results";
import { CatalogState } from "@/components/catalog-state";
import { parseCatalogQuery } from "@/lib/catalog/catalog-query";
import { loadCatalogFacets } from "@/lib/catalog/load-facets";
import { getCategories, listProducts } from "@/lib/woocommerce/store-api";

export const metadata: Metadata = {
  title: "Todos os produtos | LucyMary",
  description: "Explore os produtos publicados no catálogo LucyMary.",
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseCatalogQuery(await searchParams);
  const basicQuery = {
    page: filters.page, perPage: filters.perPage, sort: filters.sort,
    minPrice: filters.minPrice, maxPrice: filters.maxPrice, rating: filters.rating,
  };
  const simpleCollection = !filters.color && !filters.material
    ? listProducts(basicQuery).then((value) => ({ value, ok: true as const }), () => ({ ok: false as const }))
    : null;
  const [categories, facets] = await Promise.all([
    getCategories(true).then((items) => items.filter((category) => category.parent === 0), () => []),
    loadCatalogFacets(),
  ]);
  const attributes = [
    facets.color && filters.color && facets.color.terms.some((term) => term.slug === filters.color) ? { taxonomy: facets.color.taxonomy, slug: filters.color } : null,
    facets.material && filters.material && facets.material.terms.some((term) => term.slug === filters.material) ? { taxonomy: facets.material.taxonomy, slug: filters.material } : null,
  ].filter((item): item is { taxonomy: string; slug: string } => item !== null);
  const productsResult = simpleCollection
    ? await simpleCollection
    : await listProducts({ ...basicQuery, attributes }).then((value) => ({ value, ok: true as const }), () => ({ ok: false as const }));

  return (
    <section className="catalog-page shell">
      <div className="catalog-intro">
        <span className="eyebrow">Catálogo LucyMary</span>
        <h1>Encontre a sua próxima peça.</h1>
        <p>Produtos publicados diretamente pela nossa loja WooCommerce.</p>
      </div>
      {categories.length > 0 && (
        <nav className="category-list category-list-left" aria-label="Categorias de produtos">
          {categories.map((category) => (
            <Link className="category-pill" href={`/categoria/${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}</Link>
          ))}
        </nav>
      )}
      {productsResult.ok ? (
        <CatalogResults collection={productsResult.value} page={filters.page} basePath="/produtos" filters={filters} color={facets.color} material={facets.material} />
      ) : (
        <CatalogState title="Catálogo indisponível" message="Não foi possível carregar os produtos agora." retry retryHref="/produtos" />
      )}
    </section>
  );
}
