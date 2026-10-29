import Link from "next/link";

interface CatalogStateProps {
  title: string;
  message: string;
  retry?: boolean;
  retryHref?: string;
}

export function CatalogState({ title, message, retry = false, retryHref = "/" }: CatalogStateProps) {
  return (
    <div className="catalog-state" role={retry ? "alert" : "status"}>
      <span className="state-symbol" aria-hidden="true">✦</span>
      <h3>{title}</h3>
      <p>{message}</p>
      {retry && <Link className="text-link" href={retryHref}>Tentar novamente <span aria-hidden="true">↗</span></Link>}
    </div>
  );
}
