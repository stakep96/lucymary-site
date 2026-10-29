import type { Metadata } from "next";
import Link from "next/link";
import { CatalogResults } from "@/components/catalog-results";
import { CatalogState } from "@/components/catalog-state";
import { parsePage } from "@/lib/catalog/parse-page";
import { getCategories, listProducts } from "@/lib/woocommerce/store-api";

export const metadata: Metadata = {
  title: "Todos os produtos | LucyMary",
  description: "Explore os produtos publicados no catálogo LucyMary.",
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string | string[] }>;
}) {
  const page = parsePage((await searchParams).pagina);
  const [productsResult, categoriesResult] = await Promise.allSettled([
    listProducts({ page, perPage: 12 }),
    getCategories(true),
  ]);
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value.filter((category) => category.parent === 0) : [];

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
      {productsResult.status === "fulfilled" ? (
        <CatalogResults collection={productsResult.value} page={page} basePath="/produtos" />
      ) : (
        <CatalogState title="Catálogo indisponível" message="Não foi possível carregar os produtos agora." retry retryHref="/produtos" />
      )}
    </section>
  );
}
