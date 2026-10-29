"use client";

import { useState, type FormEvent } from "react";
import { BagIcon } from "@/components/header-icons";
import { useCart } from "@/features/cart/cart-provider";

export function AddToCart({ productId, available, requiresVariation, soldIndividually, variationAttributes }: {
  productId: number;
  available: boolean;
  requiresVariation: boolean;
  soldIndividually: boolean;
  variationAttributes: Array<{ name: string; fixedValue: string | null; options: string[] }>;
}) {
  const { status, busy, perform, openDrawer } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [choices, setChoices] = useState<Record<string, string>>(() => Object.fromEntries(
    variationAttributes.map((attribute) => [attribute.name, attribute.fixedValue || (attribute.options.length === 1 ? attribute.options[0] : "")]),
  ));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || requiresVariation || variationAttributes.some((attribute) => !choices[attribute.name]) || !Number.isInteger(quantity) || quantity < 1) return;
    setMessage("");
    try {
      await perform({
        action: "add", id: productId, quantity,
        variation: variationAttributes.map((attribute) => ({ attribute: attribute.name, value: choices[attribute.name] })),
      });
      openDrawer();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível adicionar à sacola.");
    }
  }

  const missingChoice = variationAttributes.some((attribute) => !choices[attribute.name]);
  const disabled = !available || requiresVariation || missingChoice || status !== "ready" || busy;
  const buttonText = requiresVariation ? "Escolha uma opção" : missingChoice ? "Escolha os detalhes" : !available ? "Indisponível" : status === "loading" ? "Preparando sacola..." : "Adicionar à sacola";

  return (
    <form className="add-to-cart" onSubmit={(event) => { void submit(event); }}>
      {!requiresVariation && variationAttributes.filter((attribute) => !attribute.fixedValue && attribute.options.length > 1).map((attribute) => (
        <label className="add-to-cart-option" key={attribute.name}>{attribute.name}
          <select value={choices[attribute.name] || ""} onChange={(event) => setChoices((current) => ({ ...current, [attribute.name]: event.target.value }))} disabled={busy} required>
            <option value="">Selecione</option>
            {attribute.options.map((option) => <option value={option} key={option}>{option}</option>)}
          </select>
        </label>
      ))}
      {!soldIndividually && (
        <label className="add-to-cart-quantity">Quantidade
          <input type="number" min="1" max="99" step="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} disabled={disabled} />
        </label>
      )}
      <button className="add-to-cart-button" type="submit" disabled={disabled}><BagIcon size={19} />{buttonText}</button>
      {status === "error" && <p className="cart-inline-error" role="alert">A sacola está indisponível no momento. Tente recarregar a página.</p>}
      {message && <p className="cart-inline-error" role="alert">{message}</p>}
    </form>
  );
}
