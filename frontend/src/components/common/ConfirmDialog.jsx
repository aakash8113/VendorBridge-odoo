import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onCancel,
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to perform this action?', 
  confirmLabel = 'Confirm', 
  variant = 'danger',
  loading = false
}) {
  const handleClose = onCancel || onClose;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div style={{ padding: '4px 0' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} disabled={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
