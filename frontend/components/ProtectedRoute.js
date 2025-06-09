import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { Container, Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is done loading and user is not authenticated, redirect to login
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${router.asPath}`);
    }
  }, [isAuthenticated, authLoading, router]);

  // While auth state is loading, show a spinner or null
  if (authLoading) {
    return (
      <Container className="text-center mt-5" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading authentication status...</p>
        </div>
      </Container>
    );
  }

  // If authenticated, render the children components (the protected page)
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not loading (should have been redirected, but as a fallback)
  return null;
};

export default ProtectedRoute;