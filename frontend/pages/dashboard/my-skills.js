import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user && user.id && !authLoading) {
      setLoadingSkills(true);
      api.get(`/skills?userId=${user.id}`)
        .then(response => {
          setSkills(response.data);
          setError('');
        })
        .catch(err => {
          console.error("Failed to fetch user's skills:", err);
          setError(err.response?.data?.message || err.message || 'Failed to load your skills.');
        })
        .finally(() => setLoadingSkills(false));
    } else if (!authLoading) { // If auth is done and still no user.id
        setLoadingSkills(false);
        setSkills([]); // Clear skills if no user
    }
  }, [user, authLoading]);

  if (authLoading || (loadingSkills && !skills.length && !error) ) { 
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
              + Add New Skill
            </Button>
          </Link>
        </div>

        {error && <Alert variant="danger" className="text-center py-3">{error}</Alert>}
        
        {!loadingSkills && skills.length === 0 && !error && (
          <Alert variant="secondary" className="text-center py-4" style={{backgroundColor: 'var(--bg-secondary-dark)', borderColor: 'var(--border-color-dark)'}}>
            <h4>No Skills Yet!</h4>
            <p style={{color: 'var(--text-secondary-dark)'}}>You haven't created any skills to share. Why not add your first one now?</p>
            <Link href="/dashboard/skills/new" passHref>
              <Button variant="primary" style={{backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)'}}>Create Your First Skill</Button>
            </Link>
          </Alert>
        )}

        <Row xs={1} md={2} lg={3} className="g-4">
          {skills.map((skill) => (
            <Col key={skill.id}>
              <div className="h-100 d-flex flex-column"> {/* Wrapper for flex behavior */}
                <SkillCard skill={skill} />
                <div className="mt-2 d-flex justify-content-end gap-2 p-2" style={{backgroundColor: 'var(--bg-secondary-dark)', border: `1px solid var(--border-color-dark)`, borderTop: 'none', borderBottomLeftRadius: '0.375rem', borderBottomRightRadius: '0.375rem'}}>
                    <Link href={`/dashboard/skills/${skill.id}/edit`} passHref>
                        <Button variant="outline-info" size="sm" style={{borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}}>
                            {/* Add Icon later: <FaEdit /> */} Edit
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