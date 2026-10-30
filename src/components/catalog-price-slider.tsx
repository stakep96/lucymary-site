"use client";

import { useState } from "react";
import type { CatalogPriceRange } from "@/lib/woocommerce/store-api";

interface CatalogPriceSliderProps {
  range: CatalogPriceRange;
  selectedMin?: number;
  selectedMax?: number;
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function CatalogPriceSlider({ range, selectedMin, selectedMax }: CatalogPriceSliderProps) {
  const floor = Math.max(0, Math.floor(Math.min(range.min, selectedMin ?? range.min)));
  const ceiling = Math.max(floor + 1, Math.ceil(Math.max(range.max, selectedMax ?? range.max)));
  const [min, setMin] = useState(() => Math.min(ceiling - 1, Math.max(floor, Math.round(selectedMin ?? floor))));
  const [max, setMax] = useState(() => Math.max(min + 1, Math.min(ceiling, Math.round(selectedMax ?? ceiling))));
  const span = ceiling - floor;
  const start = ((min - floor) / span) * 100;
  const end = ((max - floor) / span) * 100;

  return (
    <div className="catalog-price-slider">
      <div className="catalog-range-control">
        <div className="catalog-range-track"><span style={{ left: `${start}%`, right: `${100 - end}%` }} /></div>
        <input type="range" min={floor} max={ceiling} step="1" value={min}
          aria-label="Preço mínimo" aria-valuetext={currency.format(min)}
          onChange={(event) => setMin(Math.min(Number(event.target.value), max - 1))} />
        <input type="range" min={floor} max={ceiling} step="1" value={max}
          aria-label="Preço máximo" aria-valuetext={currency.format(max)}
          onChange={(event) => setMax(Math.max(Number(event.target.value), min + 1))} />
      </div>
      <div className="catalog-range-caption">
        <span>{currency.format(min)} – {currency.format(max)}</span>
        <button type="button" onClick={() => { setMin(floor); setMax(ceiling); }}>Reset</button>
      </div>
      <input type="hidden" name="preco_min" value={min > floor ? min : ""} />
      <input type="hidden" name="preco_max" value={max < ceiling ? max : ""} />
    </div>
  );
}
