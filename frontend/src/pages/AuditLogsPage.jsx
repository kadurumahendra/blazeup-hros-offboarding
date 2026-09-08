import React, { useState, useEffect } from 'react';
import { auditService } from '../services/auditService';
import { useToast } from '../context/ToastContext';
import { DataTable } from '../components/common/DataTable';
import { History, Search, Filter, Shield, Calendar, UserCheck } from 'lucide-react';

export const AuditLogsPage = () => {
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditService.getAuditLogs({
        search,
        action,
        role,
        page,
        limit: 15
      });
      if (res.data) {
        setLogs(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load audit trail: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, action, role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const columns = [
    {
      header: 'Timestamp',
      width: '180px',
      render: (row) => (
        <div style={{ fontSize: '12.5px' }}>
          <div style={{ fontWeight: 600 }}>{new Date(row.timestamp).toLocaleDateString()}</div>
          <div style={{ color: 'var(--text-muted)' }}>{new Date(row.timestamp).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      header: 'Actor & Role',
      width: '180px',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{row.userName}</div>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              backgroundColor: '#eef2ff',
              color: '#4338ca',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            {row.role}
          </span>
        </div>
      )
    },
    {
      header: 'Action',
      width: '200px',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>
            {row.action}
          </div>
          {row.stage && (
            <div style={{ fontSize: '11.5px', color: '#6366f1' }}>
              Stage: {row.stage}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Target Employee',
      width: '160px',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>{row.employeeName || 'System'}</span>
      )
    },
    {
      header: 'Audit Remarks / Details',
      render: (row) => (
        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          {row.remarks}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
          Enterprise Compliance Audit Trail
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Immutable event log of all workflow actions, approvals, rejections, access revocations, and document issuances
        </p>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ padding: '16px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search user, employee, remarks, stage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Actions</option>
              <option value="OFFBOARDING_CREATED">Offboarding Created</option>
              <option value="STAGE_ACTIVATED">Stage Activated</option>
              <option value="STAGE_APPROVED">Stage Approved</option>
              <option value="STAGE_REJECTED">Stage Rejected</option>
              <option value="REMINDER_SENT">Reminder Sent</option>
              <option value="DOCUMENT_GENERATED">Document Generated</option>
              <option value="ACCESS_REVOKED">Access Revoked</option>
              <option value="WORKFLOW_COMPLETED">Workflow Completed</option>
            </select>
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Roles</option>
              <option value="HR_ADMIN">HR Admin</option>
              <option value="HR">HR</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN_SYSTEMS">Admin & Systems</option>
              <option value="ACCOUNTS">Accounts</option>
              <option value="PERSONNEL">Personnel</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Filter size={16} /> Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No audit records match the current filter query."
      />
    </div>
  );
};
