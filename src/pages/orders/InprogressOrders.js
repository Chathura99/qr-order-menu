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
import BurgerSpinner from "../../components/BurgerSpinner";
import { apiRequest } from "../../hooks/apiRequest"; // Replace with your API hook
import { ORDER_ENDPOINT, FILE_UPLOAD_ENDPOINT } from "../../api/endpoints"; // Replace with your API endpoint
import { useNavigate } from "react-router-dom";
import directusClient from "../../api/directusClient";

const InprogressOrders = () => {
  const navigate = useNavigate();
  const [studentReviews, setStudentReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

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
          `${ORDER_ENDPOINT}?filter[_or][0][status][_eq]=inprogress&fields=*,table.*,table.branch.*,Menu_Items.*,Menu_Items.menu_items_id.name`
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

  // PATCH order status to completed
  const handleStatusChange = async () => {
    if (!selectedOrder) return;
    setStatusUpdating(true);
    try {
      await apiRequest(`${ORDER_ENDPOINT}/${selectedOrder.id}`, "PATCH", {
        status: "completed",
      });
      toast.success("Order status updated to completed.");
      // Update UI: remove from list and close modal
      setStudentReviews((prev) =>
        prev.filter((order) => order.id !== selectedOrder.id)
      );
      setShowModal(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error("Failed to update order status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  // DataTable columns
  const columns = [
    { Header: "ID", accessor: "id" },
      { Header: "Customer", accessor: "Name" },
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
            <Card className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <h1>Inprogress ORDERS</h1>
                <button
                  type="button"
                  className="navbar-toggler bg-light"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
              </div>
            </Card>

            <Card className="mt-3 p-3 w-100" style={{ overflowX: "auto" }}>
              <h2 className="text-center mb-4">Order List</h2>
              <div style={{ width: "100%" }}>
                <DataTable columns={columns} data={studentReviews} />
              </div>
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
                        <strong>Status:</strong> {selectedOrder.status}
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
                    <Col md={6}>
                      <h5>Customer Details</h5>
                      <p>
                        <strong>Name:</strong> {selectedOrder.Name || "-"}
                      </p>
                      <p>
                        <strong>Mobile:</strong>{" "}
                        {selectedOrder.Mobile_Number || "-"}
                      </p>
                      <p>
                        <strong>Table Number:</strong>{" "}
                        {selectedOrder.table?.table_number || "-"}
                      </p>
                      <p>
                        <strong>Branch:</strong>{" "}
                        {selectedOrder.table?.branch?.name || "-"}
                      </p>
                      <p>
                        <strong>Branch Location:</strong>{" "}
                        {selectedOrder.table?.branch?.location || "-"}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <h5 className="mb-3">Order Items</h5>

              {selectedOrder.Menu_Items?.length > 0 ? (
                selectedOrder.Menu_Items.map((item, index) => (
                  <Card key={index} className="mb-3 shadow-sm">
                    <Card.Body>
                      <Row>
                        <Col md={8}>
                          <p className="mb-1">
                            <strong>Item:</strong>{" "}
                            {item.menu_items_id?.name || "N/A"}
                          </p>
                        </Col>
                        <Col md={4}>
                          <p className="mb-1">
                            <strong>Qty:</strong> {item.qty || 0}
                          </p>
                        </Col>
                    
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <p>No items found for this order.</p>
              )}

              {/* Status change button */}
              {selectedOrder.status === "pending" && (
                <div className="d-flex justify-content-end">
                  <Button
                    variant="success"
                    onClick={handleStatusChange}
                    disabled={statusUpdating}
                  >
                    {statusUpdating ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Updating...
                      </>
                    ) : (
                      "Mark as In Completed"
                    )}
                  </Button>
                </div>
              )}
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

export default InprogressOrders;
