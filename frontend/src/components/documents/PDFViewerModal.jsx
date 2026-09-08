import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Download, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { documentService } from '../../services/documentService';

export const PDFViewerModal = ({ isOpen, onClose, document: docRecord }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let currentUrl = null;

    const loadPdfBlob = async () => {
      if (!docRecord?._id || !isOpen) {
        setBlobUrl(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const blob = await documentService.downloadPDFBlob(docRecord._id);
        currentUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        setBlobUrl(currentUrl);
      } catch (err) {
        console.error('Failed to render PDF blob:', err);
        setError(err.message || 'Unable to render official document');
      } finally {
        setLoading(false);
      }
    };

    loadPdfBlob();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [docRecord?._id, isOpen]);

  if (!docRecord) return null;

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = docRecord.fileName || `${docRecord.type}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Official Document: ${docRecord.title}`}
      maxWidth="860px"
    >
      <div className="modal-body" style={{ padding: 0, minHeight: '520px', position: 'relative' }}>
        {loading && (
          <div
            style={{
              height: '520px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid #e2e8f0',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Generating standalone official PDF document...
            </span>
          </div>
        )}

        {error && (
          <div
            style={{
              height: '520px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fef2f2',
              padding: '24px',
              textAlign: 'center',
              gap: '12px'
            }}
          >
            <AlertCircle size={36} color="#ef4444" />
            <h4 style={{ color: '#991b1b', fontSize: '16px' }}>Failed to Load Document</h4>
            <p style={{ color: '#b91c1c', fontSize: '13px', maxWidth: '400px' }}>{error}</p>
          </div>
        )}

        {!loading && !error && blobUrl && (
          <iframe
            src={`${blobUrl}#toolbar=1&navpanes=0`}
            title={docRecord.title}
            style={{
              width: '100%',
              height: '560px',
              border: 'none',
              backgroundColor: '#525659'
            }}
          />
        )}
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary btn-sm" onClick={onClose}>
          Close
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleDownload}
          disabled={!blobUrl || loading}
        >
          <Download size={15} /> Download PDF
        </button>
      </div>
    </Modal>
  );
};
