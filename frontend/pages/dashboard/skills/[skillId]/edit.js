import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-toastify'; 

const EditSkillPage = () => {
  const router = useRouter();
  const { skillId } = router.query;
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [originalSkillData, setOriginalSkillData] = useState(null);
  
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [keywordError, setKeywordError] = useState('');

  const [error, setError] = useState(''); // For general form error display
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (skillId && user) {
      setPageLoading(true);
      api.get(`/skills/${skillId}`)
        .then(response => {
          const skill = response.data;
          if (skill.userId !== user.id) {
            setError("You are not authorized to edit this skill.");
            toast.error("You are not authorized to edit this skill.");
            setOriginalSkillData(null);
            router.push('/dashboard/my-skills'); // Redirect if not authorized
          } else {
            setTitle(skill.title || '');
            setDescription(skill.description || '');
            setCategory(skill.category || '');
            setPricePerHour(skill.pricePerHour !== null && skill.pricePerHour !== undefined ? String(skill.pricePerHour) : '');
            setOriginalSkillData(skill);
            setError('');
          }
        })
        .catch(err => {
          console.error("Failed to fetch skill for editing:", err);
          const errMsg = err.response?.data?.message || err.message || "Failed to load skill data.";
          setError(errMsg);
          toast.error(errMsg);
          setOriginalSkillData(null);
        })
        .finally(() => setPageLoading(false));
    } else if (!authLoading && !user) {
        setPageLoading(false);
        toast.error("Please log in to edit skills.");
        router.push(`/auth/login?redirect=${router.asPath}`);
    }
  }, [skillId, user, authLoading, router]);


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
    if (!originalSkillData || (user && originalSkillData.userId !== user.id)) {
        setError("Authorization error or skill data missing.");
        toast.error("Authorization error or skill data missing.");
        return;
    }

    setLoading(true);
    setError('');
    try {
      const updatedSkillData = {
        title,
        description,
        category,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null,
      };
      await api.put(`/skills/${skillId}`, updatedSkillData);
      toast.success('Skill updated successfully!');
      router.push('/dashboard/my-skills');
    } catch (err) {
      console.error("Failed to update skill:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to update skill.";
      setError(errMsg);
      toast.error(errMsg);
    }
    setLoading(false);
  };

  if (authLoading || pageLoading) {
    return (
      <Container className="text-center mt-5 d-flex justify-content-center align-items-center" style={{minHeight: '70vh'}}>
        <div>
            <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: 'var(--accent-color)' }}/>
            <p className="mt-3 lead" style={{color: 'var(--text-secondary-dark)'}}>Loading skill editor...</p>
        </div>
      </Container>
    );
  }

  if (error && !originalSkillData) {
    return (
        <Container className="mt-5">
            <Alert variant="danger" className="text-center py-3">{error}</Alert>
            <div className="text-center">
                <Link href="/dashboard/my-skills" passHref>
                    <Button variant="secondary">Back to My Skills</Button>
                </Link>
            </div>
        </Container>
    );
  }
  
  if (!originalSkillData && !pageLoading && !authLoading) { // Ensure not to show if still loading auth
      return (
        <Container className="mt-5">
            <Alert variant="info">Skill data could not be loaded or you are not authorized.</Alert>
            <div className="text-center">
                <Link href="/dashboard/my-skills" passHref>
                    <Button variant="secondary">Back to My Skills</Button>
                </Link>
            </div>
        </Container>
      );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Edit Skill: {originalSkillData?.title || 'Loading...'} | SkillForge</title>
        <meta name="description" content={`Edit the details for your skill: ${originalSkillData?.title}`} />
      </Head>
      <Container className="mt-4 mb-5" style={{ maxWidth: '800px' }}>
        <div className="mb-4 pb-2 text-center" style={{borderBottom: `1px solid var(--border-color-dark)`}}>
            <h1 className="display-6 fw-bold">Edit Your Skill</h1>
            <p style={{color: 'var(--text-secondary-dark)'}}>Update the details for "{originalSkillData?.title || 'this skill'}" below.</p>
        </div>

        <Card className="p-4 p-md-5 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)' }}>
          <Card.Body>
            {error && !loading && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              {/* Form Groups are identical to new.js */}
              <Form.Group className="mb-3" controlId="skillTitle">
                <Form.Label className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>Skill Title <span style={{color: 'var(--accent-color)'}}>*</span></Form.Label>
                <Form.Control
                  type="text"
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

              {/* AI Keyword Suggestion Section */}
              <div className="mb-4">
                <h5 className="fw-medium" style={{color: 'var(--text-primary-dark)'}}>AI Keyword Suggestions</h5>
                <p style={{color: 'var(--text-secondary-dark)', fontSize: '0.9rem'}}>
                  Modify title/description above, then click to get updated keyword suggestions.
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

              <div className="d-flex justify-content-end gap-2">
                <Link href="/dashboard/my-skills" passHref>
                    <Button variant="outline-secondary" disabled={loading} style={{borderColor: 'var(--border-color-dark)', color: 'var(--text-secondary-dark)'}}>
                        Cancel
                    </Button>
                </Link>
                <Button variant="primary" type="submit" disabled={loading} size="lg" className="fw-semibold py-2" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
                    {loading ? <><Spinner as="span" size="sm" animation="border" className="me-2" /> Saving Changes...</> : 'Save Changes'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </ProtectedRoute>
  );
};

export default EditSkillPage;