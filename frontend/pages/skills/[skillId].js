// frontend/pages/skills/[skillId].js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useRouter } from 'next/router';
import api from '../../services/api';
import {
  Container, Row, Col, Card, Badge, Button, Spinner, Alert, ListGroup,
  Modal, Form
} from 'react-bootstrap';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const SkillDetailPage = () => {
  const router = useRouter();
  const { skillId } = router.query;

  const [skill, setSkill] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [loadingSkill, setLoadingSkill] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  // State for user's current booking for THIS skill
  const [userBookingForThisSkill, setUserBookingForThisSkill] = useState(null);
  const [loadingUserBooking, setLoadingUserBooking] = useState(false); // Separate loading for this

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingTime, setBookingTime] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchSkillDetails = useCallback(async () => {
    if (!skillId) return;
    setLoadingSkill(true);
    setError('');
    try {
      const response = await api.get(`/skills/${skillId}`);
      setSkill(response.data);
    } catch (err) {
      console.error("Failed to fetch skill details:", err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to load skill details.';
      setError(errMsg);
      setSkill(null);
    }
    setLoadingSkill(false);
  }, [skillId]);

  const fetchSkillReviews = useCallback(async () => {
    if (!skillId) return;
    setLoadingReviews(true);
    try {
      const response = await api.get(`/skills/${skillId}/reviews`);
      setReviewsData(response.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      toast.error("Could not load reviews for this skill.");
      setReviewsData({ reviews: [], averageRating: 0, totalReviews: 0 });
    }
    setLoadingReviews(false);
  }, [skillId]);

  // ADDED: Function to fetch user's specific booking for this skill
  const fetchUserBookingForSkill = useCallback(async () => {
    if (!isAuthenticated || !user || !skillId) {
        setUserBookingForThisSkill(null);
        return;
    }
    setLoadingUserBooking(true);
    try {
        // Fetch all student bookings and filter client-side
        const response = await api.get('/bookings/student'); 
        const existingBooking = response.data.find(
            (b) => b.skill?.id === skillId && 
                   (b.status === 'pending' || b.status === 'confirmed')
        );
        setUserBookingForThisSkill(existingBooking || null);
    } catch (err) {
        console.error("Failed to fetch user's booking for this skill:", err);
        setUserBookingForThisSkill(null);
    }
    setLoadingUserBooking(false);
  }, [isAuthenticated, user, skillId]);

  useEffect(() => {
    if (skillId) {
      fetchSkillDetails();
      fetchSkillReviews();
      // ADDED: Fetch user's booking for this skill if authenticated
      if (isAuthenticated && user) {
        fetchUserBookingForSkill();
      } else {
        setUserBookingForThisSkill(null); // Clear if user logs out or isn't loaded
      }
    }
  }, [skillId, fetchSkillDetails, fetchSkillReviews, isAuthenticated, user, fetchUserBookingForSkill]); // Added dependencies

  const handleShowBookingModal = () => setShowBookingModal(true);
  const handleCloseBookingModal = () => { /* ... (no change) ... */ };
  const handleShowReviewModal = () => setShowReviewModal(true);
  const handleCloseReviewModal = () => { /* ... (no change) ... */ };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    // ... (existing validation) ...
    setBookingLoading(true);
    setBookingError('');
    try {
      await api.post('/bookings', { /* ... */ });
      toast.success('Booking request sent successfully!');
      handleCloseBookingModal();
      fetchUserBookingForSkill(); // <<<< REFRESH user's booking status for this skill
    } catch (err) {
      // ... (existing error handling) ...
    }
    setBookingLoading(false);
  };

  const handleReviewSubmit = async (e) => { /* ... (no change from your existing code) ... */ };

  // ADDED: Helper for badge variants (if you don't have it globally or from another import)
  const getStatusBadgeVariant = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return 'warning';
    if (s === 'confirmed') return 'success';
    if (s === 'completed') return 'primary';
    if (s === 'cancelled_by_student' || s === 'cancelled_by_provider') return 'danger';
    return 'secondary';
  };
  
  if (authLoading || loadingSkill) { /* ... (no change) ... */ }
  if (error && !skill) { /* ... (no change) ... */ }
  if (!skill && !loadingSkill && !authLoading) { /* ... (no change) ... */ }

  // MODIFIED: Conditional rendering flags
  const isProvider = isAuthenticated && user && skill && skill.user && user.id === skill.user.id;
  // User can book if authenticated, not the provider, no existing active booking, and not currently loading booking status
  const canBook = isAuthenticated && !isProvider && !userBookingForThisSkill && !loadingUserBooking;

  const hasUserReviewed = isAuthenticated && user && reviewsData.reviews.some(review => review.reviewer?.id === user.id);
  // Potentially, only allow review if booking is 'confirmed' or 'completed'
  // const canReview = isAuthenticated && !isProvider && !hasUserReviewed && userBookingForThisSkill && (userBookingForThisSkill.status === 'confirmed' || userBookingForThisSkill.status === 'completed');
  const canReview = isAuthenticated && !isProvider && !hasUserReviewed; // Keeping your simpler logic for now


  return (
    <>
      <Head>
        <title>{`${skill?.title || 'Skill Details'} | SkillForge`}</title>
        <meta name="description" content={skill?.description?.substring(0, 160) || `Details about the skill: ${skill?.title}`} />
      </Head>
      <Container className="my-4 my-lg-5">
        {/* ... (Back to skills button - no change) ... */}
        <div className="mb-4">
            <Link href="/skills" passHref>
                <Button variant="outline-secondary" size="sm" style={{borderColor: 'var(--border-color-dark)', color: 'var(--text-secondary-dark)'}}>
                    « Back to All Skills
                </Button>
            </Link>
        </div>

        <Row className="g-lg-5 g-md-4 g-3">
            <Col lg={7} md={12} className="mb-4 mb-lg-0">
                <Card className="shadow-sm h-100" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }}>
                    {/* ... (Card.Header and Skill Details - no major change, uses skill?. ) ... */}
                    <Card.Header className="p-4" style={{borderBottom: `1px solid var(--border-color-dark)`}}>
                        <h1 className="display-5 fw-bold mb-2" style={{color: 'var(--text-primary-dark)'}}>{skill?.title}</h1>
                        <div className="mb-2">
                            <Badge pill className="me-2 p-2 px-3" style={{ backgroundColor: `rgba(var(--accent-color-rgb, 0,123,255), 0.2)`, color: `var(--text-primary-dark)`, fontSize: '0.9rem', fontWeight: 500, border: `1px solid rgba(var(--accent-color-rgb, 0,123,255), 0.4)`}}>
                                {skill?.category || 'Uncategorized'}
                            </Badge>
                        </div>
                        {skill?.user && (
                            <Card.Text style={{color: 'var(--text-secondary-dark)'}}>
                                Offered by: <span className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>{skill.user.name || skill.user.email}</span>
                            </Card.Text>
                        )}
                    </Card.Header>
                    <Card.Body className="p-4 d-flex flex-column">
                        {/* ... (Price, Description - no major change, uses skill?. ) ... */}
                        <div style={{flexGrow: 1}}>
                            <Card.Text className="fs-5 mb-3">
                            <strong>Price:</strong> {skill?.pricePerHour ? 
                                <span className="fw-bold" style={{color: 'var(--accent-color)'}}>${skill.pricePerHour.toFixed(2)}<span style={{color: 'var(--text-secondary-dark)', fontSize: '0.9rem'}}>/hr</span></span> 
                                : <span style={{color: 'var(--text-secondary-dark)'}}>{`Not specified`}</span>}
                            </Card.Text>
                            
                            <h5 className="fw-semibold mt-4 mb-2">Skill Description</h5>
                            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary-dark)', lineHeight: '1.75' }}>
                                {skill?.description || 'No detailed description provided.'}
                            </p>
                        </div>
                        
                        <hr className="my-4" style={{borderColor: 'var(--border-color-dark)'}}/>
                        
                        {/* MODIFIED: Booking Button Area */}
                        <div className="d-flex flex-wrap gap-2 align-items-center mt-auto">
                            {isAuthenticated && !isProvider && loadingUserBooking && (
                                <Button variant="secondary" disabled size="lg">
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Checking booking status...
                                </Button>
                            )}
                            {isAuthenticated && !isProvider && !loadingUserBooking && userBookingForThisSkill && (
                                <Alert variant={getStatusBadgeVariant(userBookingForThisSkill.status) === 'warning' ? 'info' : getStatusBadgeVariant(userBookingForThisSkill.status)} className="py-2 px-3 mb-0 w-100 text-center">
                                    Your Booking Status: <Badge bg={getStatusBadgeVariant(userBookingForThisSkill.status)} pill>{userBookingForThisSkill.status?.replace(/_/g, ' ').toUpperCase()}</Badge>
                                    {/* You could add a link to /dashboard/bookings/student here */}
                                </Alert>
                            )}
                            {canBook && ( // This condition now includes !userBookingForThisSkill && !loadingUserBooking
                                <Button variant="primary" size="lg" onClick={handleShowBookingModal} style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
                                    Request to Book
                                </Button>
                            )}

                            {/* Review Button Logic */}
                            {canReview && (
                                <Button variant="outline-info" onClick={handleShowReviewModal} style={{borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}}>
                                    Leave a Review
                                </Button>
                            )}

                            {/* Login to Book/Review Buttons */}
                            {!isAuthenticated && skill && (
                                <>
                                <Link href={`/auth/login?redirect=/skills/${skillId}`} passHref>
                                    <Button variant="outline-light" style={{borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}}>Login to Book</Button>
                                </Link>
                                <Link href={`/auth/login?redirect=/skills/${skillId}`} passHref>
                                    <Button variant="outline-light" className="ms-lg-2 mt-2 mt-lg-0" style={{borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}}>Login to Review</Button>
                                </Link>
                                </>
                            )}
                        </div>

                        {/* ... (isProvider, hasUserReviewed messages - no major change) ... */}
                        {isAuthenticated && isProvider && (
                            <Alert variant="dark" className="mt-3 py-2 px-3 text-center" style={{backgroundColor: 'var(--bg-primary-dark)', borderColor: 'var(--border-color-dark)'}}>{`This is one of your skills.`}</Alert>
                        )}
                        {isAuthenticated && !isProvider && hasUserReviewed && (
                            <p className="mt-3" style={{color: 'var(--accent-color)'}}><small>{`✓ You've already reviewed this skill. Thank you!`}</small></p>
                        )}
                    </Card.Body>
                </Card>
            </Col>

            {/* ... (Reviews Column - no major change, just uses skill?. ) ... */}
            <Col lg={5} md={12}>
                {/* ... Your existing reviews section ... */}
            </Col>
        </Row>

        {/* ... (Modals for Booking and Review - no change) ... */}
        {/* Booking Modal */}
        {/* Review Modal */}
      </Container>
    </>
  );
};

export default SkillDetailPage;