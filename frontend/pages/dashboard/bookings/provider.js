import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Container, Card, ListGroup, Badge, Alert, Spinner, Button, ButtonGroup, Dropdown, DropdownButton, Row, Col } from 'react-bootstrap'; // Corrected imports
import Head from 'next/head';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

const ProviderBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth(); // Correctly get authLoading

  const fetchBookings = useCallback(async () => { // Wrapped in useCallback
    if (!user) return; // Don't fetch if no user
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
  }, [user]); // Depends on user
  
  useEffect(() => {
    if (user) { // If user object is available from AuthContext
        fetchBookings();
    } else if (!authLoading) { // If auth check is done and there's no user
        setLoading(false); // Stop local loading indicator as there's nothing to fetch
        setBookings([]); // Clear any existing bookings
    }
  }, [user, authLoading, fetchBookings]); // Added fetchBookings to dependency array

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to update this booking to "${newStatus.replace(/_/g, ' ')}"?`)) return;
    try {
        await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
        toast.success(`Booking status updated to ${newStatus.replace(/_/g, ' ')}.`);
        fetchBookings(); // Refresh list
    } catch (err) {
        const errorMessage = `Failed to update status: ${err.response?.data?.message || err.message}`;
        toast.error(errorMessage);
        console.error("Update status error:", err.response?.data || err.message);
    }
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

  if (authLoading || loading) { // Check both authLoading and local loading
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
                <Row className="align-items-center"> {/* Row is now defined */}
                    <Col md={7} lg={8}> {/* Col is now defined */}
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
                    <Col md={5} lg={4} className="text-md-end mt-2 mt-md-0"> {/* Col is now defined */}
                    <Badge bg={getStatusBadgeVariant(booking.status)} className="p-2 px-3 mb-2 d-block" style={{fontSize: '0.9rem'}}>
                        STATUS: {booking.status?.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    {actionableStatuses.length > 0 && (
                        <DropdownButton // DropdownButton is now defined
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
                                onClick={() => handleUpdateStatus(booking.id, action.status)}
                            >
                                {action.label}
                            </Dropdown.Item>
                        ))}
                        </DropdownButton>
                    )}
                    </Col>
                </Row> {/* Row is now defined */}
                </ListGroup.Item>
            );
        })}
        </ListGroup>
      </Container>
    </ProtectedRoute>
  );
};

export default ProviderBookingsPage;