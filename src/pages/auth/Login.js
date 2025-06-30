import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import directusClient from "../../api/directusClient";
import { Container, Row, Col, Form, Button, Alert, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { ROLE_CUSTOMER, ROLE_SUPER_ADMIN, ROLE_RES_ADMIN } from "../../api/roles";
import styled from "styled-components";
import loginbg from "../../images/loginbg.png";
import { FaUser, FaLock } from "react-icons/fa";

// Container with full viewport height, background color, and flex center
const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  background: #fff;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

// Card with shadow, rounded corners, and responsive width
const Card = styled.div`
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media(min-width: 768px) {
    flex-direction: row;
    max-width: 800px;
  }
`;

// Left side image, hidden on small screens
const LeftImage = styled.div`
  flex: 1;
  background: url(${loginbg}) center center/cover no-repeat;
  display: none;
  
  @media(min-width: 768px) {
    display: block;
  }
`;

// Right side form container
const FormContainer = styled.div`
  flex: 1;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

// Title styled
const Title = styled.h2`
  color: #FFA439;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
`;

// Styled submit button
const SubmitButton = styled(Button)`
  background-color: #FFA439;
  border: none;
  font-weight: 600;
  padding: 10px 0;
  margin-top: 15px;

  &:hover, &:focus {
    background-color: #e68a21;
  }
`;

// Footer container
const Footer = styled.footer`
  margin-top: 30px;
  text-align: center;
  color: #FFA439;
  font-weight: 500;
  font-size: 0.9rem;
`;

// Input group icon wrapper
const IconWrapper = styled(InputGroup.Text)`
  background-color: #fff;
  border-right: 0;
  color: #FFA439;
  font-size: 1.1rem;
  border-radius: 0.375rem 0 0 0.375rem;
  border: 1px solid #ced4da;
`;

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await directusClient.post("/auth/login", { email, password });
      const { access_token } = response.data.data;

      localStorage.setItem("access_token", access_token);
      directusClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      const userResponse = await directusClient.get("/users/me");
      const user = userResponse.data.data;
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("name", user.first_name + " " + user.last_name);

      const userRole = localStorage.getItem("user_role") || "guest";
      if (userRole === ROLE_SUPER_ADMIN || userRole === ROLE_RES_ADMIN) {
        navigate("/dashboard");
      } else if (userRole === ROLE_CUSTOMER) {
        navigate("/orders");
      }
    } catch (err) {
      setError(t("login.error"));
    }
  };

  return (
    <PageWrapper>
      <Card>
        <LeftImage />
        <FormContainer>
          <Title>QR-Order Menu SYSTEM</Title>
          <Form onSubmit={handleLogin} noValidate>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label className="visually-hidden">{t("login.email")}</Form.Label>
              <InputGroup>
                <IconWrapper>
                  <FaUser />
                </IconWrapper>
                <Form.Control
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-describedby="email-icon"
                  autoComplete="username"
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label className="visually-hidden">{t("login.password")}</Form.Label>
              <InputGroup>
                <IconWrapper>
                  <FaLock />
                </IconWrapper>
                <Form.Control
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-describedby="password-icon"
                  autoComplete="current-password"
                />
              </InputGroup>
            </Form.Group>

            <SubmitButton type="submit" size="lg" className="w-100">
              {t("login.submit")}
            </SubmitButton>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Form>

          <Footer>
            <strong>QR-Order Menu SYSTEM</strong> &nbsp;|&nbsp; ck-solutions <br />
            0702534588 | &copy; 2024. All rights reserved.
          </Footer>
        </FormContainer>
      </Card>
    </PageWrapper>
  );
};

export default Login;
