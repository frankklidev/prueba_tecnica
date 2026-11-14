interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount < 2) return null;

  return (
    <nav className="pagination" aria-label="Paginación de publicaciones">
      <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span role="status">Página {page} de {pageCount}</span>
      <button type="button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>
        Siguiente
      </button>
    </nav>
  );
}
