import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogResults } from "@/components/catalog-results";
import { CatalogState } from "@/components/catalog-state";
import { parseCatalogQuery } from "@/lib/catalog/catalog-query";
import { loadCatalogFacets } from "@/lib/catalog/load-facets";
import { getCatalogPriceRange, getCategories, listProducts } from "@/lib/woocommerce/store-api";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories(true)).find((item) => item.slug === slug);
  return { title: category ? `${category.name} | LucyMary` : "Categoria | LucyMary" };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const filters = parseCatalogQuery(await searchParams);
  const categories = await getCategories(true);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const facetsPromise = loadCatalogFacets();
  const priceRangePromise = getCatalogPriceRange(category.slug).catch(() => ({ min: 0, max: 9999 }));
  const basicQuery = {
    category: category.slug, page: filters.page, perPage: filters.perPage,
    sort: filters.sort, minPrice: filters.minPrice, maxPrice: filters.maxPrice, rating: filters.rating,
  };
  const simpleCollection = !filters.color && !filters.material
    ? listProducts(basicQuery).then((value) => ({ value, ok: true as const }), () => ({ ok: false as const }))
    : null;
  const facets = await facetsPromise;
  const priceRange = await priceRangePromise;
  const attributes = [
    facets.color && filters.color && facets.color.terms.some((term) => term.slug === filters.color) ? { taxonomy: facets.color.taxonomy, slug: filters.color } : null,
    facets.material && filters.material && facets.material.terms.some((term) => term.slug === filters.material) ? { taxonomy: facets.material.taxonomy, slug: filters.material } : null,
  ].filter((item): item is { taxonomy: string; slug: string } => item !== null);
  const collectionResult = simpleCollection
    ? await simpleCollection
    : await listProducts({ ...basicQuery, attributes }).then((value) => ({ value, ok: true as const }), () => ({ ok: false as const }));

  return (
    <section className="catalog-page shell">
      <nav className="breadcrumb" aria-label="Caminho da página">
        <Link href="/">Início</Link><span>/</span><Link href="/produtos">Produtos</Link><span>/</span><span>{category.name}</span>
      </nav>
      <div className="catalog-intro">
        <span className="eyebrow">Coleção LucyMary</span>
        <h1>{category.name}</h1>
        <p>{category.count} {category.count === 1 ? "produto publicado" : "produtos publicados"} nesta categoria.</p>
      </div>
      <nav className="category-list category-list-left" aria-label="Outras categorias">
        {categories.filter((item) => item.parent === 0).map((item) => (
          <Link className={`category-pill${item.id === category.id ? " active" : ""}`} href={`/categoria/${encodeURIComponent(item.slug)}`} key={item.id} aria-current={item.id === category.id ? "page" : undefined}>{item.name}</Link>
        ))}
      </nav>
      {collectionResult.ok ? (
        <CatalogResults collection={collectionResult.value} page={filters.page} basePath={`/categoria/${encodeURIComponent(slug)}`} filters={filters} color={facets.color} material={facets.material} priceRange={priceRange} />
      ) : (
        <CatalogState title="Categoria indisponível" message="Não foi possível carregar os produtos desta categoria agora." retry retryHref={`/categoria/${encodeURIComponent(slug)}`} />
      )}
    </section>
  );
}
