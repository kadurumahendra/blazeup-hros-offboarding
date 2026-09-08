import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Users, Plus, Search, Filter, UserMinus, Mail, Phone, Calendar } from 'lucide-react';

export const Employees = () => {
  const { isHR } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Create Employee Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    location: 'Bangalore HQ'
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeService.getEmployees({
        search,
        department,
        page,
        limit: 10
      });
      if (res.data) {
        setEmployees(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load employees: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await employeeService.createEmployee(formData);
      toast.success('Employee created successfully');
      setShowModal(false);
      setFormData({
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'Engineering',
        designation: '',
        joiningDate: new Date().toISOString().split('T')[0],
        location: 'Bangalore HQ'
      });
      fetchEmployees();
    } catch (err) {
      toast.error(err.message || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Employee',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            {row.firstName} {row.lastName}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Code: <span style={{ fontFamily: 'var(--font-mono)' }}>{row.employeeCode}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Department & Role',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.designation}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.department}</div>
        </div>
      )
    },
    {
      header: 'Contact',
      render: (row) => (
        <div style={{ fontSize: '12.5px' }}>
          <div>{row.email}</div>
          <div style={{ color: 'var(--text-muted)' }}>{row.phone || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Joining Date',
      render: (row) => new Date(row.joiningDate).toLocaleDateString()
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {isHR() && row.status === 'ACTIVE' && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ border: '1px solid #c7d2fe', color: '#4338ca', backgroundColor: '#eef2ff' }}
              onClick={() => navigate(`/offboarding/create?employeeId=${row._id}`)}
            >
              <UserMinus size={14} /> Offboard
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            Employee Directory
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Manage staff profiles, departmental allocations, and initiation records
          </p>
        </div>

        {isHR() && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Employee
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by name, code, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
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
              <option value="Human Resources">Human Resources</option>
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
        data={employees}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No employees found matching the filters."
      />

      {/* Create Employee Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Employee" maxWidth="620px">
        <form onSubmit={handleCreateEmployee}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Employee Code *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BLZ-108"
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Joining Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Work Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="john.doe@blazeup.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="Engineering">Engineering</option>
                <option value="Product Design">Product Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Sales & Partnerships">Sales & Partnerships</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Designation *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Software Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? 'Creating...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
