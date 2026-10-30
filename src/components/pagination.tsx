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
    else params.delete("pagina");
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  }

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);

  return (
    <nav className="pagination" aria-label="Paginação dos produtos">
      {page > 1 && <Link href={href(page - 1)} aria-label="Página anterior">‹</Link>}
      {pages.map((number) => <Link key={number} href={href(number)} aria-current={number === page ? "page" : undefined}>{number}</Link>)}
      {page < totalPages && <Link href={href(page + 1)} aria-label="Próxima página">›</Link>}
    </nav>
  );
}
