import React from "react";
import { Container, Row, Col, Alert, Card } from "react-bootstrap";

import Sidebar from "../../components/Sidebar";
import { useTranslation } from "react-i18next";

const ComingSoon = ({ featureName = "This feature" }) => {
  const userRole = localStorage.getItem("user_role") || "guest"; // Default to 'guest' if role not found
  const { t } = useTranslation();

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="p-3">
          <Sidebar role={userRole} />
        </Col>
        <Col md={10} className="p-3">
          <Card className="p-3">
            <div className="d-flex justify-content-between align-items-center">
              <h1>{featureName}</h1>
            </div>
          </Card>

          <Card className="text-center mt-3">
            <Alert variant="warning" className="text-center">
              {t("common.comingSoon")}
            </Alert>
            <p>{featureName} will be available shortly. Stay tuned!</p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ComingSoon;
