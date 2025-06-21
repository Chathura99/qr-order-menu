import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import directusClient from "../../api/directusClient";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { ROLE_ADMIN, ROLE_OFFICER } from "../../api/roles";
import styled from "styled-components";
import loginbg from "../../images/loginbg.png"

// Styled components for consistency and modern design
const LoginContainer = styled(Container)`
  height: 85vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginRow = styled(Row)`
  width: 100%;
  max-width: 900px; // Adjust width as needed
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
`;

const ImageWrapper = styled.div`
  background: url(${loginbg}) no-repeat center center;
  background-size: cover;
  width: 50%;
  border-radius: 10px 0 0 10px;
`;

const FormCol = styled(Col)`
  background-color: #ffffff;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const LoginTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #0056b3;
  margin-bottom: 20px;
`;

const CustomButton = styled(Button)`
  background-color: #007bff;
  border: none;
  margin-top: 10px;
  &:hover {
    background-color: #0056b3;
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await directusClient.post("/auth/login", {
        email,
        password,
      });
      const { access_token } = response.data.data;

      localStorage.setItem("access_token", access_token);
      directusClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;

      const userResponse = await directusClient.get("/users/me");
      const user = userResponse.data.data;
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("name", user.first_name + " " + user.last_name);

      const userRole = localStorage.getItem("user_role") || "guest";
      if (userRole === ROLE_ADMIN) {
        navigate("/dashboard");
      } else if (userRole === ROLE_OFFICER) {
        navigate("/orders");
      }
    } catch (err) {
      setError(t("login.error"));
    }
  };

  // const handleGoHome = () => {
  //   navigate("/"); // Navigate to home page
  // };

  return (
    <>
    <LoginContainer>
      <LoginRow>
        <ImageWrapper />
        <FormCol md={6}>
        <LoginTitle>ROUTE TRACKING SYSTEM - Login</LoginTitle>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>{t("login.email")}</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder")}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t("login.password")}</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                required
              />
            </Form.Group>
            <CustomButton type="submit" className="w-100 mb-2">
              {t("login.submit")}
            </CustomButton>
            {/* <Button variant="secondary" onClick={handleGoHome} className="w-100">
              {t("login.goHome")}
            </Button> */}
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Form>
        </FormCol>
      </LoginRow>
      
    </LoginContainer>
     {/* Footer */}
     <div
     className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5"
     style={{ backgroundColor: "#1976d2" }}
   >
     <div className="text-white mb-3 mb-md-0">
       <strong>ROUTE TRACKING SYSTEM</strong>
       <br />
       <em>Effortlessly track and manage your vehicle routes.</em>
       <br />
       METADEW TECHNOLOGIES | 071 733 6065 | Copyright © 2024. All rights
       reserved.
     </div>
   </div>
   </>

  );
};

export default Login;
