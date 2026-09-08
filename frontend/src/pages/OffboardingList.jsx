import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { offboardingService } from '../services/offboardingService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { PlusCircle, Search, Filter, Calendar, Eye, ArrowRight, UserX } from 'lucide-react';

export const OffboardingList = () => {
  const { isHR } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await offboardingService.getOffboardings({
        search,
        status,
        department,
        page,
        limit: 10
      });
      if (res.data) {
        setCases(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load offboarding cases: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, status, department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCases();
  };

  const columns = [
    {
      header: 'Employee',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            {row.employeeId?.firstName} {row.employeeId?.lastName}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {row.employeeId?.employeeCode} • {row.employeeId?.designation}
          </div>
        </div>
      )
    },
    {
      header: 'Department',
      render: (row) => (
        <span style={{ fontWeight: 500 }}>{row.employeeId?.department}</span>
      )
    },
    {
      header: 'Resignation Date',
      render: (row) => new Date(row.resignationDate).toLocaleDateString()
    },
    {
      header: 'Last Working Day',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#4338ca' }}>
          {new Date(row.lastWorkingDay).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <Link to={`/offboarding/${row._id}`} className="btn btn-secondary btn-sm">
          <Eye size={14} /> View Details
        </Link>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            Offboarding Cases
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Track and oversee employee separation workflows from initiation to final release
          </p>
        </div>

        {isHR() && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/offboarding/create')}
          >
            <PlusCircle size={18} /> Initiate Offboarding
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ padding: '16px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search employee name, code, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product Design">Product Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
              <option value="Sales & Partnerships">Sales & Partnerships</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Filter size={16} /> Filter
          </button>
        </form>
      </div>

      {/* Cases Table */}
      <DataTable
        columns={columns}
        data={cases}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No offboarding cases found matching criteria."
      />
    </div>
  );
};
