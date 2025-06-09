import Link from 'next/link';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout, loading } = useAuth();

  return (
    <Navbar 
      expand="lg" 
      className="mb-4 shadow-sm"
      style={{ backgroundColor: 'var(--bg-secondary-dark)', borderBottom: '1px solid var(--border-color-dark)' }}
      data-bs-theme="dark"
    >
      <Container>
        <Navbar.Brand as={Link} href="/" style={{ color: 'var(--text-primary-dark)', fontWeight: 'bold' }}>
          SkillForge
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ borderColor: 'var(--border-color-dark)'}} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/" style={{ color: 'var(--text-secondary-dark)' }} className="nav-link-custom">
              Home
            </Nav.Link>
            <Nav.Link as={Link} href="/about" style={{ color: 'var(--text-secondary-dark)' }} className="nav-link-custom">
              About
            </Nav.Link>
            <Nav.Link as={Link} href="/skills" style={{ color: 'var(--text-secondary-dark)' }} className="nav-link-custom">
              Browse Skills
            </Nav.Link>
          </Nav>
          <Nav>
            {loading ? (
              <Navbar.Text style={{ color: 'var(--text-secondary-dark)' }}>Loading...</Navbar.Text>
            ) : isAuthenticated ? (
              <>
                <Nav.Link as={Link} href="/dashboard/profile" style={{ color: 'var(--text-secondary-dark)' }} className="nav-link-custom">
                  {user ? user.name || user.email : 'Profile'}
                </Nav.Link>
                <Button variant="outline-light" onClick={logout} size="sm" style={{borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}}>
                    Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} href="/auth/login" style={{ color: 'var(--text-secondary-dark)' }} className="nav-link-custom">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} href="/auth/register" style={{ color: 'var(--text-secondary-dark)' }} className="nav-link-custom">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
