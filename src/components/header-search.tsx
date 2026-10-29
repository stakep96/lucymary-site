"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/header-icons";
import type { SearchPreviewItem, SearchPreviewResponse } from "@/features/search/types";

type SearchStatus = "idle" | "loading" | "ready" | "error";

export function HeaderSearch({ mobile = false }: { mobile?: boolean }) {
  const toggleId = useId();
  const inputId = useId();
  const panelId = useId();
  const toggleRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<SearchPreviewItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Search unavailable");
        const data = (await response.json()) as SearchPreviewResponse;
        if (!Array.isArray(data.items) || typeof data.total !== "number") throw new Error("Invalid search response");
        setResults(data.items);
        setTotal(data.total);
        setStatus("ready");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (toggleRef.current) toggleRef.current.checked = false;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open]);

  function close() {
    if (toggleRef.current) toggleRef.current.checked = false;
    setOpen(false);
  }

  function clear() {
    setQuery("");
    setResults([]);
    setTotal(0);
    setStatus("idle");
    inputRef.current?.focus();
  }

  const searchUrl = `/buscar?q=${encodeURIComponent(query.trim())}`;
  const suggestions = results.slice(0, 5);

  return (
    <div className={`header-search-toggle${mobile ? " mobile-header-search" : ""}`}>
      <input
        ref={toggleRef}
        className="header-search-toggle-input"
        id={toggleId}
        type="checkbox"
        aria-label="Abrir busca"
        aria-controls={panelId}
        aria-expanded={open}
        onChange={(event) => {
          setOpen(event.target.checked);
          if (event.target.checked) window.requestAnimationFrame(() => inputRef.current?.focus());
        }}
      />
      <label className="header-search-trigger" htmlFor={toggleId} aria-hidden="true"><SearchIcon /></label>
      <div className="search-modal-overlay" id={panelId} role="dialog" aria-modal="true" aria-label="Buscar produtos">
        <label className="search-modal-backdrop" htmlFor={toggleId} aria-label="Fechar busca" onClick={() => setOpen(false)} />
        <div className="search-modal-panel">
          <div className="search-modal-top">
            <form action="/buscar" method="get" role="search" className="search-modal-form">
              <SearchIcon size={20} />
              <label className="sr-only" htmlFor={inputId}>Buscar produtos</label>
              <input
                ref={inputRef}
                id={inputId}
                type="search"
                name="q"
                placeholder="O que você procura?"
                autoComplete="off"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setResults([]);
                  setTotal(0);
                  setStatus("idle");
                }}
                required
              />
              {query && <button className="search-modal-clear" type="button" onClick={clear}>Limpar</button>}
            </form>
            <label className="search-modal-close" htmlFor={toggleId} aria-label="Fechar busca" onClick={() => setOpen(false)}><CloseIcon size={20} /></label>
          </div>

          <div className="search-modal-content" aria-live="polite">
            {status === "ready" && suggestions.length > 0 && (
              <div className="search-modal-suggestions" aria-label="Sugestões de produtos">
                {suggestions.map((item) => (
                  <Link key={item.id} href={`/produto/${encodeURIComponent(item.slug)}`} onClick={close}>{item.name}</Link>
                ))}
              </div>
            )}

            <div className="search-modal-section-heading">
              <span>Produtos</span>
              {status === "ready" && total > 0 && <span>{total} resultado{total === 1 ? "" : "s"}</span>}
            </div>

            {status === "idle" && <p className="search-modal-message">Digite pelo menos 2 letras para encontrar produtos.</p>}
            {status === "loading" && <p className="search-modal-message" role="status">Buscando produtos...</p>}
            {status === "error" && <p className="search-modal-message" role="alert">Não foi possível carregar os resultados. Tente novamente ou pressione Enter para buscar.</p>}
            {status === "ready" && results.length === 0 && <p className="search-modal-message">Nenhum produto encontrado para “{query.trim()}”.</p>}

            {status === "ready" && results.length > 0 && (
              <div className="search-modal-grid">
                {results.map((item) => (
                  <Link className="search-modal-product" key={item.id} href={`/produto/${encodeURIComponent(item.slug)}`} onClick={close}>
                    <span className="search-modal-product-image">
                      {item.image?.src ? (
                        <Image src={item.image.src} alt={item.image.alt || item.name} width={240} height={240} unoptimized />
                      ) : (
                        <span>LucyMary</span>
                      )}
                    </span>
                    {item.category && <span className="search-modal-product-category">{item.category}</span>}
                    <span className="search-modal-product-name">{item.name}</span>
                    <span className="search-modal-product-price">{item.price}</span>
                    {!item.inStock && <span className="search-modal-product-stock">Indisponível</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {query.trim().length >= 2 && (
            <div className="search-modal-footer">
              <Link href={searchUrl} onClick={close}>Ver todos os resultados</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
