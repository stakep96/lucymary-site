"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { BagIcon } from "@/components/header-icons";
import { useCart } from "@/features/cart/cart-provider";

interface AddToCartProps {
  productId: number;
  available: boolean;
  selectionReady: boolean;
  selectionUpdating: boolean;
  selectionBrowsing: boolean;
  soldIndividually: boolean;
  variation: Array<{ attribute: string; value: string }>;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export function AddToCart({ productId, available, selectionReady, selectionUpdating, selectionBrowsing, soldIndividually, variation, quantity, onQuantityChange }: AddToCartProps) {
  const { status, busy, perform, openDrawer } = useCart();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const disabled = !available || !selectionReady || selectionBrowsing || selectionUpdating || status !== "ready" || busy || submitting || !Number.isInteger(quantity) || quantity < 1 || quantity > 99;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || !Number.isInteger(quantity) || quantity < 1) return;
    setMessage("");
    setSubmitting(true);
    try {
      await perform({ action: "add", id: productId, quantity, variation });
      openDrawer();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível adicionar à sacola.");
    } finally {
      setSubmitting(false);
    }
  }

  const buttonLoading = selectionUpdating || status === "loading" || submitting || busy;
  const buttonText = selectionUpdating ? "Consultando opção..." : selectionBrowsing ? "Escolhendo aro..." : !selectionReady ? "Escolha as opções" : !available ? "Indisponível" : status === "loading" ? "Preparando sacola..." : submitting || busy ? "Atualizando sacola..." : "Adicionar à sacola";

  return (
    <form className="add-to-cart" onSubmit={(event) => { void submit(event); }}>
      {!soldIndividually && (
        <label className="add-to-cart-quantity">Quantidade
          <input type="number" min="1" max="99" step="1" value={quantity} onChange={(event) => onQuantityChange(Number(event.target.value))} disabled={busy} />
        </label>
      )}
      <div className="purchase-buttons">
        <button className="add-to-cart-button" type="submit" disabled={disabled}>{buttonLoading ? <LoaderCircle size={19} className="button-spinner" aria-hidden="true" /> : <BagIcon size={19} />}{buttonText}</button>
        <button className="buy-now-button" type="button" disabled aria-describedby="checkout-pending-note">{selectionUpdating && <LoaderCircle size={17} className="button-spinner" aria-hidden="true" />}{selectionUpdating ? "Consultando opção..." : "Comprar agora"}</button>
      </div>
      <p className="checkout-pending-note" id="checkout-pending-note">Compra direta disponível após a validação do checkout com o WooCommerce.</p>
      {status === "error" && <p className="cart-inline-error" role="alert">A sacola está indisponível no momento. Tente recarregar a página.</p>}
      {message && <p className="cart-inline-error" role="alert">{message}</p>}
    </form>
  );
}
