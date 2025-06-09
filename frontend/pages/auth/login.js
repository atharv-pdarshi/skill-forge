import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import Head from 'next/head';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard/profile');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Redirect is handled by login function in AuthContext on success
        const redirectPath = router.query.redirect || '/dashboard/profile';
        router.push(redirectPath);
      }
    } catch (err) {
      setError(err.response?.data || err.message || 'Failed to login. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login | SkillForge</title>
        <meta name="description" content="Log in to your SkillForge account." />
      </Head>
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
        <div className="w-100" style={{ maxWidth: '450px' }}>
          <Card className="p-4 shadow-lg" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)', borderRadius: '8px' }}>
            <Card.Body>
              <div className="text-center mb-4">
                <h2 className="fw-bold" style={{color: 'var(--text-primary-dark)'}}>Welcome Back!</h2>
                <p style={{color: 'var(--text-secondary-dark)'}}>Log in to continue your SkillForge journey.</p>
              </div>
              {error && <Alert variant="danger" className="text-small py-2">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="email" className="mb-3">
                  <Form.Label className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                  />
                </Form.Group>
                <Form.Group id="password" className="mb-3">
                  <Form.Label className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                  />
                </Form.Group>
                <Button disabled={loading} className="w-100 mt-3 py-2 fw-semibold" type="submit" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', fontSize: '1.1rem'}}>
                  {loading ? <Spinner as="span" size="sm" animation="border" className="me-2" /> : 'Log In'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <div className="w-100 text-center mt-3">
            <span style={{color: 'var(--text-secondary-dark)'}}>Need an account? </span>
            <Link href="/auth/register" style={{color: 'var(--accent-color)', fontWeight: 'bold'}}>
              Sign Up Here
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
};

export default LoginPage;