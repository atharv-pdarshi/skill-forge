import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Container, ListGroup, Badge, Alert, Spinner, Button, ButtonGroup, Dropdown, DropdownButton, Row, Col, Form } from 'react-bootstrap'; // Added Form
import Head from 'next/head';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../../components/ConfirmationModal';

const ProviderBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({});
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [providerMessage, setProviderMessage] = useState('');

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/bookings/provider');
      setBookings(response.data);
    } catch (err) {
      console.error("Failed to fetch provider bookings:", err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to load received bookings.';
      setError(errMsg);
      toast.error(errMsg);
    }
    setLoading(false);
  }, [user]); 
  
  useEffect(() => {
    if (user) {
        fetchBookings();
    } else if (!authLoading) {
        setLoading(false);
        setBookings([]);
    }
  }, [user, authLoading, fetchBookings]);

  const openUpdateStatusModal = (bookingId, newStatus, actionLabel) => {
    // Reset provider message if opening modal for confirmation
    if (newStatus === 'confirmed') {
      setProviderMessage(''); 
    }
    setConfirmModalProps({
      title: `Confirm: ${actionLabel}`,
      bodyText: `Are you sure you want to update this booking to "${newStatus.replace(/_/g, ' ')}"?`, 
      confirmButtonText: `Yes, ${actionLabel}`,
      confirmButtonVariant: newStatus.includes('cancel') || newStatus.includes('decline') || newStatus.includes('cancelled') ? 'danger' : 'primary',
      // Pass providerMessage to onConfirm if the action is 'confirmed'
      onConfirm: () => performStatusUpdate(bookingId, newStatus, (newStatus === 'confirmed' ? providerMessage : undefined)),
      // Field to indicate if message input should be shown
      showProviderMessageInput: newStatus === 'confirmed' 
    });
    setShowConfirmModal(true);
  };

  // performStatusUpdate to accept and send the message
  const performStatusUpdate = async (bookingId, newStatus, messageForStudent) => {
    setIsSubmittingAction(true);
    try {
        const payload = { status: newStatus };
        if (newStatus === 'confirmed' && messageForStudent !== undefined) {
          payload.providerMessageOnConfirm = messageForStudent;
        }
        await api.patch(`/bookings/${bookingId}/status`, payload);
        toast.success(`Booking status updated to ${newStatus.replace(/_/g, ' ')}.`);
        fetchBookings(); // Refresh list
    } catch (err) {
        const errorMessage = `Failed to update status: ${err.response?.data?.message || err.message}`;
        toast.error(errorMessage);
        console.error("Update status error:", err.response?.data || err.message);
    }
    setShowConfirmModal(false);
    setIsSubmittingAction(false);
  };

  const getStatusBadgeVariant = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return 'warning';
    if (s === 'confirmed') return 'success';
    if (s === 'completed') return 'primary';
    if (s === 'cancelled_by_student' || s === 'cancelled_by_provider') return 'danger';
    return 'secondary';
  };

  const getActionableStatuses = (currentStatus) => {
    const actions = [];
    if (currentStatus === 'pending') {
        actions.push({ label: 'Confirm Booking', status: 'confirmed', variant: 'success'});
        actions.push({ label: 'Decline Request', status: 'cancelled_by_provider', variant: 'danger'});
    } else if (currentStatus === 'confirmed') {
        actions.push({ label: 'Mark as Completed', status: 'completed', variant: 'primary'});
        actions.push({ label: 'Cancel (Provider)', status: 'cancelled_by_provider', variant: 'outline-danger'});
    }
    return actions;
  };

  if (authLoading || loading) {
    return (
      <Container className="text-center mt-5 d-flex justify-content-center align-items-center" style={{minHeight: '70vh'}}>
        <div>
            <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: 'var(--accent-color)' }}/>
            <p className="mt-3 lead" style={{color: 'var(--text-secondary-dark)'}}>Loading received bookings...</p>
        </div>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Received Bookings | SkillForge</title>
        <meta name="description" content="Manage booking requests for the skills you offer on SkillForge." />
      </Head>
      <Container className="mt-4 mb-5">
        {/* ... (header, error/empty state - no change) ... */}
        <div className="mb-4 pb-2" style={{borderBottom: `1px solid var(--border-color-dark)`}}>
          <h1 className="display-6 fw-bold">Received Booking Requests</h1>
          <p style={{color: 'var(--text-secondary-dark)'}}>Manage incoming requests for your skills.</p>
        </div>

        {error && bookings.length === 0 && <Alert variant="danger" className="text-center py-3">{error}</Alert>}
        {!loading && bookings.length === 0 && !error && (
          <Alert variant="secondary" className="text-center py-4" style={{backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)'}}>
            <h4>No Booking Requests Yet!</h4>
            <p style={{color: 'var(--text-secondary-dark)'}}>{`You haven't received any booking requests for your skills at the moment.`}</p>
          </Alert>
        )}
        <ListGroup variant="flush">
          {bookings.map(booking => {
            const actionableStatuses = getActionableStatuses(booking.status);
            return (
                <ListGroup.Item key={booking.id} className="mb-3 p-3 p-md-4 border-0 rounded shadow-sm" style={{backgroundColor: 'var(--bg-secondary-dark)', border: `1px solid var(--border-color-dark) !important`}}>
                <Row className="align-items-center">
                    <Col md={7} lg={8}>
                    <h5 className="fw-semibold mb-1" style={{color: 'var(--text-primary-dark)'}}>Skill: {booking.skill?.title || 'Skill N/A'}</h5>
                    <p className="mb-1 small" style={{color: 'var(--text-secondary-dark)'}}>
                        Booked by: <span className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>{booking.student?.name || 'Student N/A'}</span> ({booking.student?.email || 'No Email'})
                    </p>
                    <p className="mb-1 small" style={{color: 'var(--text-secondary-dark)'}}>
                        Requested for: <span className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>{new Date(booking.bookingTime).toLocaleString()}</span>
                    </p>
                    {booking.message && 
                        <p className="mb-1 mt-2 fst-italic small" style={{color: 'var(--text-secondary-dark)'}}><strong style={{color: 'var(--text-primary-dark)'}}>{`Student's message:`}</strong> {`"${booking.message}"`}</p>
                    }
                    </Col>
                    <Col md={5} lg={4} className="text-md-end mt-2 mt-md-0">
                    <Badge bg={getStatusBadgeVariant(booking.status)} className="p-2 px-3 mb-2 d-block" style={{fontSize: '0.9rem'}}>
                        STATUS: {booking.status?.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    {actionableStatuses.length > 0 && (
                        <DropdownButton
                            as={ButtonGroup}
                            key={`actions-${booking.id}`} 
                            id={`dropdown-actions-${booking.id}`}
                            size="sm"
                            variant="outline-light" 
                            title="Manage"
                            className="mt-2 d-block"
                            style={{borderColor: 'var(--border-color-dark)', color: 'var(--text-primary-dark)'}}
                        >
                        {actionableStatuses.map(action => (
                            <Dropdown.Item 
                                key={action.status} 
                                onClick={() => openUpdateStatusModal(booking.id, action.status, action.label)}
                            >
                                {action.label}
                            </Dropdown.Item>
                        ))}
                        </DropdownButton>
                    )}
                    </Col>
                </Row>
                </ListGroup.Item>
            );
        })}
        </ListGroup>
      </Container>

      <ConfirmationModal
        show={showConfirmModal}
        onHide={() => {
            setShowConfirmModal(false);
            setProviderMessage(''); // Reset message when modal is hidden
        }}
        onConfirm={confirmModalProps.onConfirm}
        title={confirmModalProps.title}
        // The 'body' prop for simple text is now 'bodyText' in confirmModalProps
        // We pass children to render the custom form content
        confirmButtonText={confirmModalProps.confirmButtonText}
        confirmButtonVariant={confirmModalProps.confirmButtonVariant}
        isConfirming={isSubmittingAction}
      >
        {/* Custom body content for the modal */}
        <p>{confirmModalProps.bodyText}</p> {/* Display the standard confirmation text */}
        {confirmModalProps.showProviderMessageInput && ( // Conditionally show the message input
          <Form.Group className="mt-3" controlId="providerMessageToStudent">
            <Form.Label style={{color: 'var(--text-primary-dark)'}}>
              Message to Student (e.g., meeting link, instructions - will be emailed)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={providerMessage}
              onChange={(e) => setProviderMessage(e.target.value)}
              placeholder="Enter your message here..."
              style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
            />
          </Form.Group>
        )}
      </ConfirmationModal>
    </ProtectedRoute>
  );
};

export default ProviderBookingsPage;