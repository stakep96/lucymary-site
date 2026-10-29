import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string>;
}

export function Pagination({ page, totalPages, basePath, query = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  function href(target: number) {
    const params = new URLSearchParams(query);
    if (target > 1) params.set("pagina", String(target));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  }

  return (
    <nav className="pagination" aria-label="Paginação dos produtos">
      {page > 1 ? <Link href={href(page - 1)}>← Anterior</Link> : <span />}
      <span>Página {page} de {totalPages}</span>
      {page < totalPages ? <Link href={href(page + 1)}>Próxima →</Link> : <span />}
    </nav>
  );
}
