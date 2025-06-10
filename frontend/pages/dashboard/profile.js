import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Container, Card, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => { // Wrapped in useCallback
    if (!user || !user.id) { // Check user.id to ensure user object from context is populated
        setLoadingProfile(false);
        if (!authLoading) setError("User data not available. Please try logging in again.");
        return;
    }
    setLoadingProfile(true);
    setError(''); // Clear previous errors
    try {
      const response = await api.get('/users/profile');
      setProfileData(response.data);
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
      setError(err.response?.data?.message || err.message || "Could not load profile details.");
      setProfileData(null); // Clear profile data on error
    }
    setLoadingProfile(false);
  }, [user, authLoading]); // Depends on user and authLoading from context

  useEffect(() => {
    if (!authLoading) { // Only attempt to fetch if auth state is resolved
        fetchProfile();
    }
  }, [authLoading, fetchProfile]); // Added fetchProfile to dependency array


  if (authLoading || (loadingProfile && !profileData && !error)) { // Adjusted loading condition
    return (
      <Container className="text-center mt-5 d-flex justify-content-center align-items-center" style={{minHeight: '70vh'}}>
        <div>
            <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: 'var(--accent-color)' }} />
            <p className="mt-3 lead" style={{color: 'var(--text-secondary-dark)'}}>{`Loading Your Profile...`}</p>
        </div>
      </Container>
    );
  }
  
  // ProtectedRoute will handle redirect if !user after authLoading. This is an additional safeguard.
  if (!user && !authLoading && !error) { // Show if not loading and still no user (should be rare if ProtectedRoute works)
      return (
          <Container className="mt-5 text-center">
              <Alert variant="warning" className="py-4">
                  <h4>Access Denied</h4>
                  <p>{`Please log in to view your dashboard.`}</p>
                  <Link href="/auth/login" passHref>
                      <Button variant="primary" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>Go to Login</Button>
                  </Link>
              </Alert>
          </Container>
      );
  }

  if (error && !profileData) { // If there was an error fetching profile data
    return (
        <Container className="mt-5">
            <Alert variant="danger" className="text-center py-4">{error}</Alert>
            <div className="text-center">
                <Button variant="info" onClick={fetchProfile} disabled={loadingProfile}>
                    {loadingProfile ? 'Retrying...' : 'Retry Fetching Profile'}
                </Button>
            </div>
        </Container>
    );
  }
  
  const displayUser = profileData || user; // Prefer fresher profileData from API call, fallback to context's user

  if (!displayUser) { // Fallback if somehow displayUser is still null after all checks (e.g. profile fetched but was empty)
    return (
        <Container className="mt-5">
            <Alert variant="info" className="text-center py-4">{`User profile could not be displayed.`}</Alert>
        </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{`${displayUser.name || 'My'} Dashboard | SkillForge`}</title>
        <meta name="description" content="Manage your SkillForge profile, skills, and bookings." />
      </Head>
      <Container className="mt-4 mb-5">
        <div className="mb-5 text-center">
            <h1 className="display-5 fw-bold">Welcome, <span style={{color: 'var(--accent-color)'}}>{displayUser.name || 'User'}</span>!</h1>
            <p className="lead" style={{color: 'var(--text-secondary-dark)'}}>{`This is your personal SkillForge dashboard.`}</p>
        </div>
        
        <Card className="mb-4 shadow-sm" style={{backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)'}}>
          <Card.Header as="h4" className="fw-semibold p-3" style={{backgroundColor: 'rgba(var(--accent-color-rgb, 0,123,255), 0.1)', borderBottom: `1px solid var(--accent-color)`}}>
            Profile Information
          </Card.Header>
          <Card.Body className="p-4">
            <Row>
                <Col md={6} className="mb-2"><strong style={{color: 'var(--text-primary-dark)'}}>Name:</strong> <span style={{color: 'var(--text-secondary-dark)'}}>{displayUser.name || 'N/A'}</span></Col>
                <Col md={6} className="mb-2"><strong style={{color: 'var(--text-primary-dark)'}}>Email:</strong> <span style={{color: 'var(--text-secondary-dark)'}}>{displayUser.email || 'N/A'}</span></Col>
                <Col md={6}><strong style={{color: 'var(--text-primary-dark)'}}>Joined:</strong> <span style={{color: 'var(--text-secondary-dark)'}}>{displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : 'N/A'}</span></Col>
            </Row>
          </Card.Body>
        </Card>

        <Row className="g-4">
          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm text-center" style={{backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)'}}>
              <Card.Body className="d-flex flex-column p-4">
                <Card.Title as="h5" className="fw-semibold mb-3">My Skills</Card.Title>
                <Card.Text style={{color: 'var(--text-secondary-dark)', flexGrow: 1}}>{`Manage the skills you offer to the community.`}</Card.Text>
                <Link href="/dashboard/my-skills" passHref>
                  <Button variant="primary" className="mt-auto w-100" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>View My Skills</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm text-center" style={{backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)'}}>
              <Card.Body className="d-flex flex-column p-4">
                <Card.Title as="h5" className="fw-semibold mb-3">My Bookings (Student)</Card.Title>
                <Card.Text style={{color: 'var(--text-secondary-dark)', flexGrow: 1}}>{`Track and manage the skill sessions you've booked.`}</Card.Text>
                <Link href="/dashboard/bookings/student" passHref>
                  <Button variant="info" className="mt-auto w-100">View My Bookings</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={12} lg={4}> 
            <Card className="h-100 shadow-sm text-center" style={{backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)'}}>
              <Card.Body className="d-flex flex-column p-4">
                <Card.Title as="h5" className="fw-semibold mb-3">Bookings Received (Provider)</Card.Title>
                <Card.Text style={{color: 'var(--text-secondary-dark)', flexGrow: 1}}>{`Review and manage booking requests for your skills.`}</Card.Text>
                <Link href="/dashboard/bookings/provider" passHref>
                  <Button variant="warning" className="mt-auto w-100">View Received Bookings</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </ProtectedRoute>
  );
};

export default ProfilePage;