import Link from "next/link";
import { CatalogState } from "@/components/catalog-state";
import { CategoryCarousel } from "@/components/category-carousel";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCard } from "@/components/product-card";
import { homeCategories } from "@/lib/brand/categories";
import { getCategories, getProducts, isStoreConfigured } from "@/lib/woocommerce/store-api";
import type { StoreCategory, StoreProduct } from "@/lib/woocommerce/types";

export const revalidate = 60;

export default async function HomePage() {
  let products: StoreProduct[] = [];
  let categories: StoreCategory[] = [];
  let catalogError = false;
  const configured = isStoreConfigured();

  if (configured) {
    const [productsResult, categoriesResult] = await Promise.allSettled([
      getProducts(12),
      getCategories(true),
    ]);
    if (productsResult.status === "fulfilled") products = productsResult.value;
    else catalogError = true;
    if (categoriesResult.status === "fulfilled") categories = categoriesResult.value;
  }

  return (
    <>
      <HeroCarousel />
      <section className="category-showcase shell" id="colecoes" aria-label="Categorias LucyMary">
        {categories.length > 0 ? <CategoryCarousel categories={homeCategories(categories)} /> : <div className="category-placeholder">Explore as coleções LucyMary</div>}
      </section>

      <section className="products-section" id="novidades" aria-labelledby="home-products-title">
        <div className="shell">
          <h1 className="brand-statement" id="home-products-title">Luxo para quem é livre para brilhar.</h1>
          {!configured ? (
            <CatalogState title="Catálogo em preparação" message="Os produtos aparecerão aqui assim que a conexão com a loja for configurada." />
          ) : catalogError ? (
            <CatalogState title="Não foi possível carregar os produtos" message="A vitrine está temporariamente indisponível. Tente novamente em instantes." retry />
          ) : products.length === 0 ? (
            <CatalogState title="Novidades em breve" message="Ainda não há produtos publicados para mostrar nesta coleção." />
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              <div className="all-products-row"><Link href="/produtos">Ver todos os produtos</Link></div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
