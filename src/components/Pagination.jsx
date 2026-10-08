import './Pagination.css';

/**
 * Reusable pagination control.
 * Props:
 *  - page: current page (1-indexed)
 *  - totalPages: total number of pages
 *  - onPageChange: (nextPage) => void
 *  - idPrefix: unique prefix for element ids
 */
const Pagination = ({ page, totalPages, onPageChange, idPrefix = 'pg' }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const windowSize = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - windowSize && i <= page + windowSize)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav className="pg-wrap" id={`${idPrefix}-pagination`} aria-label="Pagination">
      <button
        className="pg-btn"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        id={`${idPrefix}-prev`}
      >
        ← Prev
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="pg-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`pg-btn ${page === p ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            id={`${idPrefix}-page-${p}`}
          >
            {p}
          </button>
        )
      )}

      <button
        className="pg-btn"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        id={`${idPrefix}-next`}
      >
        Next →
      </button>
    </nav>
  );
};

export default Pagination;
