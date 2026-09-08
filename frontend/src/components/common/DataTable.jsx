import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  pagination,
  onPageChange,
  emptyMessage = 'No records found'
}) => {
  if (loading) {
    return (
      <div className="table-container" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Loading records...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Inbox size={36} strokeWidth={1.5} color="#94a3b8" />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row._id || row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total items)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
