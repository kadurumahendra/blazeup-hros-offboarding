import React, { useState } from 'react';
import { accessRevocationService } from '../../services/accessRevocationService';
import { useToast } from '../../context/ToastContext';
import { ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Globe, Terminal, Mail, Server, Database } from 'lucide-react';

export const AccessRevocationPanel = ({
  offboardingId,
  accessRecord,
  onRefresh,
  readOnly = false
}) => {
  const toast = useToast();
  const [revokingKey, setRevokingKey] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  if (!accessRecord) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No access records initialized yet.
      </div>
    );
  }

  const getSystemIcon = (key) => {
    switch (key) {
      case 'EMAIL':
        return <Mail size={18} color="#4f46e5" />;
      case 'SYSTEM_AD':
        return <Server size={18} color="#0ea5e9" />;
      case 'VPN':
        return <Globe size={18} color="#10b981" />;
      case 'CLOUD_DEV':
        return <Terminal size={18} color="#f59e0b" />;
      case 'SLACK':
        return <KeyRound size={18} color="#8b5cf6" />;
      default:
        return <Database size={18} color="#64748b" />;
    }
  };

  const handleRevokeSingle = async (accessKey) => {
    try {
      setRevokingKey(accessKey);
      await accessRevocationService.revokeSingle(offboardingId, {
        accessKey,
        auditNote: `Manually triggered simulated revocation for ${accessKey}`
      });
      toast.success(`Access for ${accessKey} revoked successfully (Simulated)`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Revocation failed: ' + (err.message || 'Error'));
    } finally {
      setRevokingKey(null);
    }
  };

  const handleRevokeAll = async () => {
    try {
      setBulkLoading(true);
      await accessRevocationService.revokeAll(offboardingId, {
        auditNote: 'Bulk access revocation triggered by IT Admin'
      });
      toast.success('All system credentials revoked successfully (Simulated)');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Bulk revocation failed: ' + (err.message || 'Error'));
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Simulation Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '12.5px',
          color: '#1e40af'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} />
          <span>
            <strong>Simulated Integration Mode:</strong> Credential revoking is executed via working service abstractions ready for Okta/Google/AzureAD API bindings.
          </span>
        </div>

        {!readOnly && !accessRecord.allRevoked && (
          <button
            className="btn btn-danger btn-sm"
            onClick={handleRevokeAll}
            disabled={bulkLoading}
          >
            {bulkLoading ? 'Revoking All...' : 'Revoke All Accesses'}
          </button>
        )}
      </div>

      {/* Systems Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {accessRecord.items.map((item) => {
          const isRevoked = item.status === 'REVOKED';
          const isProcessing = revokingKey === item.accessKey;

          return (
            <div
              key={item.accessKey}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: isRevoked ? '#f8fafc' : '#ffffff',
                border: `1px solid ${isRevoked ? '#cbd5e1' : 'var(--border-color)'}`,
                borderRadius: '10px',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: isRevoked ? '#e2e8f0' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getSystemIcon(item.accessKey)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: isRevoked ? 'var(--text-muted)' : 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.systemName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.category} • <span style={{ color: isRevoked ? '#16a34a' : '#ea580c', fontWeight: 600 }}>{item.status}</span>
                  </div>
                </div>
              </div>

              {!readOnly && (
                <div>
                  {isRevoked ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#16a34a'
                      }}
                    >
                      <CheckCircle2 size={16} /> Revoked
                    </span>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ border: '1px solid #fca5a5', color: '#dc2626', backgroundColor: '#fef2f2' }}
                      disabled={isProcessing}
                      onClick={() => handleRevokeSingle(item.accessKey)}
                    >
                      {isProcessing ? 'Revoking...' : 'Revoke'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
