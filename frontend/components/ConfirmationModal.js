import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const ConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  title,
  body,
  children,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  confirmButtonVariant = "primary",
  isConfirming = false, // To show a spinner on the confirm button
}) => {
  return (
    <Modal show={show} onHide={onHide} centered data-bs-theme="dark"> {/* Ensure dark theme for modal */}
      <Modal.Header closeButton style={{borderColor: 'var(--border-color-dark)'}}>
        <Modal.Title style={{color: 'var(--text-primary-dark)'}}>{title || "Confirm Action"}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{backgroundColor: 'var(--bg-secondary-dark)', color: 'var(--text-secondary-dark)'}}>
        {children || body || "Are you sure you want to proceed with this action?"}
      </Modal.Body>
      <Modal.Footer style={{backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)'}}>
        <Button 
          variant="outline-secondary" 
          onClick={onHide} 
          disabled={isConfirming}
          style={{borderColor: 'var(--border-color-dark)', color: 'var(--text-secondary-dark)'}}
        >
          {cancelButtonText}
        </Button>
        <Button 
          variant={confirmButtonVariant} 
          onClick={onConfirm} 
          disabled={isConfirming}
          style={confirmButtonVariant === 'primary' ? {backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'} : {}}
        >
          {isConfirming ? (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
          ) : null}
          {isConfirming ? 'Processing...' : confirmButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;