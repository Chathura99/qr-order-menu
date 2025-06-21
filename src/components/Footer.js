import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterWrapper = styled.footer`
  background-color: #3A88C8; /* Dark blue background */
  color: white;
  padding: 40px 0;
`;

const FooterHeading = styled.h5`
  color: white;
  font-weight: bold;
  margin-bottom: 15px;
`;

const FooterLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin-bottom: 8px;
  display: block;

  &:hover {
    text-decoration: underline;
    color: #d1e7ff; /* Light blue on hover */
  }
`;

const FooterText = styled.p`
  color: white;
  font-size: 14px;
`;

const SocialIcons = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 10px 0;
`;

const Icon = styled.a`
  color: white;
  margin-right: 15px;

  &:hover {
    color: #d1e7ff; /* Light blue on hover */
  }
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <Container>
        <Row>
          {/* Column 1: About Us */}
          <Col md={4}>
            <FooterHeading>KS Care Pharmacy</FooterHeading>
            <FooterText>
              Automate your entire healthcare hiring, onboarding and compliance with a true technology platform.
            </FooterText>
            <SocialIcons>
              <Icon href="#" target="_blank" rel="noopener noreferrer"> {/* Replace # with your social media link */}
                <i className="fab fa-instagram"></i>
              </Icon>
              <Icon href="#" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </Icon>
              <Icon href="#" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </Icon>
              <Icon href="#" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </Icon>
            </SocialIcons>
          </Col>

          {/* Column 2: Categories */}
          <Col md={4}>
            <FooterHeading>Categories</FooterHeading>
            <FooterLink to="/doctors">Doctors</FooterLink>
            <FooterLink to="/surgeons">Surgeons</FooterLink>
            <FooterLink to="/nursing-stuff">Nursing Stuff</FooterLink>
            <FooterLink to="/medicines">Medicines</FooterLink>
            <FooterLink to="/billing-info">Billing info</FooterLink>
            <FooterLink to="/customer-support">Customer support</FooterLink>
          </Col>

          {/* Column 3: About */}
          <Col md={4}>
            <FooterHeading>About</FooterHeading>
            <FooterLink to="/about-us">About Us</FooterLink>
            <FooterLink to="/partnerships">Partnerships</FooterLink>
            <FooterLink to="/financial-experts">Financial Experts</FooterLink>
            <FooterLink to="/project-management">Project Management</FooterLink>
            <FooterLink to="/the-team">The Team</FooterLink>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col className="text-center">
            <FooterText>&copy; {new Date().getFullYear()} KS Care Pharmacy | METADEW technologies. All rights reserved.</FooterText>
          </Col>
        </Row>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;
