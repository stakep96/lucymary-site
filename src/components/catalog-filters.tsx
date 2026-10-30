import Link from "next/link";
import type { CatalogQuery } from "@/lib/catalog/catalog-query";
import type { StoreAttributeTerm } from "@/lib/woocommerce/store-api";

export interface CatalogFacet {
  taxonomy: string;
  terms: StoreAttributeTerm[];
}

interface CatalogFiltersProps {
  basePath: string;
  query: CatalogQuery;
  color?: CatalogFacet;
  material?: CatalogFacet;
}

export function CatalogFilters({ basePath, query, color, material }: CatalogFiltersProps) {
  const hasFilters = query.minPrice !== undefined || query.maxPrice !== undefined || query.rating !== undefined || query.color || query.material;

  return (
    <details className="catalog-filters" open>
      <summary>Filtrar produtos <span aria-hidden="true">⌄</span></summary>
      <form action={basePath} className="catalog-filter-form">
        {query.perPage !== 16 && <input type="hidden" name="por_pagina" value={query.perPage} />}
        {query.sort !== "recentes" && <input type="hidden" name="ordenar" value={query.sort} />}
        <fieldset>
          <legend>Filtrar por preço</legend>
          <div className="catalog-price-fields">
            <label>De <span>R$</span><input name="preco_min" type="number" min="0" step="0.01" placeholder="0" defaultValue={query.minPrice} /></label>
            <label>Até <span>R$</span><input name="preco_max" type="number" min="0" step="0.01" placeholder="Máximo" defaultValue={query.maxPrice} /></label>
          </div>
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
        {color && color.terms.length > 0 && (
          <fieldset>
            <legend>Cores</legend>
            <label className="catalog-filter-choice"><input type="radio" name="cor" value="" defaultChecked={!query.color} /> Todas as cores</label>
            {color.terms.map((term) => <label className="catalog-filter-choice" key={term.id}><input type="radio" name="cor" value={term.slug} defaultChecked={query.color === term.slug} />{term.name}</label>)}
          </fieldset>
        )}
        {material && material.terms.length > 0 && (
          <fieldset>
            <legend>Material</legend>
            <label className="catalog-filter-choice"><input type="radio" name="material" value="" defaultChecked={!query.material} /> Todos os materiais</label>
            {material.terms.map((term) => <label className="catalog-filter-choice" key={term.id}><input type="radio" name="material" value={term.slug} defaultChecked={query.material === term.slug} />{term.name}</label>)}
          </fieldset>
        )}
        <div className="catalog-filter-actions">
          <button type="submit">Aplicar filtros</button>
          {hasFilters && <Link href={basePath}>Limpar</Link>}
        </div>
      </form>
    </details>
  );
}
