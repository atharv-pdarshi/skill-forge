import React, { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    if (skillId) {
      fetchSkillDetails();
      fetchSkillReviews();
    }
  }, [skillId, fetchSkillDetails, fetchSkillReviews]);

  const handleShowBookingModal = () => setShowBookingModal(true);
  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setBookingError('');
    setBookingTime('');
    setBookingMessage('');
  };

  const handleShowReviewModal = () => setShowReviewModal(true);
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewError('');
    setReviewRating(0);
    setReviewComment('');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setBookingError("Please log in to book a skill.");
      toast.warn("Please log in to book a skill.");
      return;
    }
    if (!bookingTime) {
      setBookingError("Please select a booking time.");
      toast.warn("Please select a booking time.");
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      await api.post('/bookings', {
        skillId: skillId,
        bookingTime: new Date(bookingTime).toISOString(),
        message: bookingMessage,
      });
      toast.success('Booking request sent successfully!');
      handleCloseBookingModal();
    } catch (err) {
      console.error("Booking submission failed:", err.response?.data || err.message);
      const errMsg = err.response?.data?.message || err.message || "Failed to send booking request.";
      setBookingError(errMsg);
      toast.error(errMsg);
    }
    setBookingLoading(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setReviewError("Please log in to leave a review.");
      toast.warn("Please log in to leave a review.");
      return;
    }
    const numericRating = Number(reviewRating);
    if (numericRating < 1 || numericRating > 5) {
      setReviewError("Please select a rating between 1 and 5.");
      toast.warn("Please select a rating between 1 and 5.");
      return;
    }
    setReviewLoading(true);
    setReviewError('');
    try {
      await api.post(`/skills/${skillId}/reviews`, {
        rating: numericRating,
        comment: reviewComment,
      });
      toast.success('Review submitted successfully!');
      handleCloseReviewModal();
      fetchSkillReviews();
    } catch (err) {
      console.error("Review submission failed:", err.response?.data || err.message);
      const errMsg = err.response?.data?.message || err.message || "Failed to submit review.";
      setReviewError(errMsg);
      toast.error(errMsg);
    }
    setReviewLoading(false);
  };

  if (authLoading || loadingSkill) {
    return (
      <Container className="text-center mt-5 d-flex justify-content-center align-items-center" style={{minHeight: '70vh'}}>
        <div>
            <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: 'var(--accent-color)' }}/>
            <p className="mt-3 lead" style={{color: 'var(--text-secondary-dark)'}}>{`Loading skill details...`}</p>
        </div>
      </Container>
    );
  }

  if (error && !skill) {
    return <Container className="mt-5"><Alert variant="danger" className="text-center py-4">{error}</Alert></Container>;
  }

  if (!skill && !loadingSkill && !authLoading) {
    return (
        <Container className="mt-5">
            <Alert variant="info" className="text-center py-4">{`Skill not found or is unavailable.`}</Alert>
            <div className="text-center">
                <Link href="/skills" passHref>
                    <Button variant="secondary">Back to All Skills</Button>
                </Link>
            </div>
        </Container>
    );
  }

  const isProvider = isAuthenticated && user && skill && skill.user && user.id === skill.user.id;
  const canBook = isAuthenticated && !isProvider;
  const hasUserReviewed = isAuthenticated && user && reviewsData.reviews.some(review => review.reviewer?.id === user.id);
  const canReview = isAuthenticated && !isProvider && !hasUserReviewed;

  return (
    <>
      <Head>
        <title>{`${skill?.title || 'Skill Details'} | SkillForge`}</title>
        <meta name="description" content={skill?.description?.substring(0, 160) || `Details about the skill: ${skill?.title}`} />
      </Head>
      <Container className="my-4 my-lg-5">
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
                    <Card.Header className="p-4" style={{borderBottom: `1px solid var(--border-color-dark)`}}>
                        <h1 className="display-5 fw-bold mb-2" style={{color: 'var(--text-primary-dark)'}}>{skill?.title}</h1>
                        <div className="mb-2">
                            <Badge pill className="me-2 p-2 px-3" style={{ backgroundColor: 'rgba(var(--accent-color-rgb, 0,123,255), 0.15)', color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 500}}>
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
                        
                        <div className="d-flex flex-wrap gap-2 align-items-center mt-auto">
                            {canBook && (
                                <Button variant="primary" size="lg" onClick={handleShowBookingModal} style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
                                    Request to Book
                                </Button>
                            )}

                            {canReview && (
                                <Button variant="outline-info" onClick={handleShowReviewModal} style={{borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}}>
                                    Leave a Review
                                </Button>
                            )}

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

                        {isAuthenticated && isProvider && (
                            <Alert variant="dark" className="mt-3 py-2 px-3 text-center" style={{backgroundColor: 'var(--bg-primary-dark)', borderColor: 'var(--border-color-dark)'}}>{`This is one of your skills.`}</Alert>
                        )}
                        {isAuthenticated && !isProvider && hasUserReviewed && (
                            <p className="mt-3" style={{color: 'var(--accent-color)'}}><small>{`✓ You've already reviewed this skill. Thank you!`}</small></p>
                        )}
                    </Card.Body>
                </Card>
            </Col>

            <Col lg={5} md={12}>
                <div className="sticky-top" style={{top: 'calc(var(--navbar-height, 70px) + 2rem)'}}>
                    <h3 className="fw-bold mb-1">Community Reviews</h3>
                    <p className="mb-3" style={{color: 'var(--text-secondary-dark)'}}>
                        {reviewsData.totalReviews > 0 
                            ? <>{`Average Rating:`} <strong style={{color: 'var(--accent-color)', fontSize: '1.2rem'}}>{reviewsData.averageRating.toFixed(1)} ★</strong> ({reviewsData.totalReviews} {`reviews`})</>
                            : `No reviews yet.`
                        }
                    </p>
                    
                    {loadingReviews ? (
                        <div className="text-center py-4"><Spinner animation="border" size="sm" style={{color: 'var(--accent-color)'}}/> <span style={{color: 'var(--text-secondary-dark)'}}>{`Loading reviews...`}</span></div>
                    ) : reviewsData.reviews.length > 0 ? (
                        <ListGroup variant="flush" style={{maxHeight: '60vh', overflowY: 'auto'}}>
                            {reviewsData.reviews.map(review => (
                            <ListGroup.Item key={review.id} className="mb-3 p-3 border-0 rounded shadow-sm" style={{backgroundColor: 'var(--bg-secondary-dark)', border: `1px solid var(--border-color-dark) !important`}}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0" style={{fontSize: '1.1rem', color: 'var(--text-primary-dark)'}}>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</h5>
                                    <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
                                </div>
                                {review.reviewer && <p className="mb-1 mt-1 fw-medium" style={{color: 'var(--text-primary-dark)', fontSize: '0.9rem'}}>By: {review.reviewer.name || 'Anonymous'}</p>}
                                {review.comment && <p className="mb-0 fst-italic" style={{color: 'var(--text-secondary-dark)', fontSize: '0.95rem'}}>{`"${review.comment}"`}</p>}
                            </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <p style={{color: 'var(--text-secondary-dark)'}}>{canReview ? `Be the first to leave a review!` : `No reviews for this skill yet.`}</p>
                    )}
                </div>
            </Col>
        </Row>

        {/* Booking Modal */}
        <Modal show={showBookingModal} onHide={handleCloseBookingModal} centered data-bs-theme="dark">
          <Modal.Header closeButton style={{borderColor: 'var(--border-color-dark)'}}>
            <Modal.Title style={{color: 'var(--text-primary-dark)'}}>{`Book Skill: ${skill?.title}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{backgroundColor: 'var(--bg-secondary-dark)'}}>
            {bookingError && <Alert variant="danger">{bookingError}</Alert>}
            <Form onSubmit={handleBookingSubmit}>
              <Form.Group className="mb-3" controlId="bookingTime">
                <Form.Label style={{color: 'var(--text-primary-dark)'}}>Select Date and Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                  min={new Date(new Date().getTime() + 5 * 60000).toISOString().slice(0, 16)}
                  style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="bookingMessage">
                <Form.Label style={{color: 'var(--text-primary-dark)'}}>Message to Provider (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Any specific requests or questions?"
                  style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={bookingLoading} className="w-100 py-2 fw-semibold" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
                {bookingLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Sending...</> : 'Send Booking Request'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Review Modal */}
        <Modal show={showReviewModal} onHide={handleCloseReviewModal} centered data-bs-theme="dark">
          <Modal.Header closeButton style={{borderColor: 'var(--border-color-dark)'}}>
            <Modal.Title style={{color: 'var(--text-primary-dark)'}}>{`Leave a Review for: ${skill?.title}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{backgroundColor: 'var(--bg-secondary-dark)'}}>
            {reviewError && <Alert variant="danger">{reviewError}</Alert>}
            <Form onSubmit={handleReviewSubmit}>
              <Form.Group className="mb-3" controlId="reviewRating">
                <Form.Label style={{color: 'var(--text-primary-dark)'}}>Your Rating</Form.Label>
                <div className="mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="link"
                      onClick={() => setReviewRating(star)}
                      className="p-1 me-1 shadow-none border-0" 
                      aria-label={`${star} star`}
                      style={{textDecoration: 'none'}}
                    >
                      <span style={{ fontSize: '2rem', color: star <= reviewRating ? 'var(--accent-color)' : 'var(--border-color-dark)' }}>
                        {star <= reviewRating ? '★' : '☆'}
                      </span>
                    </Button>
                  ))}
                </div>
              </Form.Group>
              <Form.Group className="mb-3" controlId="reviewComment">
                <Form.Label style={{color: 'var(--text-primary-dark)'}}>Your Comment (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this skill..."
                  style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={reviewLoading} className="w-100 py-2 fw-semibold" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
                {reviewLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Submitting...</> : 'Submit Review'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default SkillDetailPage;