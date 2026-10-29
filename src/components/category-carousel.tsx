"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { categoryImage } from "@/lib/brand/categories";
import type { StoreCategory } from "@/lib/woocommerce/types";

export function CategoryCarousel({ categories }: { categories: StoreCategory[] }) {
  const track = useRef<HTMLDivElement>(null);

  function scroll(direction: number) {
    track.current?.scrollBy({ left: direction * 520, behavior: "smooth" });
  }

  return (
    <div className="category-carousel">
      <button className="category-arrow" type="button" aria-label="Categorias anteriores" onClick={() => scroll(-1)}>‹</button>
      <div className="category-track" ref={track}>
        {categories.map((category) => {
          const image = categoryImage(category);
          return (
            <Link className="category-tile" href={`/categoria/${encodeURIComponent(category.slug)}`} key={category.id}>
              <span className="category-art">
                {image ? <Image src={image} alt="" width={160} height={160} unoptimized /> : <span aria-hidden="true">✦</span>}
              </span>
              <span className="category-name">{category.name}</span>
            </Link>
          );
        })}
      </div>
      <button className="category-arrow" type="button" aria-label="Próximas categorias" onClick={() => scroll(1)}>›</button>
    </div>
  );
}
