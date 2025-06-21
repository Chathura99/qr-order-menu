import React from "react";
import { Container, Row, Col, ListGroup, Alert } from "react-bootstrap";
import Sidebar from "../../components/Sidebar";

const dummySubjects = [
  { id: 1, subject_name: "Report 1" },
  { id: 2, subject_name: "Report" },
  { id: 3, subject_name: "Report" },
  { id: 4, subject_name: "Report" },
  { id: 5, subject_name: "Report" },
];

const Reports = () => {
  const userRole = localStorage.getItem("user_role") || "guest"; // Default role
  const comingSoon = true; // Set coming_soon to true or false dynamically as needed

  // Replace useFetch with dummy data
  const subjects = dummySubjects;
  const loading = false; // No longer loading data
  const error = null; // No error since no network call

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="p-3">
          <Sidebar role={userRole} /> {/* Include Sidebar */}
        </Col>
        <Col md={10} className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Reports</h1>
          </div>

          {comingSoon ? (
            <div className="text-center mt-5">
              <Alert variant="warning" className="text-center">
                Coming Soon!
              </Alert>
              <p>This feature will be available shortly. Stay tuned!</p>
            </div>
          ) : (
            <ListGroup>
              {subjects.map((subject) => (
                <ListGroup.Item key={subject.id}>
                  {subject.subject_name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
