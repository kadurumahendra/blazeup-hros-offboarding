import React from 'react';

export const StatCard = ({ title, value, icon: Icon, trend, color = 'var(--primary)', bg = 'var(--primary-light)' }) => {
  return (
    <div className="stat-card">
      <div>
        <span className="stat-label">{title}</span>
        <div className="stat-value">{value}</div>
        {trend && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {trend}
          </div>
        )}
      </div>
      {Icon && (
        <div className="stat-icon-wrapper" style={{ backgroundColor: bg, color }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};
