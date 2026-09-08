import React, { useState, useEffect } from 'react';
import { accessRevocationService } from '../services/accessRevocationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AccessRevocationPanel } from '../components/access/AccessRevocationPanel';
import { ShieldAlert, RefreshCw, UserMinus, CheckCircle2, AlertCircle } from 'lucide-react';

export const AccessRevocationPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffboardingId, setSelectedOffboardingId] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await accessRevocationService.getAll();
      if (res.data) {
        setRecords(res.data);
        if (res.data.length > 0 && !selectedOffboardingId) {
          setSelectedOffboardingId(res.data[0].offboardingId?._id || res.data[0].offboardingId);
        }
      }
    } catch (err) {
      toast.error('Failed to load access records: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const activeRecord = records.find(
    (r) => (r.offboardingId?._id || r.offboardingId) === selectedOffboardingId
  );

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Loading IT access status...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            IT Access & Credential Revocation Hub
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Admin & Systems centralized access de-provisioning panel for departing employees
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchRecords}>
          <RefreshCw size={14} /> Refresh Records
        </button>
      </div>

      {/* Select Case & Quick Stats */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <div>
            <label className="form-label">Select Employee Offboarding Case</label>
            <select
              className="form-select"
              value={selectedOffboardingId}
              onChange={(e) => setSelectedOffboardingId(e.target.value)}
            >
              {records.map((r) => (
                <option key={r._id} value={r.offboardingId?._id || r.offboardingId}>
                  {r.employeeId?.firstName} {r.employeeId?.lastName} ({r.employeeId?.employeeCode}) - {r.allRevoked ? 'All Revoked ✓' : 'Pending Revocation'}
                </option>
              ))}
            </select>
          </div>

          {activeRecord && (
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Department:</span>{' '}
                <strong>{activeRecord.employeeId?.department}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Revocation State:</span>{' '}
                <strong style={{ color: activeRecord.allRevoked ? '#16a34a' : '#ea580c' }}>
                  {activeRecord.allRevoked ? 'COMPLETED (All 6 Revoked)' : 'ACTION REQUIRED'}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Access Revocation Panel */}
      {activeRecord && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                Digital Assets & Single Sign-On Access Items for {activeRecord.employeeId?.firstName} {activeRecord.employeeId?.lastName}
              </h2>
              <p className="card-subtitle">
                Deactivate Google Workspace, Active Directory, VPN, Cloud, and SaaS instances
              </p>
            </div>
            <ShieldAlert size={20} color="var(--primary)" />
          </div>

          <AccessRevocationPanel
            offboardingId={activeRecord.offboardingId?._id || activeRecord.offboardingId}
            accessRecord={activeRecord}
            onRefresh={fetchRecords}
          />
        </div>
      )}
    </div>
  );
};
