"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, type CSSProperties, type FormEvent, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Ruler, Truck, X } from "lucide-react";
import { AddToCart } from "@/components/add-to-cart";
import { formatCartAmount } from "@/features/cart/format";
import type { CartCurrency, CartShippingPackage } from "@/features/cart/types";
import type { StoreProductAttribute, StoreVariationSummary } from "@/lib/woocommerce/types";

interface Quote {
  postcode: string;
  packages: CartShippingPackage[];
  currency: CartCurrency;
  calculated: boolean;
  needed: boolean;
}

interface ProductOptionsProps {
  slug: string;
  productId: number;
  currentId: number;
  isVariable: boolean;
  available: boolean;
  soldIndividually: boolean;
  attributes: StoreProductAttribute[];
  variations: StoreVariationSummary[];
  initialChoices: Record<string, string>;
}

function normal(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function accepts(variation: StoreVariationSummary, choices: Record<string, string>) {
  return Object.entries(choices).every(([name, chosen]) => {
    if (!chosen) return true;
    const rule = variation.attributes.find((item) => normal(item.name) === normal(name));
    return !rule?.value || normal(rule.value) === normal(chosen);
  });
}

function bestVariation(variations: StoreVariationSummary[], choices: Record<string, string>) {
  return variations.filter((variation) => accepts(variation, choices)).sort((a, b) =>
    b.attributes.filter((attribute) => attribute.value).length - a.attributes.filter((attribute) => attribute.value).length,
  )[0];
}

function RingSizeSelector({ attribute, choices, variations, onSelect }: {
  attribute: StoreProductAttribute;
  choices: Record<string, string>;
  variations: StoreVariationSummary[];
  onSelect: (name: string, value: string) => void;
}) {
  const selectedIndex = attribute.terms.findIndex((term) => normal(term.name) === normal(choices[attribute.name] || ""));
  const [defaultFocusIndex, setDefaultFocusIndex] = useState(() => selectedIndex >= 0 ? selectedIndex : Math.min(3, attribute.terms.length - 1));
  const focusIndex = selectedIndex >= 0 ? selectedIndex : defaultFocusIndex;
  const touchStartX = useRef<number | null>(null);
  const lastSwipeAt = useRef(0);
  const guideRef = useRef<HTMLDialogElement>(null);
  const guideTitleId = useId();
  const count = attribute.terms.length;
  const slots = Math.min(7, count);
  const center = Math.floor(slots / 2);
  const visibleIndices = Array.from({ length: slots }, (_, position) => (focusIndex + position - center + count) % count);

  function isPossible(index: number) {
    const term = attribute.terms[index];
    return Boolean(term && variations.some((item) => accepts(item, { ...choices, [attribute.name]: term.name })));
  }

  function selectIndex(index: number) {
    const term = attribute.terms[index];
    if (!term || !isPossible(index)) return;
    setDefaultFocusIndex(index);
    onSelect(attribute.name, term.name);
  }

  function move(direction: -1 | 1) {
    if (!count) return;
    for (let step = 1; step <= count; step += 1) {
      const index = (focusIndex + direction * step + count * 2) % count;
      if (isPossible(index)) { selectIndex(index); return; }
    }
  }

  function endTouch(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0]?.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance || 0) < 32) return;
    lastSwipeAt.current = Date.now();
    move(distance! > 0 ? -1 : 1);
  }

  return (
    <fieldset className="product-option-group ring-size-group">
      <legend>Tamanho do Aro {choices[attribute.name] && <span>{choices[attribute.name]}</span>}</legend>
      <div className="ring-size-selector" style={{ "--ring-slots": slots } as CSSProperties} onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={endTouch}>
        <button className="ring-size-arrow" type="button" aria-label="Selecionar aro anterior" disabled={count < 2} onClick={() => { if (Date.now() - lastSwipeAt.current >= 300) move(-1); }}><ChevronLeft size={18} /></button>
        <div className="ring-size-track">
          {visibleIndices.map((index, position) => {
            const term = attribute.terms[index];
            const selected = selectedIndex === index;
            const centered = position === center;
            return <button type="button" className={`${centered ? "centered" : ""}${selected ? " selected" : ""}`} aria-pressed={selected} aria-label={`Aro ${term.name}`} disabled={!isPossible(index)} onClick={() => { if (Date.now() - lastSwipeAt.current >= 300) selectIndex(index); }} key={term.id || term.name}>{term.name}</button>;
          })}
        </div>
        <button className="ring-size-arrow" type="button" aria-label="Selecionar próximo aro" disabled={count < 2} onClick={() => { if (Date.now() - lastSwipeAt.current >= 300) move(1); }}><ChevronRight size={18} /></button>
      </div>
      <button className="ring-size-guide-trigger" type="button" onClick={() => guideRef.current?.showModal()}><Ruler size={16} aria-hidden="true" />Tabela de medidas</button>
      <dialog className="ring-size-dialog" ref={guideRef} aria-labelledby={guideTitleId} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
        <div className="ring-size-dialog-content">
          <button className="ring-size-dialog-close" type="button" aria-label="Fechar tabela de medidas" onClick={() => guideRef.current?.close()}><X size={20} /></button>
          <Ruler size={22} className="ring-size-dialog-icon" aria-hidden="true" />
          <h2 id={guideTitleId}>Tabela de medidas</h2>
          <p>A tabela oficial de aros da LucyMary será adicionada aqui em breve.</p>
        </div>
      </dialog>
    </fieldset>
  );
}

export function ProductOptions({ slug, productId, currentId, isVariable, available, soldIndividually, attributes, variations, initialChoices }: ProductOptionsProps) {
  const router = useRouter();
  const [choices, setChoices] = useState(initialChoices);
  const choicesRef = useRef(choices);
  const selectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ringBrowsing, setRingBrowsing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [postcode, setPostcode] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [selectionUpdating, startTransition] = useTransition();
  useEffect(() => () => { if (selectionTimer.current) clearTimeout(selectionTimer.current); }, []);
  const complete = attributes.every((attribute) => Boolean(choices[attribute.name]));
  const matched = complete && attributes.length ? bestVariation(variations, choices) : null;
  const selectionReady = !ringBrowsing && (!isVariable || (attributes.length === 0 ? currentId !== productId : Boolean(matched && matched.id === currentId)));
  const variation = isVariable && attributes.length ? attributes.map((attribute) => ({
    attribute: attribute.name,
    value: choices[attribute.name] || "",
  })) : [];

  function navigate(next: Record<string, string>, selectedId?: number) {
    const params = new URLSearchParams();
    if (selectedId) params.set("variacao", String(selectedId));
    if (Object.values(next).some(Boolean)) params.set("escolhas", JSON.stringify(next));
    const path = `/produto/${encodeURIComponent(slug)}${params.size ? `?${params}` : ""}`;
    startTransition(() => router.replace(path, { scroll: false }));
  }

  function commitSelection(next: Record<string, string>) {
    const allChosen = attributes.every((attribute) => Boolean(next[attribute.name]));
    navigate(next, allChosen ? bestVariation(variations, next)?.id : undefined);
  }

  function select(name: string, value: string, browseRing = false) {
    const next = { ...choicesRef.current, [name]: value };
    choicesRef.current = next;
    setChoices(next);
    setQuote(null);
    setQuoteError("");
    if (selectionTimer.current) clearTimeout(selectionTimer.current);
    selectionTimer.current = null;
    if (browseRing) {
      setRingBrowsing(true);
      selectionTimer.current = setTimeout(() => {
        selectionTimer.current = null;
        setRingBrowsing(false);
        commitSelection(choicesRef.current);
      }, 750);
    } else {
      setRingBrowsing(false);
      commitSelection(next);
    }
  }

  async function calculateShipping(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuote(null);
    setQuoteError("");
    if (!selectionReady || selectionUpdating) {
      setQuoteError("Escolha as opções do produto para consultar o frete.");
      return;
    }
    if (!/^\d{8}$/.test(postcode.replace(/\D/g, ""))) {
      setQuoteError("Informe um CEP com 8 dígitos.");
      return;
    }
    setQuoteLoading(true);
    try {
      const response = await fetch("/api/shipping-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentId, quantity, variation, postcode }),
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível calcular o frete.");
      setQuote(data as Quote);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Não foi possível calcular o frete.");
    } finally {
      setQuoteLoading(false);
    }
  }

  return (
    <div className="product-purchase">
      {isVariable && (
        <section className="variation-section" aria-label="Personalizar produto">
          <div className="variation-heading"><span className="eyebrow">Sua escolha</span><h2>Personalize sua peça</h2></div>
          {attributes.map((attribute) => /\baro\b|tamanho do anel/i.test(attribute.name) ? (
            <RingSizeSelector key={attribute.name} attribute={attribute} choices={choices} variations={variations} onSelect={(name, value) => select(name, value, true)} />
          ) : (
            <fieldset className="product-option-group" key={attribute.name}>
              <legend>{attribute.name} {choices[attribute.name] && <span>{choices[attribute.name]}</span>}</legend>
              <div className={`product-option-values${attribute.terms.length > 12 ? " compact" : ""}`}>
                {attribute.terms.map((term) => {
                  const selected = normal(choices[attribute.name] || "") === normal(term.name);
                  const candidate = { ...choices, [attribute.name]: term.name };
                  const possible = variations.some((item) => accepts(item, candidate));
                  return <button type="button" className={selected ? "selected" : ""} aria-pressed={selected} disabled={!possible} onClick={() => select(attribute.name, term.name)} key={term.id || term.name}>{term.name}</button>;
                })}
              </div>
            </fieldset>
          ))}
          {attributes.length === 0 && <div className="product-option-values">{variations.map((item, index) => (
            <button type="button" className={currentId === item.id ? "selected" : ""} aria-pressed={currentId === item.id} onClick={() => navigate({}, item.id)} key={item.id}>Opção {index + 1}</button>
          ))}</div>}
          {complete && attributes.length > 0 && !matched && <p className="product-option-unavailable" role="status">Essa combinação não está disponível.</p>}
          {!complete && attributes.length > 0 && <p className="product-option-hint">Selecione todas as opções para consultar o preço e a disponibilidade.</p>}
          {complete && selectionUpdating && <p className="product-option-hint" role="status">Atualizando preço e disponibilidade da opção selecionada...</p>}
        </section>
      )}

      <AddToCart productId={currentId} available={available} selectionReady={selectionReady} selectionUpdating={selectionUpdating} selectionBrowsing={ringBrowsing}
        soldIndividually={soldIndividually} variation={variation} quantity={quantity} onQuantityChange={(next) => { setQuantity(next); setQuote(null); }} />

      <section className="product-shipping" aria-labelledby="product-shipping-title">
        <div className="product-shipping-heading"><Truck size={19} aria-hidden="true" /><h2 id="product-shipping-title">Calcular frete e prazo</h2></div>
        <form onSubmit={(event) => { void calculateShipping(event); }}>
          <label className="sr-only" htmlFor="product-postcode">CEP de entrega</label>
          <input id="product-postcode" inputMode="numeric" autoComplete="postal-code" placeholder="Digite seu CEP" value={postcode} onChange={(event) => { setPostcode(event.target.value); setQuote(null); }} maxLength={9} />
          <button type="submit" disabled={quoteLoading || selectionUpdating || !selectionReady || !available || !Number.isInteger(quantity) || quantity < 1 || quantity > 99}>{quoteLoading ? "Calculando frete..." : "Calcular"}</button>
        </form>
        {quoteError && <p className="product-shipping-error" role="alert">{quoteError}</p>}
        {quote && <div className="product-shipping-results" role="status">
          <p>Opções para o CEP {quote.postcode}</p>
          {!quote.needed && <p>Este produto não precisa de entrega.</p>}
          {quote.needed && quote.packages.flatMap((item) => item.rates).length === 0 && <p>Nenhuma modalidade disponível para este CEP.</p>}
          {quote.packages.flatMap((item) => item.rates).map((rate) => (
            <div className="product-shipping-rate" key={rate.id}><span>{rate.name}{rate.deliveryTime && <small>{rate.deliveryTime}</small>}</span><strong>{formatCartAmount(rate.price, quote.currency)}</strong></div>
          ))}
          <small>Estimativa para {quantity} {quantity === 1 ? "unidade" : "unidades"}. O WooCommerce recalcula o valor no carrinho.</small>
        </div>}
      </section>
    </div>
  );
}
