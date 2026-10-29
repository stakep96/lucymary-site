"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { formatCartAmount } from "@/features/cart/format";
import { useCart } from "@/features/cart/cart-provider";
import type { CartCurrency, CartItem } from "@/features/cart/types";

export function CartItemRow({ item, currency }: { item: CartItem; currency: CartCurrency }) {
  const { busy, perform } = useCart();
  const limits = item.quantityLimits;
  const canDecrease = limits.editable && item.quantity - limits.multiple >= limits.minimum;
  const canIncrease = limits.editable && item.quantity + limits.multiple <= limits.maximum;

  return (
    <div className="cart-item-row">
      <div className="cart-item-image">
        {item.image?.src ? (
          <Image src={item.image.src} alt={item.image.alt} width={96} height={96} unoptimized />
        ) : <span>LucyMary</span>}
      </div>
      <div className="cart-item-details">
        <p className="cart-item-name">{item.name}</p>
        {item.variation.length > 0 && (
          <p className="cart-item-variation">{item.variation.map((option) => `${option.attribute}: ${option.value}`).join(" · ")}</p>
        )}
        <p className="cart-item-unit">{formatCartAmount(item.price, currency)} cada</p>
        <div className="cart-item-bottom">
          <div className="cart-item-quantity" aria-label={`Quantidade de ${item.name}`}>
            {limits.editable && <button type="button" aria-label={`Diminuir quantidade de ${item.name}`} disabled={busy || !canDecrease} onClick={() => { void perform({ action: "update", key: item.key, quantity: item.quantity - limits.multiple }).catch(() => {}); }}>−</button>}
            <span>{item.quantity}</span>
            {limits.editable && <button type="button" aria-label={`Aumentar quantidade de ${item.name}`} disabled={busy || !canIncrease} onClick={() => { void perform({ action: "update", key: item.key, quantity: item.quantity + limits.multiple }).catch(() => {}); }}>+</button>}
          </div>
          <strong>{formatCartAmount(item.lineTotal, currency)}</strong>
        </div>
      </div>
      <button className="cart-item-remove" type="button" aria-label={`Remover ${item.name} da sacola`} disabled={busy} onClick={() => { void perform({ action: "remove", key: item.key }).catch(() => {}); }}><Trash2 size={17} aria-hidden="true" /></button>
    </div>
  );
}
