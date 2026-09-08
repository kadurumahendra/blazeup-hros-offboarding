import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { offboardingService } from '../services/offboardingService';
import { approvalService } from '../services/approvalService';
import { documentService } from '../services/documentService';
import { useAuth, ROLES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StageTimeline } from '../components/workflow/StageTimeline';
import { ChecklistView } from '../components/workflow/ChecklistView';
import { AccessRevocationPanel } from '../components/access/AccessRevocationPanel';
import { PDFViewerModal } from '../components/documents/PDFViewerModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  UserMinus,
  CheckCircle2,
  Calendar,
  Building,
  User,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  Send,
  Download,
  Eye,
  History,
  CheckSquare,
  ArrowLeft,
  XCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OffboardingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole, isHR } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(null);

  // Document states
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Reminder states
  const [sendingReminder, setSendingReminder] = useState(false);

  // Cancel Case Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await offboardingService.getOffboardingById(id);
      if (res.data) {
        setData(res.data);
        const wf = res.data.offboarding?.workflowInstanceId;
        if (wf?.stages?.length > 0) {
          // Select first active stage or first stage by default
          const active = wf.stages.find((s) => s.status === 'ACTIVE') || wf.stages[0];
          setSelectedStage(active);
        }
      }
    } catch (err) {
      toast.error('Failed to load case details: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSendReminder = async (stageId) => {
    if (!data?.offboarding?.workflowInstanceId?._id) return;
    try {
      setSendingReminder(true);
      await approvalService.sendReminder(data.offboarding.workflowInstanceId._id, stageId);
      toast.success('Reminder sent to approver successfully');
      fetchDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const handleGenerateDoc = async (type) => {
    try {
      setGeneratingDoc(true);
      const res = await documentService.generateDocument({
        offboardingId: id,
        type
      });
      toast.success(`${type.replace(/_/g, ' ')} generated!`);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
      fetchDetails();
    } catch (err) {
      toast.error(err.message || 'Document generation failed');
    } finally {
      setGeneratingDoc(false);
    }
  };

  const handleCancelCase = async () => {
    try {
      setCancelling(true);
      await offboardingService.cancelOffboarding(id, cancelReason);
      toast.success('Offboarding case cancelled');
      setShowCancelModal(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Loading offboarding case details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data?.offboarding) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Offboarding case not found</h2>
        <Link to="/offboarding" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to list
        </Link>
      </div>
    );
  }

  const { offboarding, accessRevocation, documents = [], auditLogs = [] } = data;
  const employee = offboarding.employeeId;
  const workflowInstance = offboarding.workflowInstanceId;
  const stages = workflowInstance?.stages || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Breadcrumb & Status Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/offboarding')}>
            <ArrowLeft size={16} /> Cases
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                {employee?.firstName} {employee?.lastName}
              </h1>
              <StatusBadge status={offboarding.status} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Case ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{offboarding._id}</span> • Initiated on {new Date(offboarding.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isHR() && offboarding.status === 'IN_PROGRESS' && (
            <button className="btn btn-danger btn-sm" onClick={() => setShowCancelModal(true)}>
              <XCircle size={14} /> Cancel Case
            </button>
          )}
        </div>
      </div>

      {/* Employee Metadata Banner Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Employee Code
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {employee?.employeeCode}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Designation & Dept
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              {employee?.designation} • <span style={{ color: 'var(--text-muted)' }}>{employee?.department}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Reporting Manager
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              {employee?.managerName || 'Assigned via Workflow'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Resignation Date
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              {new Date(offboarding.resignationDate).toLocaleDateString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#4338ca', textTransform: 'uppercase', fontWeight: 700 }}>
              Last Working Day
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#4338ca' }}>
              {new Date(offboarding.lastWorkingDay).toLocaleDateString()}
            </div>
          </div>
        </div>

        {offboarding.reason && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <strong>Reason:</strong> {offboarding.reason} {offboarding.details ? `— ${offboarding.details}` : ''}
          </div>
        )}
      </div>

      {/* Visual Workflow Pipeline Stepper */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div>
            <h2 className="card-title">Clearance Workflow Timeline</h2>
            <p className="card-subtitle">Click on any stage to inspect its checklist and clearance sign-off</p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5' }}>
            {stages.filter((s) => s.status === 'APPROVED').length} of {stages.length} Stages Cleared
          </span>
        </div>

        <StageTimeline
          stages={stages}
          activeStageId={selectedStage?.stageId}
          onSelectStage={(stage) => setSelectedStage(stage)}
        />
      </div>

      {/* Main 2-Column: Stage Inspector & Documents/Access */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {/* Left: Selected Stage Inspector */}
        {selectedStage && (
          <div className="card">
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="card-title">{selectedStage.stageName}</h3>
                  <StatusBadge status={selectedStage.status} />
                </div>
                <p className="card-subtitle">
                  Assigned Role: <strong>{selectedStage.role?.replace('_', ' ')}</strong>
                  {selectedStage.executionType && ` • ${selectedStage.executionType}`}
                </p>
              </div>

              {/* Action for approver or reminder button for HR */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedStage.status === 'ACTIVE' && (hasRole(selectedStage.role) || hasRole(ROLES.SUPER_ADMIN)) && (
                  <Link
                    to={`/tasks/${workflowInstance._id}_${selectedStage.stageId}`}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckSquare size={14} /> Review & Approve
                  </Link>
                )}

                {selectedStage.status === 'ACTIVE' && isHR() && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSendReminder(selectedStage.stageId)}
                    disabled={sendingReminder}
                  >
                    <Send size={13} /> {sendingReminder ? 'Sending...' : 'Send Reminder'}
                  </button>
                )}
              </div>
            </div>

            {/* Checklist Section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                Department Checklist Items:
              </div>
              <ChecklistView checklist={selectedStage.checklist} readOnly={true} />
            </div>

            {/* Remarks / Approval details */}
            {selectedStage.status === 'APPROVED' && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  color: '#166534'
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  ✓ Approved by {selectedStage.approvedByName} on{' '}
                  {new Date(selectedStage.approvedAt).toLocaleString()}
                </div>
                {selectedStage.remarks && (
                  <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                    "{selectedStage.remarks}"
                  </div>
                )}
              </div>
            )}

            {selectedStage.status === 'REJECTED' && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  color: '#991b1b'
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  ✕ Rejected by {selectedStage.rejectedByName} on{' '}
                  {new Date(selectedStage.rejectedAt).toLocaleString()}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <strong>Reason:</strong> {selectedStage.rejectionReason}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right: Documents & Statutory Letters */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Offboarding Documents & Letters</h3>
              <p className="card-subtitle">Automated generation based on clearance progress</p>
            </div>
            <FileText size={20} color="var(--primary)" />
          </div>

          {/* Quick Action Generation Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
              disabled={generatingDoc || !isHR()}
              onClick={() => handleGenerateDoc('RESIGNATION_ACCEPTANCE')}
            >
              <Sparkles size={14} color="#6366f1" /> Acceptance Letter
            </button>

            <button
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
              disabled={generatingDoc || !isHR()}
              onClick={() => handleGenerateDoc('NOC')}
            >
              <ShieldCheck size={14} color="#10b981" /> Clearance NOC
            </button>

            <button
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
              disabled={generatingDoc || !isHR() || offboarding.status !== 'COMPLETED'}
              title={offboarding.status !== 'COMPLETED' ? 'Requires all clearance stages approved' : ''}
              onClick={() => handleGenerateDoc('RELIEVING_LETTER')}
            >
              <FileText size={14} color="#0ea5e9" /> Relieving Letter
            </button>

            <button
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
              disabled={generatingDoc || !isHR() || offboarding.status !== 'COMPLETED'}
              title={offboarding.status !== 'COMPLETED' ? 'Requires all clearance stages approved' : ''}
              onClick={() => handleGenerateDoc('EXPERIENCE_LETTER')}
            >
              <FileText size={14} color="#f59e0b" /> Experience Letter
            </button>
          </div>

          {/* Generated Documents List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Generated Document Files ({documents.length})
            </div>

            {documents.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', background: '#f8fafc', borderRadius: '8px' }}>
                No documents generated yet. Use the buttons above to create official PDFs.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: '#ffffff'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Generated by {doc.generatedByName || 'HR'} • {new Date(doc.generatedAt).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye size={13} /> View
                    </button>
                    <a
                      href={documentService.getDownloadUrl(doc._id)}
                      download={doc.fileName}
                      className="btn btn-primary btn-sm"
                    >
                      <Download size={13} /> PDF
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* IT Access Revocation Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">IT Systems & Infrastructure Access Control</h2>
            <p className="card-subtitle">Admin & Systems access revocation audit state</p>
          </div>
        </div>

        <AccessRevocationPanel
          offboardingId={id}
          accessRecord={accessRevocation}
          onRefresh={fetchDetails}
          readOnly={!hasRole(ROLES.ADMIN_SYSTEMS, ROLES.SUPER_ADMIN, ROLES.HR_ADMIN)}
        />
      </div>

      {/* Audit Log Trail */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Case Compliance & Audit Log Trail</h2>
            <p className="card-subtitle">Immutable event history for this offboarding lifecycle</p>
          </div>
          <History size={20} color="var(--text-muted)" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {auditLogs.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No audit records logged yet.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '6px',
                  fontSize: '12.5px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    <span style={{ color: '#4338ca', fontWeight: 700 }}>{log.action}</span>
                    {log.stage ? ` • Stage: ${log.stage}` : ''}
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                    {log.remarks}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#334155' }}>{log.userName} ({log.role})</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelCase}
        title="Cancel Offboarding Process"
        message="Are you sure you want to cancel this offboarding workflow? This will halt all active clearance stages and restore employee status to Active."
        confirmText="Confirm Cancellation"
        isDanger={true}
        loading={cancelling}
      />
    </div>
  );
};
