import React, { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import Head from 'next/head';
import { toast } from 'react-toastify'; 

const NewSkillPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [keywordError, setKeywordError] = useState('');

  const [error, setError] = useState(''); // For general form error display
  const [loading, setLoading] = useState(false);

  const handleSuggestKeywords = async () => {
    if (!title && !description) {
      setKeywordError("Please enter a title or description to get suggestions.");
      toast.warn("Please enter a title or description to get suggestions.");
      return;
    }
    setLoadingKeywords(true);
    setKeywordError('');
    setSuggestedKeywords([]);
    try {
      const response = await api.post('/ai/suggest-keywords', { title, description });
      setSuggestedKeywords(response.data.suggestedKeywords || []);
      if ((response.data.suggestedKeywords || []).length > 0) {
        toast.info("AI keywords suggested!");
      } else {
        toast.info("AI couldn't find specific keywords, try refining your input.");
      }
    } catch (err) {
      console.error("Failed to suggest keywords:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to get keyword suggestions.";
      setKeywordError(errMsg);
      toast.error(errMsg);
    }
    setLoadingKeywords(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      setError("Title is required.");
      toast.error("Title is required.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const skillData = {
        title,
        description,
        category,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null,
      };
      await api.post('/skills', skillData);
      toast.success('Skill created successfully!');
      router.push('/dashboard/my-skills');
    } catch (err) {
      console.error("Failed to create skill:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to create skill.";
      setError(errMsg); // Set local error for Alert display
      toast.error(errMsg); 
    }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Add New Skill | SkillForge</title>
        <meta name="description" content="Share your expertise by adding a new skill to the SkillForge platform." />
      </Head>
      <Container className="mt-4 mb-5" style={{ maxWidth: '800px' }}>
        <div className="mb-4 pb-2 text-center" style={{borderBottom: `1px solid var(--border-color-dark)`}}>
            <h1 className="display-6 fw-bold">Share Your Expertise</h1>
            <p style={{color: 'var(--text-secondary-dark)'}}>Fill out the details below to list your new skill on SkillForge.</p>
        </div>

        <Card className="p-4 p-md-5 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }}>
          <Card.Body>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="skillTitle">
                <Form.Label className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>Skill Title <span style={{color: 'var(--accent-color)'}}>*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Advanced Web Development with React"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="skillDescription">
                <Form.Label className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Provide a detailed description of what this skill entails, what learners will achieve, and any prerequisites."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="skillCategory">
                    <Form.Label className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>Category</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Technology, Arts, Business"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="skillPrice">
                    <Form.Label className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>Price Per Hour ($)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 25.50 (Optional)"
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                      step="0.01"
                      min="0"
                      style={{backgroundColor: 'var(--bg-primary-dark)', color: 'var(--text-primary-dark)', borderColor: 'var(--border-color-dark)'}}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <hr className="my-4" style={{borderColor: 'var(--border-color-dark)'}}/>

              <div className="mb-4">
                <h5 className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>AI Keyword Suggestions</h5>
                <p style={{color: 'var(--text-secondary-dark)', fontSize: '0.9rem'}}>
                  Enter a title and/or description above, then click below to get AI-powered keyword suggestions.
                </p>
                <Button 
                  variant="outline-info" 
                  onClick={handleSuggestKeywords} 
                  disabled={loadingKeywords || (!title && !description)}
                  size="sm"
                  style={{borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}}
                >
                  {loadingKeywords ? <><Spinner as="span" size="sm" animation="border" className="me-1" /> Suggesting...</> : 'Suggest Keywords'}
                </Button>
                {keywordError && <Alert variant="warning" className="mt-2 py-1 px-2 text-small">{keywordError}</Alert>}
                {suggestedKeywords.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1" style={{color: 'var(--text-secondary-dark)'}}>Suggested Keywords:</p>
                    <div>
                      {suggestedKeywords.map((keyword, index) => (
                        <Badge pill key={index} className="me-1 mb-1 p-2" style={{backgroundColor: 'var(--border-color-dark)', color: 'var(--text-primary-dark)'}}>
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <hr className="my-4" style={{borderColor: 'var(--border-color-dark)'}}/>

              <Button variant="primary" type="submit" disabled={loading} size="lg" className="w-100 fw-semibold py-2" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
                {loading ? <><Spinner as="span" size="sm" animation="border" className="me-2" /> Creating Skill...</> : 'Create Skill'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </ProtectedRoute>
  );
};

export default NewSkillPage;