import React, { useState, useEffect } from 'react';
import { documentService } from '../services/documentService';
import { offboardingService } from '../services/offboardingService';
import { useAuth, ROLES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PDFViewerModal } from '../components/documents/PDFViewerModal';
import { Modal } from '../components/common/Modal';
import {
  FileText,
  Download,
  Eye,
  Settings,
  Sparkles,
  ShieldCheck,
  Building,
  CheckCircle2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DocumentsPage = () => {
  const { isHR } = useAuth();
  const toast = useToast();

  const [offboardings, setOffboardings] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [caseDocs, setCaseDocs] = useState([]);
  const [clauses, setClauses] = useState(null);
  const [loading, setLoading] = useState(true);

  const [previewDoc, setPreviewDoc] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Clause Settings Modal
  const [showClauseModal, setShowClauseModal] = useState(false);
  const [clauseForm, setClauseForm] = useState({
    companyName: '',
    companyAddress: '',
    signatoryName: '',
    signatoryTitle: '',
    nonCompeteClause: '',
    nonSolicitationClause: '',
    confidentialityClause: ''
  });
  const [savingClauses, setSavingClauses] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesRes, clausesRes] = await Promise.all([
        offboardingService.getOffboardings({ limit: 50 }),
        documentService.getClauses()
      ]);

      if (casesRes.data) {
        setOffboardings(casesRes.data);
        if (casesRes.data.length > 0 && !selectedCaseId) {
          setSelectedCaseId(casesRes.data[0]._id);
        }
      }

      if (clausesRes.data) {
        setClauses(clausesRes.data);
        setClauseForm(clausesRes.data);
      }
    } catch (err) {
      toast.error('Failed to load document records: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseDocs = async (caseId) => {
    if (!caseId) return;
    try {
      const res = await documentService.getDocumentsByOffboarding(caseId);
      if (res.data) {
        setCaseDocs(res.data);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseDocs(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleGenerate = async (type) => {
    if (!selectedCaseId) {
      toast.warning('Please select an offboarding case');
      return;
    }

    try {
      setGenerating(true);
      const res = await documentService.generateDocument({
        offboardingId: selectedCaseId,
        type
      });
      toast.success('Document generated successfully!');
      confetti({ particleCount: 60, spread: 60 });
      fetchCaseDocs(selectedCaseId);
    } catch (err) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveClauses = async (e) => {
    e.preventDefault();
    try {
      setSavingClauses(true);
      const res = await documentService.updateClauses(clauseForm);
      toast.success('Legal document clauses updated!');
      setClauses(res.data);
      setShowClauseModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update clauses');
    } finally {
      setSavingClauses(false);
    }
  };

  const currentCase = offboardings.find((c) => c._id === selectedCaseId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            Document & Letter Center
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Generate, preview, and download formal separation letters, clearance certificates, and experience documents
          </p>
        </div>

        {isHR() && (
          <button className="btn btn-secondary" onClick={() => setShowClauseModal(true)}>
            <Settings size={16} /> Legal Clauses Settings
          </button>
        )}
      </div>

      {/* Case Selector Card */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <div>
            <label className="form-label">Select Offboarding Case</label>
            <select
              className="form-select"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
            >
              {offboardings.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.employeeId?.firstName} {c.employeeId?.lastName} ({c.employeeId?.employeeCode}) - {c.status}
                </option>
              ))}
            </select>
          </div>

          {currentCase && (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <div>Department: <strong>{currentCase.employeeId?.department}</strong></div>
              <div>Last Working Day: <strong>{new Date(currentCase.lastWorkingDay).toLocaleDateString()}</strong></div>
              <div>Workflow Status: <strong style={{ color: '#4338ca' }}>{currentCase.status}</strong></div>
            </div>
          )}
        </div>
      </div>

      {/* Generator Buttons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="#6366f1" />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Resignation Acceptance</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Formal letter acknowledging resignation tender and confirming last working date.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: '16px' }}
            disabled={generating || !isHR()}
            onClick={() => handleGenerate('RESIGNATION_ACCEPTANCE')}
          >
            Generate PDF
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={18} color="#10b981" />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Clearance NOC</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              No Objection Certificate certifying complete clearance from all 5 departments.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: '16px' }}
            disabled={generating || !isHR()}
            onClick={() => handleGenerate('NOC')}
          >
            Generate PDF
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FileText size={18} color="#0ea5e9" />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Relieving Letter</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Official release letter with post-employment non-compete and non-solicitation clauses.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: '16px' }}
            disabled={generating || !isHR() || currentCase?.status !== 'COMPLETED'}
            title={currentCase?.status !== 'COMPLETED' ? 'Available once workflow is fully completed' : ''}
            onClick={() => handleGenerate('RELIEVING_LETTER')}
          >
            Generate PDF
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FileText size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Experience Certificate</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Work tenure and performance certification for outgoing employee's portfolio.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: '16px' }}
            disabled={generating || !isHR() || currentCase?.status !== 'COMPLETED'}
            title={currentCase?.status !== 'COMPLETED' ? 'Available once workflow is fully completed' : ''}
            onClick={() => handleGenerate('EXPERIENCE_LETTER')}
          >
            Generate PDF
          </button>
        </div>
      </div>

      {/* Generated Documents List */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Generated Documents Repository ({caseDocs.length})</h2>
            <p className="card-subtitle">Official downloadable PDF documents for selected employee</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {caseDocs.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No documents generated for this employee yet. Click the generator cards above.
            </div>
          ) : (
            caseDocs.map((doc) => (
              <div
                key={doc._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: '#eef2ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4f46e5'
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      File: {doc.fileName} • Generated on {new Date(doc.generatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setPreviewDoc(doc)}>
                    <Eye size={14} /> Preview
                  </button>
                  <a
                    href={documentService.getDownloadUrl(doc._id)}
                    download={doc.fileName}
                    className="btn btn-primary btn-sm"
                  >
                    <Download size={14} /> Download PDF
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PDFViewerModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />

      {/* Clause Settings Modal */}
      <Modal
        isOpen={showClauseModal}
        onClose={() => setShowClauseModal(false)}
        title="Configurable Legal Clauses & Letterhead"
        maxWidth="680px"
      >
        <form onSubmit={handleSaveClauses}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={clauseForm.companyName}
                  onChange={(e) => setClauseForm({ ...clauseForm, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Authorized Signatory Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={clauseForm.signatoryName}
                  onChange={(e) => setClauseForm({ ...clauseForm, signatoryName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Company Address / Registered Office</label>
              <input
                type="text"
                className="form-input"
                value={clauseForm.companyAddress}
                onChange={(e) => setClauseForm({ ...clauseForm, companyAddress: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Non-Compete Clause</label>
              <textarea
                className="form-textarea"
                value={clauseForm.nonCompeteClause}
                onChange={(e) => setClauseForm({ ...clauseForm, nonCompeteClause: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Non-Solicitation Clause</label>
              <textarea
                className="form-textarea"
                value={clauseForm.nonSolicitationClause}
                onChange={(e) => setClauseForm({ ...clauseForm, nonSolicitationClause: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowClauseModal(false)}
              disabled={savingClauses}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingClauses}>
              {savingClauses ? 'Saving...' : 'Update Clauses'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
