// components/Header.js
import Link from 'next/link'; // Make sure this is from 'next/link'
import { Navbar, Nav, Container } from 'react-bootstrap';

export default function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        {/* Let Next/Link render the <a> tag, and pass Navbar.Brand content as children */}
        <Navbar.Brand as={Link} href="/">
          SkillShare
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Let Next/Link render the <a> tag, and pass Nav.Link content as children */}
            {/* Nav.Link itself is now more of a styling wrapper */}
            <Nav.Link as={Link} href="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} href="/about">
              About
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}