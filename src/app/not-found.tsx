import Link from "next/link";
import { CatalogState } from "@/components/catalog-state";

export default function NotFound() {
  return (
    <div className="shell error-page">
      <CatalogState title="Página não encontrada" message="Este produto ou categoria não está disponível no catálogo publicado." />
      <Link className="retry-button" href="/produtos">Ver produtos</Link>
    </div>
  );
}
