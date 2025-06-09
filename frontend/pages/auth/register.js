// frontend/pages/auth/register.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import Head from 'next/head';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard/profile');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setLoading(true);
    try {
      const success = await register(name, email, password);
      if (success) {
        // Redirect is handled by register function in AuthContext
      }
    } catch (err) {
      setError(err.response?.data || err.message || 'Failed to register. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Sign Up | SkillForge</title>
        <meta name="description" content="Create your SkillForge account to start learning and sharing skills." />
      </Head>
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
        <div className="w-100" style={{ maxWidth: '450px' }}>
          <Card className="p-4 shadow-lg" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)', borderRadius: '8px' }}>
            <Card.Body>
              <div className="text-center mb-4">
                <h2 className="fw-bold" style={{color: 'var(--text-primary-dark)'}}>Create Your Account</h2>
                <p style={{color: 'var(--text-secondary-dark)'}}>Join SkillForge and start your journey!</p>
              </div>
              {error && <Alert variant="danger" className="text-small py-2">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="name" className="mb-3">
                  <Form.Label className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                  />
                </Form.Group>
                <Form.Group id="emailReg" className="mb-3"> {/* Changed id to avoid conflict if on same page view */}
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
                <Form.Group id="passwordReg" className="mb-3">
                  <Form.Label className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a strong password"
                    style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                  />
                </Form.Group>
                <Form.Group id="confirmPassword" className="mb-3">
                  <Form.Label className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter your password"
                    style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                  />
                </Form.Group>
                <Button disabled={loading} className="w-100 mt-3 py-2 fw-semibold" type="submit" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', fontSize: '1.1rem'}}>
                  {loading ? <Spinner as="span" size="sm" animation="border" className="me-2" /> : 'Sign Up'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <div className="w-100 text-center mt-3">
            <span style={{color: 'var(--text-secondary-dark)'}}>Already have an account? </span>
            <Link href="/auth/login" style={{color: 'var(--accent-color)', fontWeight: 'bold'}}>
              Log In Here
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
};

export default RegisterPage;