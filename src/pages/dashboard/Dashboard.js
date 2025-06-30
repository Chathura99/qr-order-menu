import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../components/Sidebar";
import BurgerSpinner from "../../components/BurgerSpinner";
import { apiRequest } from "../../hooks/apiRequest";
import { ORDER_ENDPOINT } from "../../api/endpoints";
import { useNavigate } from "react-router-dom";
import directusClient from "../../api/directusClient";

const Dashboard = () => {
  const navigate = useNavigate();
  const [studentReviews, setStudentReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userRole = localStorage.getItem("user_role") || "";

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
          `${ORDER_ENDPOINT}?filter[_or][0][status][_eq]=pending&filter[_or][1][status][_eq]=inprogress&filter[_or][2][status][_eq]=completed`
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
              <h2 className="text-center mb-4">Order Summary</h2>
              <Row className="g-4 justify-content-center">
                <Col md={4}>
                  <Card className="text-white bg-warning shadow h-100">
                    <Card.Body>
                      <Card.Title>Pending Orders</Card.Title>
                      <Card.Text className="display-4 fw-bold">
                        {
                          studentReviews.filter(order => order.status === 'pending').length
                        }
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="text-white bg-primary shadow h-100">
                    <Card.Body>
                      <Card.Title>In Progress Orders</Card.Title>
                      <Card.Text className="display-4 fw-bold">
                        {
                          studentReviews.filter(order => order.status === 'inprogress').length
                        }
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="text-white bg-success shadow h-100">
                    <Card.Body>
                      <Card.Title>Completed Orders</Card.Title>
                      <Card.Text className="display-4 fw-bold">
                        {
                          studentReviews.filter(order => order.status === 'completed').length
                        }
                      </Card.Text>
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
                      <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                      <p><strong>Type:</strong> {selectedOrder.type}</p>
                      <p><strong>Number (Room/Table):</strong> {selectedOrder.number}</p>
                      <p><strong>Status:</strong> {selectedOrder.status}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Total Price:</strong> ${selectedOrder.total_price}</p>
                      <p><strong>Date Created:</strong> {new Date(selectedOrder.date_created).toLocaleString()}</p>
                      <p><strong>Date Updated:</strong> {selectedOrder.date_updated ? new Date(selectedOrder.date_updated).toLocaleString() : "N/A"}</p>
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
