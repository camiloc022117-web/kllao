import { useState, useMemo } from 'react';
import './DataTable.css';

const DataTable = ({
  columns,
  data,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No hay datos',
  pageSize = 10,
  onRowClick
}) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = col.accessor ? col.accessor(row) : row[col.key];
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find(c => c.key === sortKey);
      const aVal = col?.accessor ? col.accessor(a) : a[sortKey];
      const bVal = col?.accessor ? col.accessor(b) : b[sortKey];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const totalPages = Math.ceil(sorted.length / pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="data-table-wrapper">
      {searchable && (
        <div className="data-table-search">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="data-table-search__input"
          />
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={col.sortable !== false ? 'sortable' : ''}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ width: col.width }}
                >
                  <span className="th-content">
                    {col.header}
                    {sortKey === col.key && (
                      <span className="sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table-empty">{emptyMessage}</td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row.id || i}
                  className={onRowClick ? 'clickable' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : (col.accessor ? col.accessor(row) : row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="data-table-pagination">
          <span className="data-table-pagination__info">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
          <div className="data-table-pagination__controls">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              ←
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
