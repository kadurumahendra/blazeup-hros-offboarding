import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

export const ChecklistView = ({
  checklist = [],
  onChange = null,
  readOnly = false
}) => {
  if (!checklist || checklist.length === 0) {
    return (
      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
        No specific checklist items configured for this clearance stage.
      </div>
    );
  }

  const handleToggle = (itemId, currentCompleted) => {
    if (readOnly || !onChange) return;
    const updated = checklist.map((item) =>
      item.itemId === itemId ? { ...item, isCompleted: !currentCompleted } : item
    );
    onChange(updated);
  };

  const handleNotesChange = (itemId, notes) => {
    if (readOnly || !onChange) return;
    const updated = checklist.map((item) =>
      item.itemId === itemId ? { ...item, notes } : item
    );
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {checklist.map((item) => {
        const isChecked = Boolean(item.isCompleted);

        return (
          <div
            key={item.itemId}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 14px',
              background: isChecked ? '#f0fdf4' : '#ffffff',
              border: `1px solid ${isChecked ? '#bbf7d0' : 'var(--border-color)'}`,
              borderRadius: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <button
              type="button"
              disabled={readOnly}
              onClick={() => handleToggle(item.itemId, isChecked)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: readOnly ? 'default' : 'pointer',
                padding: 0,
                color: isChecked ? '#16a34a' : '#94a3b8',
                display: 'flex',
                marginTop: '2px'
              }}
            >
              {isChecked ? (
                <CheckCircle size={20} color="#16a34a" fill="#dcfce7" />
              ) : (
                <Circle size={20} />
              )}
            </button>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: isChecked ? '#166534' : 'var(--text-main)',
                    textDecoration: isChecked ? 'none' : 'none'
                  }}
                >
                  {item.label}
                </span>
                {item.isRequired && (
                  <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700 }} title="Required item">
                    *
                  </span>
                )}
                {item.category && (
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginLeft: 'auto'
                    }}
                  >
                    {item.category}
                  </span>
                )}
              </div>

              {!readOnly && (
                <input
                  type="text"
                  placeholder="Add clearance verification notes (optional)..."
                  value={item.notes || ''}
                  onChange={(e) => handleNotesChange(item.itemId, e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    background: '#ffffff'
                  }}
                />
              )}

              {item.completedAt && (
                <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>
                  ✓ Verified on {new Date(item.completedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
