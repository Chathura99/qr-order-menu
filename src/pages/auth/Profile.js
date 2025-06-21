import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import directusClient from '../../api/directusClient';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { t } = useTranslation(); // Initialize the translation hook
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await directusClient.get('/users/me');
        setUser(response.data.data);
        setFormData({
          first_name: response.data.data.first_name,
          last_name: response.data.data.last_name,
          email: response.data.data.email,
        });
        setError(null);
      } catch (err) {
        navigate("/login");
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditClick = () => setIsEditing(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await directusClient.patch('/users/me', formData);
      setUser((prevUser) => ({ ...prevUser, ...formData }));
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  const userRole = localStorage.getItem('user_role') || 'guest';


  return (
    <Container fluid>
      <Row>
        <Col md={2} className="p-3">
          <Sidebar role={userRole} />
        </Col>
        <Col md={10} className="p-3">
          <div className="p-4 border rounded bg-white shadow-sm">
            <h1 className="text-center mb-4">{t('profile.title')}</h1>
            {user && !isEditing ? (
              <div>
                <p><strong>{t('profile.firstName')}:</strong> {user.first_name}</p>
                <p><strong>{t('profile.lastName')}:</strong> {user.last_name}</p>
                <p><strong>{t('profile.email')}:</strong> {user.email}</p>
                <Button variant="primary" onClick={handleEditClick}>{t('profile.edit')}</Button>
              </div>
            ) : (
              <Form onSubmit={handleSave}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('profile.firstName')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('profile.lastName')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('profile.email')}</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? `${t('profile.save')}...` : t('profile.save')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  className="ms-2"
                >
                  {t('profile.cancel')}
                </Button>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
