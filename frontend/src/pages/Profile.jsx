import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Building, Briefcase } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
          User Profile & Role Privileges
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Authenticated session details and RBAC security assignments
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 800
            }}
          >
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
              {user.name}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {user.email}
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              Role: {user.role?.replace('_', ' ')}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Department
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>
              {user.department || 'Operations'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Designation
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>
              {user.designation || 'Staff Member'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Account Status
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>
              Active & Verified
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              System ID
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {user._id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
