import Head from 'next/head';
import Link from 'next/link'; 
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const AboutPage = () => {
  return (
    <>
      <Head>
        <title>About SkillForge | Our Mission and Vision</title>
        <meta name="description" content="Learn more about SkillForge, our mission to connect learners and experts, and the values that drive our community." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-5 text-center" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderBottom: '1px solid var(--border-color-dark)' }}>
        <Container>
          <h1 className="display-4 fw-bold" style={{color: 'var(--text-primary-dark)'}}>About <span style={{color: 'var(--accent-color)'}}>SkillForge</span></h1>
          <p className="lead col-lg-8 mx-auto" style={{color: 'var(--text-secondary-dark)'}}>
            {`Connecting passion with opportunity. Discover who we are, our mission, and the community we're building together.`}
          </p>
        </Container>
      </div>

      <Container className="my-5">
        <Row className="justify-content-center mb-5">
          <Col lg={8}>
            <Card className="p-4 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }}>
              <Card.Body>
                <h2 className="fw-semibold mb-3" style={{color: 'var(--text-primary-dark)'}}>Our Mission</h2>
                <p style={{color: 'var(--text-secondary-dark)', lineHeight: '1.75'}}>
                  {`At SkillForge, our mission is to empower individuals by creating an accessible and dynamic marketplace for skills.
                  We believe that everyone possesses valuable knowledge worth sharing, and everyone has the potential to learn something new.
                  We strive to break down barriers to education and expertise, fostering a global community where learning and teaching
                  are intuitive, engaging, and rewarding.`}
                </p>
                <hr className="my-4" style={{borderColor: 'var(--border-color-dark)'}}/>
                <h2 className="fw-semibold mb-3" style={{color: 'var(--text-primary-dark)'}}>Our Vision</h2>
                <p style={{color: 'var(--text-secondary-dark)', lineHeight: '1.75'}}>
                  {`We envision a world where skills are the currency of growth and connection. SkillForge aims to be the leading platform
                  where individuals can seamlessly transform their passions into professions and their curiosities into capabilities.
                  We are building more than just a platform; we are forging a future where continuous learning and skill-sharing
                  are integral parts of everyday life, enriching individuals and communities alike.`}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="text-center g-4 mb-5">
          <Col md={4}>
            <Card className="h-100 py-4" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }}>
              <Card.Body>
                <div style={{ fontSize: '2.5rem', color: 'var(--accent-color)', marginBottom: '1rem' }}>🌍</div>
                <h4 className="fw-semibold">Global Community</h4>
                <p style={{color: 'var(--text-secondary-dark)', fontSize: '0.95rem'}}>Connect with learners and experts from around the world.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 py-4" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }}>
              <Card.Body>
                <div style={{ fontSize: '2.5rem', color: 'var(--accent-color)', marginBottom: '1rem' }}>💡</div>
                <h4 className="fw-semibold">Diverse Skills</h4>
                <p style={{color: 'var(--text-secondary-dark)', fontSize: '0.95rem'}}>Explore a vast range of categories, from tech to creative arts.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 py-4" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }}>
              <Card.Body>
                <div style={{ fontSize: '2.5rem', color: 'var(--accent-color)', marginBottom: '1rem' }}>🛡️</div>
                <h4 className="fw-semibold">Trusted Platform</h4>
                <p style={{color: 'var(--text-secondary-dark)', fontSize: '0.95rem'}}>We prioritize safety, quality, and a supportive environment.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <div className="text-center">
            <Link href="/skills" passHref>
                <Button variant="primary" size="lg" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
                    Explore Skills Now
                </Button>
            </Link>
        </div>
      </Container>
    </>
  );
};

export default AboutPage; 