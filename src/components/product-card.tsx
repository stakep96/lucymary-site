import Image from "next/image";
import Link from "next/link";
import { formatStorePrice } from "@/lib/woocommerce/format";
import type { StoreProduct } from "@/lib/woocommerce/types";

interface ProductCardProps {
  product: StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];
  const category = product.categories?.[0]?.name;
  const tag = product.tags?.[0]?.name;
  const rating = Number(product.average_rating || 0);
  const reviewCount = product.review_count || 0;

  return (
    <article className="product-card">
      <Link className="product-image-wrap" href={`/produto/${encodeURIComponent(product.slug)}`} aria-label={`Ver ${product.name}`}>
        {image?.src ? (
          <Image
            className="product-image"
            src={image.src}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="product-image-placeholder" aria-label="Imagem indisponível">✦</div>
        )}
        {tag && <span className="product-badge">{tag}</span>}
      </Link>
      <div className="product-copy">
        {category && <span className="product-category">{category}</span>}
        <h3><Link href={`/produto/${encodeURIComponent(product.slug)}`}>{product.name}</Link></h3>
        <div className="product-rating" aria-label={`Avaliação ${rating} de 5, ${reviewCount} avaliações`}>
          <span aria-hidden="true">{rating > 0 ? "★".repeat(Math.min(5, Math.round(rating))) + "☆".repeat(Math.max(0, 5 - Math.round(rating))) : "☆☆☆☆☆"}</span>
          <small>({reviewCount})</small>
        </div>
        <p className="product-price">{product.type === "variable" && "A partir de "}{formatStorePrice(product.prices)}</p>
        {!product.is_in_stock && <span className="stock-note">Indisponível</span>}
      </div>
    </article>
  );
}
