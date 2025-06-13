import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { 
  FaLightbulb, FaCode, FaPalette, FaMusic, 
  FaComments, FaChalkboardTeacher, FaUsers, FaStar, FaRetweet 
} from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const getFeaturedIcon = (index) => { 
  const icons = [
    <FaCode key="code" />, 
    <FaPalette key="palette" />, 
    <FaMusic key="music" />,
  ];
  return icons[index % icons.length];
};

export default function Home() {
  const [featuredSkills, setFeaturedSkills] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [errorFeatured, setErrorFeatured] = useState('');

  useEffect(() => {
    const fetchFeaturedSkills = async () => {
      setLoadingFeatured(true);
      setErrorFeatured('');
      try {
        const response = await api.get('/skills?limit=3&sortBy=createdAt&sortOrder=desc');
        setFeaturedSkills(response.data);
      } catch (err) {
        console.error("Failed to fetch featured skills:", err);
        setErrorFeatured("Could not load featured skills at this time. Please try again later.");
      }
      setLoadingFeatured(false);
    };

    fetchFeaturedSkills();
  }, []);

  return (
    <>
      <Head>
        <title>{`SkillForge - Share Your Passion, Discover Your Potential`}</title>
        <meta name="description" content={`SkillForge is the ultimate platform to learn new skills from experts or share your own knowledge with an eager community. Explore, teach, connect, and grow.`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <div className="text-light text-center py-5" style={{ backgroundColor: 'var(--bg-primary-dark)', borderBottom: '1px solid var(--border-color-dark)'}}>
        <Container style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
          <h1 className="display-3 fw-bolder mb-3">
            {`Ignite Your Passion.`} <span style={{ color: 'var(--accent-color)'}}>Forge</span> {`Your Future.`}
          </h1>
          <p className="lead col-lg-8 mx-auto mb-4" style={{color: 'var(--text-secondary-dark)'}}>
            {`Welcome to SkillForge – the premier community marketplace where knowledge seekers connect with passionate experts. Whether you're looking to master a new skill or share your unique talents, your journey starts here.`}
          </p>
          <div>
            <Link href="/skills" passHref>
              <Button variant="primary" size="lg" className="me-sm-3 mb-2 mb-sm-0" style={{minWidth: '180px', backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
                {`Explore Skills`}
              </Button>
            </Link>
            <Link href="/auth/register" passHref>
              <Button variant="outline-light" size="lg" style={{minWidth: '180px', borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}}>
                {`Share Your Skills`}
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      {/* What Can You Do? Section */}
      <Container className="py-5">
        <h2 className="text-center mb-5 display-5 fw-bold">{`What Will You `}<span style={{ color: 'var(--accent-color)'}}>{`Forge`}</span>{` Today?`}</h2>
        <Row className="text-center g-4">
          <Col md={4}>
            <Card style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }} className="h-100 shadow">
              <Card.Body className="d-flex flex-column p-4">
                <div style={{ fontSize: '3rem', color: 'var(--accent-color)', marginBottom: '1rem' }}><FaLightbulb /></div>
                <Card.Title as="h3" className="fw-semibold">{`Discover & Learn`}</Card.Title>
                <Card.Text style={{color: 'var(--text-secondary-dark)', flexGrow: 1}}>
                  {`Dive into a diverse catalog of skills taught by passionate individuals. From tech to arts, find your next learning adventure.`}
                </Card.Text>
                <Link href="/skills" passHref>
                    <Button variant="outline-primary" className="mt-auto custom-accent-outline-btn">{`Browse All Skills`}</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }} className="h-100 shadow">
              <Card.Body className="d-flex flex-column p-4">
                <div style={{ fontSize: '3rem', color: 'var(--accent-color)', marginBottom: '1rem' }}><FaChalkboardTeacher /></div>
                <Card.Title as="h3" className="fw-semibold">{`Share & Teach`}</Card.Title>
                <Card.Text style={{color: 'var(--text-secondary-dark)', flexGrow: 1}}>
                  {`Have a skill you're proud of? Become a provider, create listings, manage bookings, and earn by sharing your expertise.`}
                </Card.Text>
                 <Link href="/auth/register" passHref>
                    <Button variant="outline-primary" className="mt-auto custom-accent-outline-btn">{`Become a Provider`}</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }} className="h-100 shadow">
              <Card.Body className="d-flex flex-column p-4">
                <div style={{ fontSize: '3rem', color: 'var(--accent-color)', marginBottom: '1rem' }}><FaUsers /></div>
                <Card.Title as="h3" className="fw-semibold">{`Connect & Grow`}</Card.Title>
                <Card.Text style={{color: 'var(--text-secondary-dark)', flexGrow: 1}}>
                  {`Join a vibrant community. Interact through bookings, leave reviews, and build your network of learners and experts.`}
                </Card.Text>
                 <Link href="/auth/login" passHref>
                    <Button variant="outline-primary" className="mt-auto custom-accent-outline-btn">{`Join the Community`}</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Featured Skills Section (Now Dynamic) */}
      <div style={{ backgroundColor: 'var(--bg-secondary-dark)', paddingBlock: '4rem', borderTop: '1px solid var(--border-color-dark)', borderBottom: '1px solid var(--border-color-dark)'}}>
        <Container>
          <h2 className="text-center mb-5 display-5 fw-bold">
            {`Freshly `}<span style={{ color: 'var(--accent-color)'}}>{`Forged`}</span>{` Skills`}
          </h2>
          {loadingFeatured ? (
            <div className="text-center">
              <Spinner animation="border" style={{color: 'var(--accent-color)', width: '3rem', height: '3rem'}}/>
              <p style={{color: 'var(--text-secondary-dark)'}} className="mt-3 lead">{`Loading exciting skills...`}</p>
            </div>
          ) : errorFeatured ? (
            <Alert variant="warning" className="text-center py-3">{errorFeatured}</Alert>
          ) : featuredSkills.length > 0 ? (
            <Row className="g-4 text-center">
              {featuredSkills.map((skill, index) => (
                <Col md={4} key={skill.id}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body className="d-flex flex-column p-4">
                      <div style={{ fontSize: '3.5rem', color: 'var(--accent-color)', marginBottom: '1.5rem', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getFeaturedIcon(index)}
                      </div>
                      <Card.Title as="h4" className="fw-semibold" style={{minHeight: '3.5em'}}>
                        {skill.title}
                      </Card.Title>
                      <Card.Text style={{color: 'var(--text-secondary-dark)', flexGrow: 1, fontSize: '0.95rem', minHeight: '5em'}}>
                        {skill.description 
                          ? (skill.description.length > 100 ? `${skill.description.substring(0, 97)}...` : skill.description)
                          : `An exciting new skill offered by our community! Click to learn more.`}
                      </Card.Text>
                      <Link href={`/skills/${skill.id}`} passHref>
                          <Button variant="primary" className="mt-auto w-100" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
                              {`Learn More`}
                          </Button>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-3">
                <p className="lead" style={{color: 'var(--text-secondary-dark)'}}>{`No featured skills available at the moment. `}<br/>{` Check back soon or explore all available skills!`}</p>
            </div>
          )}
          <div className="text-center mt-5">
            <Link href="/skills" passHref>
              <Button variant="outline-light" size="lg" style={{borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}}>
                {`View All Skills`}
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      {/* Why SkillForge? Section */}
      <Container className="py-5 text-center">
        <h2 className="mb-5 display-5 fw-bold">{`Why Choose `}<span style={{ color: 'var(--accent-color)'}}>{`SkillForge`}</span>{`?`}</h2>
        <Row className="g-4">
          <Col md={4}>
            <div className="p-3">
              <div style={{ fontSize: '2.5rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }}><FaStar /></div>
              <h4 className="fw-semibold">{`Quality Content`}</h4>
              <p style={{color: 'var(--text-secondary-dark)'}}>{`Learn from vetted experts and passionate individuals dedicated to sharing their best.`}</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3">
              <div style={{ fontSize: '2.5rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }}><FaRetweet /></div>
              <h4 className="fw-semibold">{`Flexible Learning`}</h4>
              <p style={{color: 'var(--text-secondary-dark)'}}>{`Book sessions that fit your schedule. Learn at your own pace, anytime, anywhere.`}</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3">
              <div style={{ fontSize: '2.5rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }}><FaComments /></div>
              <h4 className="fw-semibold">{`Community Driven`}</h4>
              <p style={{color: 'var(--text-secondary-dark)'}}>{`Join a supportive network, get feedback, and connect with like-minded individuals.`}</p>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}