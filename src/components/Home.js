import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import NavbarComponent from "./NavbarComponent";
import styled from "styled-components";
import Footer from "./Footer";
import BgimageSectionHome from "./BgimageSectionHome";
import BlogSection from "./BlogSection";
import TrendingProducts from "./TrendingProducts ";
import home from "../pages/images/Home.png";

// Hero section background and styling
const HeroSection = styled.section`
  background: url(${home}) no-repeat center center;
  background-size: cover;
  color: white;
  padding: 80px 0;
  height: 600px;
  text-align: left;

  @media (max-width: 768px) {
    height: auto;
    padding: 40px 0;
  }
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: white;
  font-size: 1.2rem;
  max-width: 90%;

  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 100%;
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <div>
      <NavbarComponent onNavigate={navigate} />
      {/* Hero Section */}
      <HeroSection>
        <Container>
          <Row>
            <Col md={6}></Col>

            <Col md={6}>
              {" "}
              <Button
                variant="success"
                className="me-3 mb-5"
                style={{ backgroundColor: "#34c759" }}
              >
                {t("Your Health is Our Priority")}
              </Button>
              <Title>{t("More Than Medicine It's Personal")}</Title>
              <Subtitle>
                {t(
                  "Wellness Hospital will always serve you wholeheartedly. Health is a priority."
                )}
              </Subtitle>
              <Button
                variant="success"
                className="me-3"
                style={{ backgroundColor: "#34c759" }}
                onClick={() => navigate("/prescription-orders-old")}
              >

                {t("Upload Prescription")}
              </Button>
              <Button
                variant="outline"
                style={{
                  borderColor: "#34c759",
                  color: "#34c759",
                }}
              >
                {t("Product Wizard")}
              </Button>
            </Col>
          </Row>
        </Container>
      </HeroSection>

      {/* Trending Products Section */}
      <TrendingProducts />

      <BgimageSectionHome />
      <BlogSection />
      <Footer />
    </div>
  );
};

export default Home;
