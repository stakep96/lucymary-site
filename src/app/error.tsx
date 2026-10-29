"use client";

import { useEffect } from "react";
import { CatalogState } from "@/components/catalog-state";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Erro ao renderizar a vitrine:", error);
  }, [error]);

  return (
    <div className="shell error-page">
      <CatalogState title="Algo deu errado" message="Não foi possível abrir a vitrine agora." />
      <button className="retry-button" onClick={reset}>Tentar novamente</button>
    </div>
  );
}
