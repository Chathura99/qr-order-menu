import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../components/Sidebar"; // Replace with your Sidebar component
import DataTable from "../../components/DataTable"; // Replace with your DataTable component
import BurgerSpinner from "../../components/BurgerSpinner"
import { apiRequest } from "../../hooks/apiRequest"; // Replace with your API hook
import { ORDER_ENDPOINT, FILE_UPLOAD_ENDPOINT } from "../../api/endpoints"; // Replace with your API endpoint
import { useNavigate } from "react-router-dom";
import directusClient from "../../api/directusClient";

const Orders = () => {
  const navigate = useNavigate();
  const [studentReviews, setStudentReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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

  // Fetch student reviews
  useEffect(() => {
    const fetchStudentOrders = async () => {
      setLoading(true);
      try {
        const response = await apiRequest(
          `${ORDER_ENDPOINT}?filter[_or][0][status][_eq]=${"pending"}&filter[_or][1][status][_eq]=${"inprogress"}`
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

  const handleEdit = (data) => {
    setShowModal(true);
  };

  const handleView = (data) => {
    setSelectedOrder(data);
    setShowModal(true);
  };

  // DataTable columns
  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Type", accessor: "type" },
    { Header: "Number(Room/Table)", accessor: "number" },
    { Header: "Status", accessor: "status" },
    {
      Header: "Date Created",
      accessor: (row) => {
        const originalDate = new Date(row.date_created);
        originalDate.setHours(originalDate.getHours() + 5);
        originalDate.setMinutes(originalDate.getMinutes() + 30);
        const date = originalDate.toISOString().split("T")[0];
        const time = originalDate.toISOString().split("T")[1].split(".")[0];
        return `${date} ${time}`;
      },
    },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <Button
          variant="primary"
          className="m-1"
          onClick={() => handleView(row.original)}
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) return <BurgerSpinner/>

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
            <Card className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <h1>PENDING ORDERS</h1>
                <button
                  type="button"
                  className="navbar-toggler bg-light"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
              </div>
            </Card>

            <Card className="mt-3">
              <h2 className="text-center m-3">Order List</h2>

              <DataTable columns={columns} data={studentReviews} />
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

              <h5 className="mb-3">Order Items</h5>
              {selectedOrder?.order_details?.map((detail, index) => {
                // Calculate total price for each item including add-ons
                const calculateTotalPrice = (detail) => {
                  const basePrice =
                    detail.portion === "Large"
                      ? detail.prices.large || 0
                      : detail.prices.single || 0;
                  const addOnsPrice = detail.add_ons.reduce((sum, addon) => {
                    return sum + addon.price * addon.quantity;
                  }, 0);
                  return basePrice * detail.quantity + addOnsPrice;
                };

                const itemTotalPrice = calculateTotalPrice(detail);

                return (
                  <Card key={index} className="mb-4 shadow-sm">
                    <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{detail.item_name}</h6>
                      <span>Total: ${itemTotalPrice.toFixed(2)}</span>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <p>
                            <strong>Spice Level:</strong> {detail.spice_level}
                          </p>
                          <p>
                            <strong>Quantity:</strong> {detail.quantity}
                          </p>
                          <p>
                            <strong>Portion:</strong> {detail.portion || "N/A"}
                          </p>
                        </Col>
                        <Col md={6}>
                          {detail.portion === "Single" && (
                            <p>
                              <strong>Price (Single):</strong> $
                              {detail.prices.single}
                            </p>
                          )}
                          {detail.portion === "Large" && (
                            <p>
                              <strong>Price (Large):</strong> $
                              {detail.prices.large}
                            </p>
                          )}

                          {detail.portion != "Large" &&
                            detail.portion != "Single" && (
                              <p>
                                <strong>Price:</strong> ${detail.prices.single}
                              </p>
                            )}
                        </Col>
                      </Row>

                      {detail.meal_items.length > 0 && (
                        <div className="mt-3">
                          <h6 className="bg-secondary text-white p-1">
                            Meal Items
                          </h6>
                          <ul className="list-group">
                            {detail.meal_items.map((meal, i) => (
                              <li key={i} className="list-group-item">
                                <strong>{meal.item_name}:</strong>{" "}
                                {meal.options.length > 0
                                  ? meal.options.map((option, j) => (
                                      <span
                                        key={j}
                                        className={`badge mx-1 ${
                                          option.selected
                                            ? "bg-primary"
                                            : "bg-secondary"
                                        }`}
                                      >
                                        {option.name}
                                      </span>
                                    ))
                                  : "N/A"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {detail.add_ons.length > 0 && (
                        <div className="mt-3">
                          <h6 className="bg-secondary text-white p-1">
                            Add-Ons
                          </h6>
                          <ul className="list-group">
                            {detail.add_ons
                              .filter((addon) => addon.quantity != 0)
                              .map((addon, j) => (
                                <li key={j} className="list-group-item">
                                  {addon.name} - ${addon.price} (Qty:{" "}
                                  {addon.quantity})
                                </li>
                              ))}
                            {detail.add_ons.filter(
                              (addon) => addon.quantity !== 0
                            ).length === 0 && "No add-ons!"}
                          </ul>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
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

export default Orders;
