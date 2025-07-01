import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import directusClient from "../../api/directusClient";
import { Form, Button, Alert, InputGroup, Spinner } from "react-bootstrap"; // Removed Container, Row, Col as they are not needed with single column Card
import { useTranslation } from "react-i18next";
import { ROLE_CUSTOMER, ROLE_SUPER_ADMIN, ROLE_RES_ADMIN } from "../../api/roles";
import styled from "styled-components";
import logoIcon from "../../images/logo.png"; // Assuming a smaller logo icon for the top of the form
import { FaUser, FaLock } from "react-icons/fa"; // Ensure react-icons is installed

// --- Styled Components ---

// Page Wrapper: Full viewport height, centered content, clean background
const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa; /* Consistent light background from QRCodePage */
  font-family: 'Poppins', sans-serif; /* Consistent font */
`;

// Card: Main container for login form, with shadow, rounded corners, and responsive width
const Card = styled.div`
  max-width: 450px; /* Max-width for the single column card */
  width: 100%;
  background: #fff;
  border-radius: 20px; /* More rounded corners */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15); /* Stronger, softer shadow */
  overflow: hidden;
  display: flex;
  flex-direction: column; /* Always column as it's a single panel */
  align-items: center; /* Center content within the card */
  padding: 40px 35px; /* Padding for the content inside the card */

  @media(max-width: 768px) {
    padding: 30px 25px; /* Adjusted padding for mobile */
    border-radius: 15px; /* Slightly less rounded on mobile */
  }
`;

// Logo at the top of the form
const FormLogo = styled.img`
  width: 100px; /* Size of the logo */
  height: 100px;
  object-fit: contain;
  margin-bottom: 2rem; /* Space below the logo */
`;

// Title: Styling for the main login title
const Title = styled.h2`
  color: #ff8c00; /* Consistent orange color */
  font-family: 'Montserrat', sans-serif; /* Bolder font for titles */
  font-weight: 800; /* Extra bold */
  margin-bottom: 2.5rem; /* More space below title */
  font-size: 2.2rem; /* Larger font size */
  text-align: center; /* Ensure title is centered */
  line-height: 1.2;

  @media(max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 2rem;
  }
`;

// Submit Button: Primary button styling
const SubmitButton = styled(Button)`
  background: linear-gradient(to right, #ff8c00, #ffa500); /* Orange gradient */
  border: none;
  font-weight: 700; /* Bolder font */
  padding: 14px 0; /* More padding */
  margin-top: 25px; /* More space above button */
  border-radius: 10px; /* Rounded corners */
  font-size: 1.1rem; /* Larger font size */
  box-shadow: 0 4px 12px rgba(255, 140, 0, 0.25); /* Subtle shadow */
  transition: all 0.3s ease;

  &:hover, &:focus {
    background: linear-gradient(to right, #e07b00, #e68a21); /* Darker gradient on hover */
    box-shadow: 0 6px 18px rgba(255, 140, 0, 0.35); /* More pronounced shadow */
    transform: translateY(-2px); /* Slight lift */
    border: none; /* Ensure no border appears on hover/focus */
  }

  &:active {
    transform: translateY(0); /* Press down effect */
    box-shadow: 0 2px 8px rgba(255, 140, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #ffc107; /* Lighter orange when disabled */
    box-shadow: none;
    transform: none;
  }
`;

// Footer: Styling for the copyright/info footer
const Footer = styled.footer`
  margin-top: 40px; /* More space above footer */
  text-align: center;
  color: #6c757d; /* Muted grey color */
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1.5;

  strong {
    color: #495057; /* Darker grey for strong text */
  }
`;

// Icon Wrapper for InputGroup: Consistent with form-control-custom
const IconWrapper = styled(InputGroup.Text)`
  background-color: #f8f9fa; /* Slightly off-white background for icon */
  border-right: 0;
  color: #ff8c00; /* Orange icon color */
  font-size: 1.2rem; /* Slightly larger icon */
  border-radius: 10px 0 0 10px; /* Match input border-radius */
  border: 1px solid #ced4da; /* Match input border */
  padding: 12px 15px; /* Match input padding */
  height: auto; /* Allow height to adjust */
`;

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for button

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true); // Set loading true on submission
    try {
      const response = await directusClient.post("/auth/login", { email, password });
      const { access_token } = response.data.data;

      localStorage.setItem("access_token", access_token);
      directusClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      const userResponse = await directusClient.get("/users/me");
      const user = userResponse.data.data;
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("name", user.first_name + " " + user.last_name);

      const userRole = user.role || "guest"; // Use user.role directly
      if (userRole === ROLE_SUPER_ADMIN || userRole === ROLE_RES_ADMIN) {
        navigate("/dashboard");
      } else if (userRole === ROLE_CUSTOMER) {
        navigate("/orders");
      } else {
        // Handle other roles or default to a safe page
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(t("login.error")); // Use translation for error message
    } finally {
      setLoading(false); // Set loading false after completion
    }
  };

  return (
    <PageWrapper>
      <Card>
        <FormLogo src={logoIcon} alt="QR-Order Menu Logo" /> {/* New Logo component */}
        <Title>QR-Order Menu SYSTEM</Title>
        <Form onSubmit={handleLogin} noValidate className="w-100"> {/* Ensure form takes full width */}
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label className="visually-hidden">{t("login.email")}</Form.Label>
            <InputGroup className="input-group-custom"> {/* Add custom class */}
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
                className="form-control-custom" /* Apply custom input style */
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="visually-hidden">{t("login.password")}</Form.Label>
            <InputGroup className="input-group-custom"> {/* Add custom class */}
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
                className="form-control-custom" /* Apply custom input style */
              />
            </InputGroup>
          </Form.Group>

          <SubmitButton type="submit" size="lg" className="w-100" disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Logging in...</span>
              </>
            ) : (
              t("login.submit")
            )}
          </SubmitButton>

          {error && <Alert variant="danger" className="mt-3 login-alert">{error}</Alert>}
        </Form>

        <Footer>
          <strong>QR-Order Menu SYSTEM</strong> &nbsp;|&nbsp; IT Solutions <br />
          0702534588 | &copy; 2024. All rights reserved.
        </Footer>
      </Card>
    </PageWrapper>
  );
};

export default Login;
