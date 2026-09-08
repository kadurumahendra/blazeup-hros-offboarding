import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { approvalService } from '../services/approvalService';
import { useAuth, ROLES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ChecklistView } from '../components/workflow/ChecklistView';
import { AccessRevocationPanel } from '../components/access/AccessRevocationPanel';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  User,
  Calendar,
  Building,
  ShieldCheck,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const toast = useToast();

  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState([]);
  const [remarks, setRemarks] = useState('');

  const [approving, setApproving] = useState(false);

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await approvalService.getTaskById(id);
      if (res.data) {
        setTaskData(res.data);
        setChecklist(res.data.stage?.checklist || []);
        setRemarks(res.data.stage?.remarks || '');
      }
    } catch (err) {
      toast.error('Failed to load task details: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleApprove = async () => {
    // Validate required checklist items
    const missingRequired = checklist.filter((item) => item.isRequired && !item.isCompleted);
    if (missingRequired.length > 0) {
      toast.warning(
        `Please complete all mandatory checklist items before approving: [${missingRequired.map((i) => i.label).join(', ')}]`
      );
      return;
    }

    try {
      setApproving(true);
      await approvalService.approveTask(id, {
        stageId: taskData.stage.stageId,
        remarks,
        checklistUpdates: checklist
      });

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      toast.success('Clearance approved successfully!');
      navigate('/tasks');
    } catch (err) {
      toast.error(err.message || 'Failed to approve clearance');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.warning('Please enter a reason for rejecting this clearance');
      return;
    }

    try {
      setRejecting(true);
      await approvalService.rejectTask(id, {
        stageId: taskData.stage.stageId,
        rejectionReason,
        remarks: rejectionReason
      });

      toast.error('Clearance rejected. Workflow has been halted.');
      setShowRejectModal(false);
      navigate('/tasks');
    } catch (err) {
      toast.error(err.message || 'Failed to reject clearance');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Loading task review...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!taskData?.stage) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Task not found or not active</h2>
        <Link to="/tasks" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to tasks
        </Link>
      </div>
    );
  }

  const { employee, offboarding, stage, accessRevocation } = taskData;
  const isCompleted = stage.status === 'APPROVED';
  const isRejected = stage.status === 'REJECTED';
  const canAct = stage.status === 'ACTIVE' && (user.role === stage.role || user.role === ROLES.SUPER_ADMIN);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tasks')}>
            <ArrowLeft size={16} /> Tasks
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                {stage.stageName}
              </h1>
              <StatusBadge status={stage.status} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Assigned Role: <strong>{stage.role?.replace('_', ' ')}</strong>
            </div>
          </div>
        </div>

        {offboarding?._id && (
          <Link to={`/offboarding/${offboarding._id}`} className="btn btn-secondary btn-sm">
            View 360° Case
          </Link>
        )}
      </div>

      {/* Employee Details Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Employee
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)' }}>
              {employee?.firstName} {employee?.lastName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {employee?.employeeCode}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Department & Role
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              {employee?.designation}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {employee?.department}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Resignation Date
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              {offboarding?.resignationDate ? new Date(offboarding.resignationDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#4338ca', textTransform: 'uppercase', fontWeight: 700 }}>
              Last Working Day
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#4338ca' }}>
              {offboarding?.lastWorkingDay ? new Date(offboarding.lastWorkingDay).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* IT Access Revocation (if Admin Systems role) */}
      {stage.role === ROLES.ADMIN_SYSTEMS && accessRevocation && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">System & Infrastructure Access Revocation</h2>
              <p className="card-subtitle">Revoke employee digital credentials before final clearance sign-off</p>
            </div>
            <ShieldCheck size={20} color="var(--primary)" />
          </div>

          <AccessRevocationPanel
            offboardingId={offboarding?._id}
            accessRecord={accessRevocation}
            onRefresh={fetchTask}
            readOnly={!canAct}
          />
        </div>
      )}

      {/* Clearance Checklist Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Clearance Verification Checklist</h2>
            <p className="card-subtitle">
              Verify and confirm all mandatory items marked with an asterisk (*)
            </p>
          </div>
          <CheckSquare size={20} color="var(--primary)" />
        </div>

        <ChecklistView
          checklist={checklist}
          onChange={(updated) => setChecklist(updated)}
          readOnly={!canAct}
        />

        {/* Remarks Input */}
        <div className="form-group" style={{ marginTop: '24px', marginBottom: 0 }}>
          <label className="form-label">Approver Remarks / Clearance Sign-off Notes</label>
          <textarea
            className="form-textarea"
            placeholder="Add any specific comments, handover notes, or condition waivers..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={!canAct}
          />
        </div>
      </div>

      {/* Actions / Sign-off Block */}
      {canAct && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowRejectModal(true)}
            disabled={approving || rejecting}
          >
            <XCircle size={16} /> Reject Clearance
          </button>

          <button
            type="button"
            className="btn btn-success btn-lg"
            onClick={handleApprove}
            disabled={approving || rejecting}
          >
            <CheckCircle2 size={18} /> {approving ? 'Signing off...' : 'Sign & Approve Clearance'}
          </button>
        </div>
      )}

      {/* Already Approved or Rejected Banner */}
      {isCompleted && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-lg)',
            color: '#166534',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          ✓ This clearance stage was approved by {stage.approvedByName} on{' '}
          {new Date(stage.approvedAt).toLocaleString()}.
        </div>
      )}

      {isRejected && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            color: '#991b1b',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          ✕ This clearance was rejected by {stage.rejectedByName}. Reason: {stage.rejectionReason}
        </div>
      )}

      {/* Reject Reason Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Clearance Task"
        maxWidth="500px"
      >
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', marginBottom: '12px' }}>
            <AlertTriangle size={20} />
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
              Rejecting this clearance will halt the offboarding workflow and alert HR.
            </span>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Mandatory Rejection Reason *</label>
            <textarea
              className="form-textarea"
              placeholder="Explain why clearance cannot be granted (e.g. unreturned assets, outstanding dues)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowRejectModal(false)}
            disabled={rejecting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleReject}
            disabled={rejecting || !rejectionReason}
          >
            {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
