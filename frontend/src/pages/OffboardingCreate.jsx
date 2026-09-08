import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { offboardingService } from '../services/offboardingService';
import { employeeService } from '../services/employeeService';
import { workflowService } from '../services/workflowService';
import { useToast } from '../context/ToastContext';
import { StageTimeline } from '../components/workflow/StageTimeline';
import {
  UserMinus,
  CheckCircle2,
  Calendar,
  Building,
  User,
  AlertCircle,
  ArrowRight,
  GitBranch,
  ShieldAlert
} from 'lucide-react';

export const OffboardingCreate = () => {
  const [searchParams] = useSearchParams();
  const preSelectedEmpId = searchParams.get('employeeId');
  const toast = useToast();
  const navigate = useNavigate();

  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: preSelectedEmpId || '',
    resignationDate: new Date().toISOString().split('T')[0],
    lastWorkingDay: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: 'Better Career Opportunity',
    details: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [empRes, wfRes] = await Promise.all([
          employeeService.getEligibleForOffboarding(),
          workflowService.getTemplates({ processType: 'OFFBOARDING' })
        ]);

        if (empRes.data) {
          setEligibleEmployees(empRes.data);
          if (preSelectedEmpId) {
            const match = empRes.data.find((e) => e._id === preSelectedEmpId);
            if (match) setSelectedEmployee(match);
          }
        }

        if (wfRes.data) {
          const active = wfRes.data.find((t) => t.isActive) || wfRes.data[0];
          setActiveTemplate(active);
        }
      } catch (err) {
        toast.error('Failed to load initial offboarding setup: ' + (err.message || 'Error'));
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [preSelectedEmpId]);

  const handleEmployeeChange = (empId) => {
    setFormData({ ...formData, employeeId: empId });
    const emp = eligibleEmployees.find((e) => e._id === empId);
    setSelectedEmployee(emp || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.warning('Please select an employee to offboard');
      return;
    }

    try {
      setSubmitting(true);
      const res = await offboardingService.createOffboarding(formData);
      toast.success('Offboarding process initiated successfully!');
      if (res.data?._id) {
        navigate(`/offboarding/${res.data._id}`);
      } else {
        navigate('/offboarding');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initiate offboarding');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Loading setup data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
          Initiate Employee Offboarding
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Launch a new digital clearance workflow with automatic multi-stage approval routing
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Step 1: Employee Selection */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">1. Employee Selection & Metadata</h2>
              <p className="card-subtitle">Choose an active employee to begin their separation process</p>
            </div>
            <User size={20} color="var(--primary)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Select Employee *</label>
              <select
                className="form-select"
                value={formData.employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                required
              >
                <option value="">-- Choose Employee --</option>
                {eligibleEmployees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode}) - {emp.designation}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployee && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Employee Code
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {selectedEmployee.employeeCode}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Department
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>
                    {selectedEmployee.department}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Reporting Manager
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>
                    {selectedEmployee.managerName || 'Assigned via Workflow'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Date of Joining
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>
                    {new Date(selectedEmployee.joiningDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Dates and Reason */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">2. Separation Dates & Departure Reason</h2>
              <p className="card-subtitle">Set resignation date, notice period, and exit details</p>
            </div>
            <Calendar size={20} color="var(--primary)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Resignation Submission Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.resignationDate}
                onChange={(e) => setFormData({ ...formData, resignationDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Confirmed Last Working Day (LWD) *</label>
              <input
                type="date"
                className="form-input"
                value={formData.lastWorkingDay}
                onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
              <label className="form-label">Primary Departure Reason *</label>
              <select
                className="form-select"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              >
                <option value="Better Career Opportunity">Better Career Opportunity</option>
                <option value="Higher Education / Studies">Higher Education / Studies</option>
                <option value="Relocation / Family Reasons">Relocation / Family Reasons</option>
                <option value="Health / Personal Reasons">Health / Personal Reasons</option>
                <option value="Contract Completion">Contract Completion</option>
                <option value="Mutual Separation">Mutual Separation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
              <label className="form-label">Additional Handover & Exit Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Enter handover instructions or special separation remarks..."
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Workflow Pipeline Preview */}
        {activeTemplate && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">3. Workflow Pipeline Preview</h2>
                <p className="card-subtitle">
                  Template: <strong>{activeTemplate.name}</strong> ({activeTemplate.stages.length} approval stages)
                </p>
              </div>
              <GitBranch size={20} color="var(--primary)" />
            </div>

            <div style={{ margin: '10px 0' }}>
              <StageTimeline
                stages={activeTemplate.stages.map((s) => ({
                  ...s,
                  status: 'WAITING'
                }))}
              />
            </div>

            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                backgroundColor: '#eff6ff',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}
            >
              <strong>Automatic Stage Activation Rule:</strong> Stages marked as <strong>PARALLEL</strong> (Manager, Admin & Systems, Accounts) will activate simultaneously upon initiation. Dependent sequential stages (Personnel & HR Final) will trigger automatically once prior dependencies complete.
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/offboarding')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting || !formData.employeeId}
          >
            {submitting ? 'Initiating Process...' : 'Launch Offboarding Process'} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
