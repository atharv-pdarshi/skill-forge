// frontend/pages/skills/index.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SkillCard from '../../components/SkillCard';
import { Container, Row, Col, Alert, Spinner, Form, InputGroup, Button, Card } from 'react-bootstrap'; // Added Card
import Head from 'next/head';

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const fetchSkills = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);

      const response = await api.get(`/skills?${params.toString()}`);
      setSkills(response.data);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch skills.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSkills();
  }, []); 

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSkills();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    // Reset other filters here too
    fetchSkills();
  }

  return (
    <>
      <Head>
        <title>Explore Skills | SkillForge</title>
        <meta name="description" content="Discover a wide array of skills offered by talented individuals on SkillForge. Find your next learning adventure or share your expertise." />
      </Head>
      <Container className="mt-4 mb-5"> 
        <div className="text-center mb-5">
            <h1 className="display-5 fw-bold">Discover Your Next <span style={{color: 'var(--accent-color)'}}>Skill</span></h1>
            <p className="lead" style={{color: 'var(--text-secondary-dark)'}}>
                Browse through our diverse catalog. Use the filters below to narrow down your search.
            </p>
        </div>

        <Card className="p-4 mb-5 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }}>
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={5}>
                <Form.Group controlId="searchTerm">
                  <Form.Label>Search by Keyword</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Python, Guitar, Cooking"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="categoryFilter">
                  <Form.Label>Filter by Category</Form.Label>
                  <Form.Control 
                    type="text"
                    placeholder="e.g., Technology, Music, Arts"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex gap-2">
                <Button type="submit" variant="primary" className="w-100" disabled={loading} style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
                  {loading && skills.length > 0 ? <Spinner as="span" size="sm" animation="border" /> : 'Filter'}
                </Button>
                <Button type="button" variant="outline-secondary" className="w-100" onClick={handleClearFilters} disabled={loading}>
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {loading && skills.length === 0 ? ( // Initial loading state
          <div className="text-center py-5">
            <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: 'var(--accent-color)'}} />
            <p className="mt-3" style={{color: 'var(--text-secondary-dark)'}}>Loading available skills...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">{error}</Alert>
        ) : skills.length === 0 ? (
          <Alert variant="info" className="text-center">
            <h4>No Skills Found</h4>
            <p>No skills currently match your search criteria. Try adjusting your filters or <Button variant="link" onClick={handleClearFilters} className="p-0 align-baseline">clearing them</Button> to see all available skills.</p>
          </Alert>
        ) : (
          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {skills.map((skill) => (
              <Col key={skill.id}>
                <SkillCard skill={skill} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default SkillsPage;