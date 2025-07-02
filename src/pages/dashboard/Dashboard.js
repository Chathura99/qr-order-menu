import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../components/Sidebar";
import BurgerSpinner from "../../components/BurgerSpinner";
import { apiRequest } from "../../hooks/apiRequest";
import { ORDER_ENDPOINT } from "../../api/endpoints";
import { useNavigate } from "react-router-dom";
import directusClient from "../../api/directusClient";
import { FaHourglassHalf, FaPlayCircle, FaCheckCircle } from "react-icons/fa"; // Ensure react-icons is installed

const Dashboard = () => {
  const navigate = useNavigate();
  const [studentReviews, setStudentReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userRole = localStorage.getItem("user_role") || "";
  const branchId = localStorage.getItem("branch_id") || "";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        directusClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        await directusClient.get("/users/me");
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("email");
        delete directusClient.defaults.headers.common["Authorization"];
        window.location.href = "/";
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchStudentOrders = async () => {
      setLoading(true);
      try {
        const response = await apiRequest(
          `${ORDER_ENDPOINT}?filter[_and][0][_or][0][status][_eq]=pending&filter[_and][0][_or][1][status][_eq]=inprogress&filter[_and][0][_or][2][status][_eq]=completed&filter[_and][1][table][branch][_eq]=${branchId}&fields=*,table.*,table.branch.*,Menu_Items.*,Menu_Items.menu_items_id.name&limit=-1`
        );
        setStudentReviews(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load student review data.");
        setLoading(false);
      }
    };
    fetchStudentOrders();
  }, []);

  const handleView = (data) => {
    setSelectedOrder(data);
    setShowModal(true);
  };

  if (loading) return <BurgerSpinner />;

  return (
    <>
      <Container fluid>
        <Row>
          <Col md={2} className="p-3 d-none d-md-block">
            <Sidebar role={userRole} />
          </Col>
          <Col
            md={10}
            className="p-3"
            style={{ overflowY: "auto", maxHeight: "calc(100vh - 50px)" }}
          >
            <Card className="p-3 mb-4 d-flex justify-content-between align-items-center">
              <h1 className="mb-0">Order Dashboard</h1>
              <button
                type="button"
                className="navbar-toggler bg-light"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </Card>

            <Card className="p-4">
              {/* Order Summary Section */}
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "25px",
                  fontSize: "1.6rem",
                  fontWeight: "700",
                  color: "#212529",
                }}
              >
                Order Summary
              </h2>
              <Row className="g-4 justify-content-center">
                <Col md={4}>
                  <Card
                    style={{
                      color: "white",
                      height: "100%",
                      border: "none",
                      borderRadius: "15px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                      background:
                        "linear-gradient(to right, #ffc107, #ffa000)" /* Orange/Amber gradient */,
                      transition:
                        "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Card.Body
                      style={{
                        padding: "25px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        flexGrow: 1,
                      }}
                    >
                      <Card.Title
                        style={{
                          fontWeight: "600",
                          fontSize: "1.2rem",
                          marginBottom: "15px",
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        <FaHourglassHalf style={{ marginRight: "8px" }} />
                        Pending Orders
                      </Card.Title>
                      <Card.Text
                        style={{
                          fontSize: "3.5rem",
                          fontWeight: "800",
                          lineHeight: "1",
                          marginBottom: "20px",
                          color: "#fff",
                        }}
                      >
                        {
                          // Assuming studentReviews is defined in the component's state
                          // Replace studentReviews with 'orders' if this is for Dashboard.js
                          studentReviews.filter(
                            (order) => order.status === "pending"
                          ).length
                        }
                      </Card.Text>
                      <Button
                        variant="outline-light"
                        style={{
                          borderColor: "rgba(255, 255, 255, 0.7)",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          borderRadius: "8px",
                          padding: "8px 15px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.2)";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.borderColor = "white";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color =
                            "rgba(255, 255, 255, 0.9)";
                          e.currentTarget.style.borderColor =
                            "rgba(255, 255, 255, 0.7)";
                        }}
                        onClick={() => (window.location.href = "/p-orders")}
                      >
                        View Pending
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card
                    style={{
                      color: "white",
                      height: "100%",
                      border: "none",
                      borderRadius: "15px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                      background:
                        "linear-gradient(to right, #007bff, #0056b3)" /* Blue gradient */,
                      transition:
                        "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Card.Body
                      style={{
                        padding: "25px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        flexGrow: 1,
                      }}
                    >
                      <Card.Title
                        style={{
                          fontWeight: "600",
                          fontSize: "1.2rem",
                          marginBottom: "15px",
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        <FaPlayCircle style={{ marginRight: "8px" }} />
                        In Progress Orders
                      </Card.Title>
                      <Card.Text
                        style={{
                          fontSize: "3.5rem",
                          fontWeight: "800",
                          lineHeight: "1",
                          marginBottom: "20px",
                          color: "#fff",
                        }}
                      >
                        {
                          studentReviews.filter(
                            (order) => order.status === "inprogress"
                          ).length
                        }
                      </Card.Text>
                      <Button
                        variant="outline-light"
                        style={{
                          borderColor: "rgba(255, 255, 255, 0.7)",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          borderRadius: "8px",
                          padding: "8px 15px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.2)";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.borderColor = "white";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color =
                            "rgba(255, 255, 255, 0.9)";
                          e.currentTarget.style.borderColor =
                            "rgba(255, 255, 255, 0.7)";
                        }}
                        onClick={() => (window.location.href = "/i-orders")}
                      >
                        View In Progress
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card
                    style={{
                      color: "white",
                      height: "100%",
                      border: "none",
                      borderRadius: "15px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                      background:
                        "linear-gradient(to right, #28a745, #1e7e34)" /* Green gradient */,
                      transition:
                        "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Card.Body
                      style={{
                        padding: "25px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        flexGrow: 1,
                      }}
                    >
                      <Card.Title
                        style={{
                          fontWeight: "600",
                          fontSize: "1.2rem",
                          marginBottom: "15px",
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        <FaCheckCircle style={{ marginRight: "8px" }} />
                        Completed Orders
                      </Card.Title>
                      <Card.Text
                        style={{
                          fontSize: "3.5rem",
                          fontWeight: "800",
                          lineHeight: "1",
                          marginBottom: "20px",
                          color: "#fff",
                        }}
                      >
                        {
                          studentReviews.filter(
                            (order) => order.status === "completed"
                          ).length
                        }
                      </Card.Text>
                      <Button
                        variant="outline-light"
                        style={{
                          borderColor: "rgba(255, 255, 255, 0.7)",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          borderRadius: "8px",
                          padding: "8px 15px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.2)";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.borderColor = "white";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color =
                            "rgba(255, 255, 255, 0.9)";
                          e.currentTarget.style.borderColor =
                            "rgba(255, 255, 255, 0.7)";
                        }}
                        onClick={() => (window.location.href = "/c-orders")}
                      >
                        View Completed
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder ? (
            <>
              <Card className="mb-4">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h5>Order Information</h5>
                      <p>
                        <strong>Order ID:</strong> {selectedOrder.id}
                      </p>
                      <p>
                        <strong>Type:</strong> {selectedOrder.type}
                      </p>
                      <p>
                        <strong>Number (Room/Table):</strong>{" "}
                        {selectedOrder.number}
                      </p>
                      <p>
                        <strong>Status:</strong> {selectedOrder.status}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Total Price:</strong> $
                        {selectedOrder.total_price}
                      </p>
                      <p>
                        <strong>Date Created:</strong>{" "}
                        {new Date(selectedOrder.date_created).toLocaleString()}
                      </p>
                      <p>
                        <strong>Date Updated:</strong>{" "}
                        {selectedOrder.date_updated
                          ? new Date(
                              selectedOrder.date_updated
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          ) : (
            <p>No order details available.</p>
          )}
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default Dashboard;
