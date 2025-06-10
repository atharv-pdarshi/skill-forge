import React, { useState, useEffect, useCallback } from 'react'; 
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import SkillCard from '../../components/SkillCard';
import { Container, Row, Col, Alert, Spinner, Button } from 'react-bootstrap';
import Head from 'next/head';
import Link from 'next/link';

const MySkillsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [error, setError] = useState('');

  const fetchUserSkills = useCallback(async () => { // Wrapped in useCallback
    if (!user || !user.id) { // Ensure user and user.id exist
        setSkills([]); // Clear skills if no user
        setLoadingSkills(false);
        return;
    }
    setLoadingSkills(true);
    setError('');
    try {
      const response = await api.get(`/skills?userId=${user.id}`);
      setSkills(response.data);
    } catch (err) {
      console.error("Failed to fetch user's skills:", err);
      setError(err.response?.data?.message || err.message || 'Failed to load your skills.');
      setSkills([]); // Clear skills on error
    }
    setLoadingSkills(false);
  }, [user]); // Depends on user object

  useEffect(() => {
    if (!authLoading) { // Only proceed if auth check is complete
        fetchUserSkills();
    }
  }, [user, authLoading, fetchUserSkills]); // Add fetchUserSkills and authLoading

  if (authLoading || loadingSkills) { // Simplified loading condition
    return (
      <Container className="text-center mt-5 d-flex justify-content-center align-items-center" style={{minHeight: '70vh'}}>
        <div>
          <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: 'var(--accent-color)' }}/>
          <p className="mt-3 lead" style={{color: 'var(--text-secondary-dark)'}}>Loading your skills...</p>
        </div>
      </Container>
    );
  }
  
  return (
    <ProtectedRoute>
      <Head>
        <title>My Created Skills | SkillForge</title>
        <meta name="description" content="Manage the skills you offer on SkillForge." />
      </Head>
      <Container className="mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2" style={{borderBottom: `1px solid var(--border-color-dark)`}}>
          <h1 className="display-6 fw-bold">My Created Skills</h1>
          <Link href="/dashboard/skills/new" passHref>
            <Button variant="primary" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>
              {/* <FaPlus className="me-2" /> */}
              + Add New Skill
            </Button>
          </Link>
        </div>

        {error && <Alert variant="danger" className="text-center py-3">{error}</Alert>}
        
        {!loadingSkills && skills.length === 0 && !error && (
          <Alert variant="secondary" className="text-center py-4" style={{backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)'}}>
            <h4>No Skills Yet!</h4>
            <p style={{color: 'var(--text-secondary-dark)'}}>{`You haven't created any skills to share. Why not add your first one now?`}</p>
            <Link href="/dashboard/skills/new" passHref>
              <Button variant="primary" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>Create Your First Skill</Button>
            </Link>
          </Alert>
        )}

        <Row xs={1} md={2} lg={3} className="g-4">
          {skills.map((skill) => (
            <Col key={skill.id}>
              <div className="h-100 d-flex flex-column" style={{backgroundColor: 'var(--bg-secondary-dark)', borderRadius: '0.375rem', border: `1px solid var(--border-color-dark)`, overflow: 'hidden'}}>
                <SkillCard skill={skill} /> {/* SkillCard itself will have padding and its own card structure */}
                <div className="d-flex justify-content-end gap-2 p-3" style={{borderTop: `1px solid var(--border-color-dark)`}}>
                    <Link href={`/dashboard/skills/${skill.id}/edit`} passHref>
                        <Button variant="outline-info" size="sm" style={{borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}}>
                            {/* <FaEdit className="me-1" /> */} Edit
                        </Button>
                    </Link>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </ProtectedRoute>
  );
};

export default MySkillsPage;