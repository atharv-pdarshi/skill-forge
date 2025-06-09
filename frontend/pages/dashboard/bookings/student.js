import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Container, Card, ListGroup, Badge, Alert, Spinner, Button, Row, Col } from 'react-bootstrap'; 
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify'; 

const StudentBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/bookings/student');
      setBookings(response.data);
    } catch (err) {
      console.error("Failed to fetch student bookings:", err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to load your bookings.';
      setError(errMsg);
      toast.error(errMsg);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if(user) { // Only fetch if user is loaded
        fetchBookings();
    } else if (!useAuth().loading) { // If auth is done loading and no user
        setLoading(false); // Stop loading indicator
    }
  }, [user]); // Depend on user from AuthContext

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
    try {
        await api.patch(`/bookings/${bookingId}/status`, { status: 'cancelled_by_student' });
        toast.success('Booking cancelled successfully.');
        fetchBookings();
    } catch (err) {
        const errorMessage = `Failed to cancel booking: ${err.response?.data?.message || err.message}`;
        toast.error(errorMessage);
        console.error("Cancel booking error:", err.response?.data || err.message);
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

  if (loading) {
    return (
      <Container className="text-center mt-5 d-flex justify-content-center align-items-center" style={{minHeight: '70vh'}}>
        <div>
          <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: 'var(--accent-color)' }}/>
          <p className="mt-3 lead" style={{color: 'var(--text-secondary-dark)'}}>Loading your bookings...</p>
        </div>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>My Booked Sessions | SkillForge</title>
        <meta name="description" content="View and manage the skill sessions you have booked on SkillForge." />
      </Head>
      <Container className="mt-4 mb-5">
        <div className="mb-4 pb-2" style={{borderBottom: `1px solid var(--border-color-dark)`}}>
          <h1 className="display-6 fw-bold">My Booked Sessions</h1>
          <p style={{color: 'var(--text-secondary-dark)'}}>Here are all the skill sessions you've booked as a student.</p>
        </div>

        {error && bookings.length === 0 && <Alert variant="danger" className="text-center py-3">{error}</Alert>} {/* Show error only if no bookings to display */}
        {!loading && bookings.length === 0 && !error && (
          <Alert variant="secondary" className="text-center py-4" style={{backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)'}}>
            <h4>No Bookings Yet!</h4>
            <p style={{color: 'var(--text-secondary-dark)'}}>You haven't booked any skills. Time to learn something new?</p>
            <Link href="/skills" passHref>
              <Button variant="primary" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>Explore Skills Now</Button>
            </Link>
          </Alert>
        )}
        <ListGroup variant="flush">
          {bookings.map(booking => (
            <ListGroup.Item key={booking.id} className="mb-3 p-3 p-md-4 border-0 rounded shadow-sm" style={{backgroundColor: 'var(--bg-secondary-dark)', border: `1px solid var(--border-color-dark) !important`}}>
              <Row className="align-items-center">
                <Col md={8}>
                  <h5 className="fw-semibold mb-1" style={{color: 'var(--text-primary-dark)'}}>{booking.skill?.title || 'Skill Title N/A'}</h5>
                  <p className="mb-1 small" style={{color: 'var(--text-secondary-dark)'}}>
                    With: <span className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>{booking.provider?.name || 'Provider N/A'}</span>
                  </p>
                  <p className="mb-1 small" style={{color: 'var(--text-secondary-dark)'}}>
                    Scheduled for: <span className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>{new Date(booking.bookingTime).toLocaleString()}</span>
                  </p>
                  {booking.message && 
                    <p className="mb-1 mt-2 fst-italic small" style={{color: 'var(--text-secondary-dark)'}}><strong style={{color: 'var(--text-primary-dark)'}}>Your message:</strong> "{booking.message}"</p>
                  }
                </Col>
                <Col md={4} className="text-md-end mt-2 mt-md-0">
                  <Badge bg={getStatusBadgeVariant(booking.status)} className="p-2 px-3 mb-2 mb-md-0 d-block" style={{fontSize: '0.9rem'}}> {/* d-block for badge full width */}
                    {booking.status?.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="mt-md-2 d-block ms-md-auto"
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{borderColor: '#dc3545', color: '#dc3545'}} 
                    >
                        Cancel Booking
                    </Button>
                  )}
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Container>
    </ProtectedRoute>
  );
};

export default StudentBookingsPage;