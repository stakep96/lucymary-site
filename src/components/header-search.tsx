"use client";

import { useEffect, useId, useRef } from "react";
import { SearchIcon } from "@/components/header-icons";

export function HeaderSearch({ mobile = false }: { mobile?: boolean }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      const details = detailsRef.current;
      if (details?.open && !details.contains(event.target as Node)) details.open = false;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || !detailsRef.current?.open) return;
      detailsRef.current.open = false;
      detailsRef.current.querySelector("summary")?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <details className={`header-search-toggle${mobile ? " mobile-header-search" : ""}`} ref={detailsRef} onToggle={(event) => { if (event.currentTarget.open) inputRef.current?.focus(); }}>
      <summary aria-label="Buscar produtos"><SearchIcon /></summary>
      <form action="/buscar" method="get" role="search">
        <label className="sr-only" htmlFor={inputId}>Buscar produtos</label>
        <input ref={inputRef} id={inputId} type="search" name="q" placeholder="Pesquisar produtos..." required />
        <button type="submit" aria-label="Buscar"><SearchIcon size={18} /></button>
      </form>
    </details>
  );
}
