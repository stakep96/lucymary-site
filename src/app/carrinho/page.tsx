import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";

export const metadata: Metadata = {
  title: "Minha sacola | LucyMary",
  description: "Confira os itens, cupons e frete da sua sacola LucyMary.",
};

export default function Page() {
  return <CartPage />;
}
