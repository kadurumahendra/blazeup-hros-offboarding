import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="480px">
      <div className="modal-body" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: isDanger ? 'var(--danger-light)' : 'var(--warning-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={20} color={isDanger ? 'var(--danger)' : 'var(--warning)'} />
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
          {message}
        </p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={loading}>
          {cancelText}
        </button>
        <button
          className={`btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};
