import React from 'react';
import { Card, Button } from 'react-bootstrap';
import Link from 'next/link';

const SkillCard = ({ skill }) => {
  if (!skill) {
    return null;
  }

  return (
    <Card className="mb-3 h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>{skill.title || 'Untitled Skill'}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Category: {skill.category || 'N/A'}
        </Card.Subtitle>
        <Card.Text style={{ flexGrow: 1 }}> {/* flexGrow to push button to bottom */}
          {skill.description
            ? (skill.description.length > 100 ? `${skill.description.substring(0, 97)}...` : skill.description)
            : 'No description available.'}
        </Card.Text>
        <Card.Text>
          Price: {skill.pricePerHour ? `$${skill.pricePerHour.toFixed(2)}/hr` : 'Not specified'}
        </Card.Text>
        {skill.user && ( // Display provider name if available
          <Card.Text className="text-muted small">
            Provider: {skill.user.name || skill.user.email}
          </Card.Text>
        )}
        <Link href={`/skills/${skill.id}`} passHref legacyBehavior>
          <Button variant="primary" className="mt-auto">View Details</Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

export default SkillCard;