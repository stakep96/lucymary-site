"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { CartItemRow } from "@/components/cart-item-row";
import { BagIcon } from "@/components/header-icons";
import { formatCartAmount } from "@/features/cart/format";
import { useCart } from "@/features/cart/cart-provider";

const states = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export function CartPage() {
  const { cart, status, busy, error, refresh, perform } = useCart();
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    if (status === "idle") void refresh();
  }, [status, refresh]);

  async function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!coupon.trim()) return;
    try {
      await perform({ action: "applyCoupon", code: coupon.trim() });
      setCoupon("");
    } catch { /* O erro aparece no resumo. */ }
  }

  async function updateShipping(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await perform({
        action: "updateShipping",
        postcode: String(form.get("postcode") || ""),
        city: String(form.get("city") || ""),
        state: String(form.get("state") || ""),
      });
    } catch { /* O erro aparece no resumo. */ }
  }

  return (
    <div className="cart-page shell">
      <nav className="breadcrumb" aria-label="Caminho da página"><Link href="/">Início</Link><span>/</span><span>Minha sacola</span></nav>
      <header className="cart-page-heading"><span className="eyebrow">Sua seleção</span><h1>Minha sacola</h1><p>Itens e valores calculados pelo WooCommerce.</p></header>

      {(status === "idle" || status === "loading") && <div className="cart-page-state" role="status">Carregando sua sacola...</div>}
      {status === "error" && <div className="cart-page-state" role="alert"><p>{error || "Não foi possível carregar a sacola."}</p><button type="button" onClick={() => { void refresh(); }}>Tentar novamente</button></div>}
      {status === "ready" && cart && cart.items.length === 0 && (
        <div className="cart-page-state"><BagIcon size={40} /><h2>Sua sacola está vazia</h2><p>Explore as coleções e escolha suas peças favoritas.</p><Link href="/produtos">Explorar produtos</Link></div>
      )}

      {status === "ready" && cart && cart.items.length > 0 && (
        <div className="cart-page-layout">
          <div className="cart-page-main">
            <section className="cart-page-section" aria-label="Itens da sacola">
              <div className="cart-page-section-title"><h2>Produtos</h2><span>{cart.itemsCount} {cart.itemsCount === 1 ? "item" : "itens"}</span></div>
              {cart.items.map((item) => <CartItemRow item={item} currency={cart.currency} key={item.key} />)}
            </section>

            <section className="cart-page-section" aria-labelledby="coupon-title">
              <div className="cart-page-section-title"><h2 id="coupon-title">Cupom de desconto</h2></div>
              <form className="cart-coupon-form" onSubmit={(event) => { void applyCoupon(event); }}>
                <label className="sr-only" htmlFor="cart-coupon">Código do cupom</label>
                <input id="cart-coupon" value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Digite seu cupom" maxLength={80} disabled={busy} />
                <button type="submit" disabled={busy || !coupon.trim()}>Aplicar</button>
              </form>
              {cart.coupons.length > 0 && <div className="cart-applied-coupons">{cart.coupons.map((applied) => (
                <span key={applied.code}>{applied.code} <button type="button" disabled={busy} aria-label={`Remover cupom ${applied.code}`} onClick={() => { void perform({ action: "removeCoupon", code: applied.code }).catch(() => {}); }}>×</button></span>
              ))}</div>}
            </section>

            {cart.shipping.needed && (
              <section className="cart-page-section" aria-labelledby="shipping-title">
                <div className="cart-page-section-title"><h2 id="shipping-title">Calcular frete</h2></div>
                <form className="cart-shipping-form" key={`${cart.shipping.address.postcode}-${cart.shipping.address.city}-${cart.shipping.address.state}`} onSubmit={(event) => { void updateShipping(event); }}>
                  <label>CEP<input name="postcode" defaultValue={cart.shipping.address.postcode} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" required disabled={busy} /></label>
                  <label>Cidade<input name="city" defaultValue={cart.shipping.address.city} autoComplete="address-level2" required disabled={busy} /></label>
                  <label>Estado<select name="state" defaultValue={cart.shipping.address.state} autoComplete="address-level1" required disabled={busy}><option value="">Selecione</option>{states.map((code) => <option value={code} key={code}>{code}</option>)}</select></label>
                  <button type="submit" disabled={busy}>Calcular</button>
                </form>
                {cart.shipping.packages.map((shippingPackage) => (
                  <div className="cart-shipping-package" key={shippingPackage.id}>
                    {cart.shipping.packages.length > 1 && <h3>{shippingPackage.name}</h3>}
                    {shippingPackage.rates.map((rate) => (
                      <label className="cart-shipping-rate" key={rate.id}>
                        <input type="radio" name={`shipping-${shippingPackage.id}`} checked={rate.selected} disabled={busy} onChange={() => { void perform({ action: "selectShipping", packageId: shippingPackage.id, rateId: rate.id }).catch(() => {}); }} />
                        <span>{rate.name}{rate.deliveryTime && <small>{rate.deliveryTime}</small>}</span>
                        <strong>{formatCartAmount(rate.price, cart.currency)}</strong>
                      </label>
                    ))}
                    {cart.shipping.calculated && shippingPackage.rates.length === 0 && <p className="cart-shipping-note">Nenhuma opção de entrega disponível para este endereço.</p>}
                  </div>
                ))}
                {!cart.shipping.calculated && <p className="cart-shipping-note">Informe seu endereço para consultar as opções da loja.</p>}
              </section>
            )}
          </div>

          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <h2 id="cart-summary-title">Resumo</h2>
            {error && <p className="cart-inline-error" role="alert">{error}</p>}
            <div><span>Subtotal</span><span>{formatCartAmount(cart.totals.items, cart.currency)}</span></div>
            {Number(cart.totals.discount) > 0 && <div><span>Descontos</span><span>− {formatCartAmount(cart.totals.discount, cart.currency)}</span></div>}
            {cart.shipping.needed && <div><span>Frete</span><span>{cart.shipping.calculated ? formatCartAmount(cart.totals.shipping, cart.currency) : "A calcular"}</span></div>}
            {Number(cart.totals.tax) > 0 && <div><span>Impostos</span><span>{formatCartAmount(cart.totals.tax, cart.currency)}</span></div>}
            <div className="cart-summary-total"><strong>Total</strong><strong>{formatCartAmount(cart.totals.total, cart.currency)}</strong></div>
            <button type="button" disabled>Finalização de compra em preparação</button>
            <p>O pagamento será habilitado após a validação do Checkout Pro em ambiente de testes.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
