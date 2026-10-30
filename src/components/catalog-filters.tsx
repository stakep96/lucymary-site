import Link from "next/link";
import { CatalogPriceSlider } from "@/components/catalog-price-slider";
import type { CatalogQuery } from "@/lib/catalog/catalog-query";
import type { CatalogPriceRange, StoreAttributeTerm } from "@/lib/woocommerce/store-api";

export interface CatalogFacet {
  taxonomy: string;
  terms: StoreAttributeTerm[];
}

interface CatalogFiltersProps {
  basePath: string;
  query: CatalogQuery;
  color?: CatalogFacet;
  material?: CatalogFacet;
  priceRange?: CatalogPriceRange;
}

const colorReference = ["Bordô", "Dourado", "Prata", "Preto"];
const materialReference = ["Aço", "Aço inoxidável", "Couro", "Ouro 18k", "Plástico", "Prata 925"];
const colorClass = (name: string) => `catalog-color-${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, "-")}`;

export function CatalogFilters({ basePath, query, color, material, priceRange = { min: 0, max: 9999 } }: CatalogFiltersProps) {
  const hasFilters = query.minPrice !== undefined || query.maxPrice !== undefined || query.rating !== undefined || query.color || query.material;

  return (
    <details className="catalog-filters" open>
      <summary>Filtrar produtos <span aria-hidden="true">⌄</span></summary>
      <form action={basePath} className="catalog-filter-form">
        {query.perPage !== 16 && <input type="hidden" name="por_pagina" value={query.perPage} />}
        {query.sort !== "recentes" && <input type="hidden" name="ordenar" value={query.sort} />}
        <fieldset>
          <legend>Filtrar por preço</legend>
          <CatalogPriceSlider range={priceRange} selectedMin={query.minPrice} selectedMax={query.maxPrice} />
        </fieldset>
        <fieldset>
          <legend>Filtrar por avaliação</legend>
          <label className="catalog-filter-choice"><input type="radio" name="avaliacao" value="" defaultChecked={!query.rating} /> Todas as avaliações</label>
          {[5, 4, 3, 2, 1].map((rating) => (
            <label className="catalog-filter-choice" key={rating}>
              <input type="radio" name="avaliacao" value={rating} defaultChecked={query.rating === rating} />
              <span className="catalog-filter-stars" aria-label={`${rating} estrelas`}>{"★".repeat(rating)}<span>{"★".repeat(5 - rating)}</span></span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Cores</legend>
          {color?.terms.length ? (
            <>
              <label className="catalog-filter-choice"><input type="radio" name="cor" value="" defaultChecked={!query.color} /> Todas as cores</label>
              {color.terms.map((term) => <label className="catalog-filter-choice" key={term.id}><input type="radio" name="cor" value={term.slug} defaultChecked={query.color === term.slug} /><span className={`catalog-color-dot ${colorClass(term.name)}`} />{term.name}</label>)}
            </>
          ) : (
            <>
              {colorReference.map((name) => <label className="catalog-filter-choice catalog-filter-unavailable" key={name}><input type="checkbox" disabled /><span className={`catalog-color-dot ${colorClass(name)}`} />{name}</label>)}
              <small className="catalog-filter-note">Aguardando opções vinculadas aos produtos no WooCommerce.</small>
            </>
          )}
        </fieldset>
        <fieldset>
          <legend>Material</legend>
          {material?.terms.length ? (
            <>
              <label className="catalog-filter-choice"><input type="radio" name="material" value="" defaultChecked={!query.material} /> Todos os materiais</label>
              {material.terms.map((term) => <label className="catalog-filter-choice" key={term.id}><input type="radio" name="material" value={term.slug} defaultChecked={query.material === term.slug} />{term.name}</label>)}
            </>
          ) : (
            <>
              {materialReference.map((name) => <label className="catalog-filter-choice catalog-filter-unavailable" key={name}><input type="checkbox" disabled />{name}</label>)}
              <small className="catalog-filter-note">Aguardando opções vinculadas aos produtos no WooCommerce.</small>
            </>
          )}
        </fieldset>
        <div className="catalog-filter-actions">
          <button type="submit">Aplicar filtros</button>
          {hasFilters && <Link href={basePath}>Limpar</Link>}
        </div>
      </form>
    </details>
  );
}
