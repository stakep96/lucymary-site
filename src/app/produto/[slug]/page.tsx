import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { convert } from "html-to-text";
import { ProductOptions } from "@/components/product-options";
import { formatStorePrice } from "@/lib/woocommerce/format";
import { getProductBySlug, getVariationById } from "@/lib/woocommerce/store-api";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variacao?: string | string[]; escolhas?: string | string[] }>;
}

export const revalidate = 60;

function toText(html: string | undefined): string {
  return html ? convert(html, { wordwrap: false }).trim() : "";
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} | LucyMary` : "Produto | LucyMary",
    description: product ? toText(product.short_description || product.description).slice(0, 160) : undefined,
  };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const pageQuery = await searchParams;
  const rawVariation = pageQuery.variacao;
  const requestedVariationId = Number(Array.isArray(rawVariation) ? rawVariation[0] : rawVariation);
  const variationId = Number.isInteger(requestedVariationId) && requestedVariationId > 0
    ? requestedVariationId : product.type === "variable" && product.variations?.length === 1 ? product.variations[0].id : 0;
  const validVariation = product.variations?.some((item) => item.id === variationId);
  let variation = null;
  let variationError = false;
  if (validVariation) {
    try {
      const result = await getVariationById(variationId);
      variation = result?.parent === product.id ? result : null;
    } catch {
      variationError = true;
    }
  }

  const current = variation || product;
  const images = current.images?.length ? current.images : product.images || [];
  const description = toText(product.description);
  const shortDescription = toText(product.short_description);
  const category = product.categories?.[0];
  const isVariable = product.type === "variable";
  const optionAttributes = (product.attributes || []).filter((attribute) => attribute.has_variations);
  const selectedVariation = product.variations?.find((item) => item.id === variation?.id);
  let requestedChoices: Record<string, unknown> = {};
  const rawChoices = Array.isArray(pageQuery.escolhas) ? pageQuery.escolhas[0] : pageQuery.escolhas;
  if (rawChoices && rawChoices.length <= 1000) {
    try {
      const value = JSON.parse(rawChoices);
      if (value && typeof value === "object" && !Array.isArray(value)) requestedChoices = value;
    } catch { /* Escolhas inválidas são ignoradas. */ }
  }
  const initialChoices = Object.fromEntries(optionAttributes.map((attribute) => {
    const requested = requestedChoices[attribute.name];
    const fixed = selectedVariation?.attributes.find((item) => item.name.toLocaleLowerCase("pt-BR") === attribute.name.toLocaleLowerCase("pt-BR"))?.value;
    const chosen = typeof requested === "string" ? requested : fixed || (attribute.terms.length === 1 ? attribute.terms[0].name : "");
    const validTerm = attribute.terms.find((term) => term.name.toLocaleLowerCase("pt-BR") === chosen.toLocaleLowerCase("pt-BR"));
    return [attribute.name, validTerm?.name || ""];
  }));
  const characteristics = [
    product.brands?.length ? { label: "Marca", value: product.brands.map((brand) => brand.name).join(", ") } : null,
    ...(product.attributes || []).map((attribute) => ({
      label: attribute.name,
      value: attribute.terms.map((term) => term.name).join(", "),
    })),
    product.formatted_dimensions && product.formatted_dimensions !== "Não aplicável"
      ? { label: "Dimensões", value: product.formatted_dimensions } : null,
    product.weight && product.formatted_weight
      ? { label: "Peso", value: product.formatted_weight } : null,
    product.tags?.length ? { label: "Etiquetas", value: product.tags.map((tag) => tag.name).join(", ") } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item?.value));

  return (
    <article className="product-page shell">
      <nav className="breadcrumb" aria-label="Caminho da página">
        <Link href="/">Início</Link><span>/</span><Link href="/produtos">Produtos</Link>
        {category && <><span>/</span><Link href={`/categoria/${encodeURIComponent(category.slug)}`}>{category.name}</Link></>}
      </nav>
      <div className="product-detail">
        <div className="detail-gallery">
          <div className="detail-main-image">
            {images[0]?.src ? <Image src={images[0].src} alt={images[0].alt || product.name} fill sizes="(max-width: 800px) 100vw, 50vw" unoptimized priority /> : <span className="product-image-placeholder">✦</span>}
          </div>
          {images.length > 1 && (
            <div className="detail-thumbnails">
              {images.slice(1, 5).map((image, index) => (
                <div className="detail-thumbnail" key={`${image.src}-${index}`}>
                  <Image src={image.src} alt={image.alt || `${product.name} — imagem ${index + 2}`} fill sizes="120px" unoptimized />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="detail-info">
          {category && <Link className="eyebrow" href={`/categoria/${encodeURIComponent(category.slug)}`}>{category.name}</Link>}
          <h1>{product.name}</h1>
          <p className="detail-price">
            {isVariable && !variation && "A partir de "}
            {formatStorePrice(current.prices)}
            {current.on_sale && current.prices.regular_price !== current.prices.price && <del>{formatStorePrice(current.prices, current.prices.regular_price)}</del>}
          </p>
          <p className="detail-stock">{current.is_in_stock ? "Disponível na loja" : "Indisponível no momento"}</p>
          {variationError && <p className="detail-note">Não foi possível consultar esta opção agora.</p>}
          <ProductOptions
            key={product.id}
            slug={product.slug}
            productId={product.id}
            currentId={current.id}
            isVariable={isVariable}
            available={current.is_in_stock && current.is_purchasable !== false}
            soldIndividually={Boolean(current.sold_individually)}
            attributes={optionAttributes}
            variations={product.variations || []}
            initialChoices={initialChoices}
          />
          {shortDescription && <div className="detail-short-description"><h2>Sobre esta peça</h2><p>{shortDescription}</p></div>}
          {product.sku && <p className="detail-sku">Referência: {product.sku}</p>}
          <p className="detail-note">O WooCommerce confirma preço e disponibilidade ao adicionar à sacola. A finalização da compra está em preparação.</p>
        </div>
      </div>
      {description && <section className="detail-description"><span className="eyebrow">Detalhes da peça</span><h2>Descrição</h2><p>{description}</p></section>}
      {characteristics.length > 0 && (
        <section className="detail-characteristics" aria-labelledby="characteristics-title">
          <h2 id="characteristics-title">Características</h2>
          <dl>
            {characteristics.map(({ label, value }) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </section>
      )}
    </article>
  );
}
