import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');  // Navigate to the home page
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100">
        <Col md={8} lg={6} xl={4} className="mx-auto text-center">
          <div className="p-4 border rounded bg-white shadow-sm">
            <h1 className="mb-4">404 - Not Found</h1>
            <p className="mb-4">The page you are looking for does not exist.</p>
            <Button variant="primary" onClick={handleHomeClick} className="w-100">
              Go to Home
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
