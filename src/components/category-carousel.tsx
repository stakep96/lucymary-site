"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { categoryImage } from "@/lib/brand/categories";
import type { StoreCategory } from "@/lib/woocommerce/types";

export function CategoryCarousel({ categories }: { categories: StoreCategory[] }) {
  const track = useRef<HTMLDivElement>(null);
  const lastInteraction = useRef(0);
  const [activePage, setActivePage] = useState(0);
  const mobilePageCount = Math.max(0, categories.length - 1);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 640px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      const element = track.current;
      if (!element || !mobile.matches || reducedMotion.matches || document.hidden || Date.now() - lastInteraction.current < 6000) return;

      const firstTile = element.querySelector<HTMLElement>(".category-tile");
      if (!firstTile) return;
      const gap = Number.parseFloat(window.getComputedStyle(element).columnGap) || 0;
      const step = firstTile.offsetWidth + gap;
      const end = element.scrollWidth - element.clientWidth;
      if (end < 2) return;
      element.scrollTo({ left: element.scrollLeft + step > end + 2 ? 0 : element.scrollLeft + step, behavior: "smooth" });
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  function scroll(direction: number) {
    const element = track.current;
    const firstTile = element?.querySelector<HTMLElement>(".category-tile");
    if (!element || !firstTile) return;
    const gap = Number.parseFloat(window.getComputedStyle(element).columnGap) || 0;
    lastInteraction.current = Date.now();
    element.scrollBy({ left: direction * (firstTile.offsetWidth + gap), behavior: "smooth" });
  }

  function updateActivePage() {
    const element = track.current;
    const firstTile = element?.querySelector<HTMLElement>(".category-tile");
    if (!element || !firstTile) return;
    const gap = Number.parseFloat(window.getComputedStyle(element).columnGap) || 0;
    const step = firstTile.offsetWidth + gap;
    if (step > 0 && mobilePageCount > 0) {
      setActivePage(Math.min(mobilePageCount - 1, Math.max(0, Math.round(element.scrollLeft / step))));
    }
  }

  return (
    <div className="category-carousel">
      <button className="category-arrow category-arrow-prev" type="button" aria-label="Categorias anteriores" onClick={() => scroll(-1)}><ChevronLeft size={18} aria-hidden="true" /></button>
      <div className="category-track" ref={track} onScroll={updateActivePage} onTouchStart={() => { lastInteraction.current = Date.now(); }} onTouchEnd={() => { lastInteraction.current = Date.now(); }}>
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
      <button className="category-arrow category-arrow-next" type="button" aria-label="Próximas categorias" onClick={() => scroll(1)}><ChevronRight size={18} aria-hidden="true" /></button>
      {mobilePageCount > 1 && (
        <div className="category-indicators" aria-hidden="true">
          {Array.from({ length: mobilePageCount }, (_, index) => (
            <span className={index === activePage ? "active" : ""} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}
