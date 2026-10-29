import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogResults } from "@/components/catalog-results";
import { CatalogState } from "@/components/catalog-state";
import { parsePage } from "@/lib/catalog/parse-page";
import { getCategories, listProducts } from "@/lib/woocommerce/store-api";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pagina?: string | string[] }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories(true)).find((item) => item.slug === slug);
  return { title: category ? `${category.name} | LucyMary` : "Categoria | LucyMary" };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const page = parsePage((await searchParams).pagina);
  const categories = await getCategories(true);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  let collection;
  try {
    collection = await listProducts({ category: category.slug, page, perPage: 12 });
  } catch {
    collection = null;
  }

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
      {collection ? (
        <CatalogResults collection={collection} page={page} basePath={`/categoria/${encodeURIComponent(slug)}`} />
      ) : (
        <CatalogState title="Categoria indisponível" message="Não foi possível carregar os produtos desta categoria agora." retry retryHref={`/categoria/${encodeURIComponent(slug)}`} />
      )}
    </section>
  );
}
