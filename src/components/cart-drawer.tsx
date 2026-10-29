"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { BagIcon, CloseIcon } from "@/components/header-icons";
import { CartItemRow } from "@/components/cart-item-row";
import { formatCartAmount } from "@/features/cart/format";
import { useCart } from "@/features/cart/cart-provider";

export function CartDrawer({ mobile = false }: { mobile?: boolean }) {
  const { cart, status, error, drawerRequest, refresh } = useCart();
  const toggleId = useId();
  const panelId = useId();
  const titleId = useId();
  const toggleRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLLabelElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!drawerRequest || window.matchMedia("(max-width: 640px)").matches !== mobile) return;
    if (toggleRef.current) toggleRef.current.checked = true;
    closeRef.current?.focus();
  }, [drawerRequest, mobile]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!toggleRef.current?.checked) return;

      if (event.key === "Escape") {
        toggleRef.current.checked = false;
        toggleRef.current.focus();
      }

      if (event.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>("label[tabindex], a[href]");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function closeCart() {
    if (toggleRef.current) toggleRef.current.checked = false;
  }

  function handleCloseKeyDown(event: ReactKeyboardEvent<HTMLLabelElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    closeCart();
    toggleRef.current?.focus();
  }

  return (
    <div className="cart-drawer">
      <input ref={toggleRef} className="cart-drawer-toggle" id={toggleId} type="checkbox" aria-label={`Abrir sacola, ${cart?.itemsCount || 0} itens`} aria-controls={panelId} onChange={(event) => { if (event.target.checked) closeRef.current?.focus(); }} />
      <label className="cart-drawer-trigger bag-action" htmlFor={toggleId} aria-hidden="true">
        <BagIcon />
        <span className="bag-count" aria-hidden="true">{cart?.itemsCount || 0}</span>
      </label>

      <div className="cart-drawer-overlay" id={panelId} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <label className="cart-drawer-backdrop" htmlFor={toggleId} aria-label="Fechar sacola" />
        <aside className="cart-drawer-panel" ref={panelRef}>
          <div className="cart-drawer-header">
            <div>
              <span className="cart-drawer-eyebrow">Sua seleção</span>
              <h2 id={titleId}>Minha sacola</h2>
              <p>{cart?.itemsCount || 0} {(cart?.itemsCount || 0) === 1 ? "item" : "itens"}</p>
            </div>
            <label ref={closeRef} className="cart-drawer-close" htmlFor={toggleId} role="button" tabIndex={0} aria-label="Fechar sacola" onKeyDown={handleCloseKeyDown}>
              <CloseIcon size={22} />
            </label>
          </div>

          <div className={`cart-drawer-body${cart?.items.length ? " has-items" : ""}`}>
            {status === "loading" && <p className="cart-drawer-state" role="status">Carregando sua sacola...</p>}
            {status === "error" && <div className="cart-drawer-state" role="alert"><p>{error || "Não foi possível carregar a sacola."}</p><button type="button" onClick={() => { void refresh(); }}>Tentar novamente</button></div>}
            {status === "ready" && cart?.items.length === 0 && (
              <div className="cart-drawer-empty">
                <div className="cart-drawer-empty-icon"><BagIcon size={42} /></div>
                <h3>Sua sacola está vazia</h3>
                <p>Encontre uma peça especial para chamar de sua.</p>
              </div>
            )}
            {status === "ready" && cart && cart.items.length > 0 && (
              <div className="cart-drawer-items">
                {error && <p className="cart-inline-error" role="alert">{error}</p>}
                {cart.items.map((item) => <CartItemRow item={item} currency={cart.currency} key={item.key} />)}
              </div>
            )}
          </div>

          <div className="cart-drawer-footer">
            {cart?.items.length ? (
              <>
                <div className="cart-drawer-subtotal"><span>Subtotal</span><strong>{formatCartAmount(cart.totals.items, cart.currency)}</strong></div>
                <Link className="cart-drawer-shop" href="/carrinho" onClick={closeCart}>Ver carrinho <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" /></Link>
                <p>Frete e descontos são calculados pelo WooCommerce no carrinho.</p>
              </>
            ) : (
              <Link className="cart-drawer-shop" href="/produtos" onClick={closeCart}>
                Explorar coleção <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
