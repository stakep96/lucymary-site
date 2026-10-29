"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChatIcon, ChevronIcon, CloseIcon, MenuIcon, OrdersIcon, PhoneIcon, PinIcon, UserIcon } from "@/components/header-icons";
import type { StoreCategory } from "@/lib/woocommerce/types";

type MenuCategory = Pick<StoreCategory, "id" | "name" | "slug">;

export function MobileMenu({ categories }: { categories: MenuCategory[] }) {
  const toggleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && toggleRef.current?.checked) {
        toggleRef.current.checked = false;
        toggleRef.current.focus();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  function closeMenu() {
    if (toggleRef.current) toggleRef.current.checked = false;
  }

  return (
    <div className="mobile-menu">
      <input ref={toggleRef} className="mobile-menu-toggle" id="lucymary-mobile-toggle" type="checkbox" aria-label="Abrir menu de navegação" aria-controls="lucymary-mobile-drawer" />
      <label className="mobile-menu-trigger" htmlFor="lucymary-mobile-toggle" aria-hidden="true"><MenuIcon size={24} /></label>
      <div className="mobile-menu-overlay" id="lucymary-mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu LucyMary">
        <label className="mobile-menu-backdrop" htmlFor="lucymary-mobile-toggle" aria-label="Fechar menu" />
        <aside className="mobile-menu-panel">
          <div className="mobile-menu-brand">
            <Link href="/" aria-label="LucyMary, início" onClick={closeMenu}>
              <Image src="/brand/logo-vinho.png" alt="LucyMary" width={190} height={79} priority />
            </Link>
            <label className="mobile-menu-close" htmlFor="lucymary-mobile-toggle" aria-label="Fechar menu"><CloseIcon size={24} /></label>
          </div>

          <div className="mobile-menu-content">
              <div className="mobile-menu-account">
                <span className="mobile-menu-signin" title="Área do cliente em preparação">Entre ou cadastre-se <ChevronIcon /></span>
                <div>
                  <span title="Área do cliente em preparação"><UserIcon size={17} /> Minha conta</span>
                  <span title="Pedidos em preparação"><OrdersIcon size={17} /> Meus pedidos</span>
                </div>
              </div>

              <nav className="mobile-menu-links" aria-label="Links da loja">
                <Link href="/#lojas" onClick={closeMenu}><PinIcon /> Loja</Link>
                <Link href="/#contato" onClick={closeMenu}><PhoneIcon /> Contato</Link>
                <Link href="/#sobre" onClick={closeMenu}><span className="letter-mark" aria-hidden="true">L</span> Sobre</Link>
                <span title="Página em preparação"><ChatIcon /> Perguntas frequentes</span>
              </nav>

              <details className="mobile-menu-categories" open>
                <summary>Ver categorias <ChevronIcon /></summary>
                <nav aria-label="Categorias no celular">
                  {categories.map((category) => (
                    <Link href={`/categoria/${encodeURIComponent(category.slug)}`} key={category.id} onClick={closeMenu}>{category.name}</Link>
                  ))}
                  <Link href="/produtos" onClick={closeMenu}>Todos os produtos</Link>
                </nav>
              </details>
          </div>
        </aside>
      </div>
    </div>
  );
}
