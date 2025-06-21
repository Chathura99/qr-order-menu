import React from 'react';
import useFetch from '../../hooks/useFetch';
import { USERS_ENDPOINT } from '../../api/endpoints';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';
import Sidebar from '../../components/Sidebar';

const Users = () => {
  const { data: users, loading, error } = useFetch(USERS_ENDPOINT);

  // Assume role is retrieved from localStorage or another state
  const userRole = localStorage.getItem('user_role') || 'guest'; // Default to 'admin' if role not found

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
            <h1>Users</h1>
          </div>
          <ListGroup>
            {users.map((user) => (
              <ListGroup.Item key={user.id}>
                {user.first_name + " " + user.last_name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default Users;
