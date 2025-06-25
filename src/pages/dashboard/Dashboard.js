import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import DataTable from "../../components/DataTable";

const Dashboard = () => {
  const userRole = localStorage.getItem("user_role") || "guest";
  const [showOrderForm, setShowOrderForm] = useState(false);

  
  const sampleOrders = [
    {
      orderId: "ORD001",
      customerName: "Alice Smith",
      items: "Burger, Fries, Coke",
      total: "$15.50",
      status: "Pending",
      timestamp: "2025-06-21 10:00 AM",
    },
    {
      orderId: "ORD002",
      customerName: "Bob Johnson",
      items: "Pizza, Salad",
      total: "$22.00",
      status: "Preparing",
      timestamp: "2025-06-21 10:15 AM",
    },
    {
      orderId: "ORD003",
      customerName: "Charlie Brown",
      items: "Pasta, Garlic Bread",
      total: "$18.75",
      status: "Delivered",
      timestamp: "2025-06-21 09:45 AM",
    },
    {
      orderId: "ORD004",
      customerName: "Diana Prince",
      items: "Sandwich, Soup",
      total: "$12.00",
      status: "Pending",
      timestamp: "2025-06-21 10:30 AM",
    },
     {
      orderId: "ORD004",
      customerName: "Diana Prince",
      items: "Sandwich, Soup",
      total: "$12.00",
      status: "Pending",
      timestamp: "2025-06-21 10:30 AM",
    },
     {
      orderId: "ORD004",
      customerName: "Diana Prince",
      items: "Sandwich, Soup",
      total: "$12.00",
      status: "Pending",
      timestamp: "2025-06-21 10:30 AM",
    },
    {
      orderId: "ORD005",
      customerName: "Ethan Hunt",
      items: "Steak, Vegetables",
      total: "$30.00",
      status: "Delivered",
      timestamp: "2025-06-21 09:30 AM",
    },
  ];

  const columns = [
    {
      Header: "Order ID",
      accessor: "orderId",
    },
    {
      Header: "Customer Name",
      accessor: "customerName",
    },
    {
      Header: "Items",
      accessor: "items",
    },
    {
      Header: "Total",
      accessor: "total",
    },
    {
      Header: "Status",
      accessor: "status",
    },
    {
      Header: "Timestamp",
      accessor: "timestamp",
    },
  ];

  const handleAddOrderClick = () => {
    setShowOrderForm(true);
  };

  const handleOrderFormClose = () => {
    setShowOrderForm(false);
    // In a real application, you would re-fetch or update your orders here
  };

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="p-3">
          <Sidebar role={userRole} />
        </Col>
        <Col md={10} className="p-3">
          <Card className="p-3">
            <div className="d-flex justify-content-between align-items-center">
              <h1>Restaurant Order Dashboard</h1>
              <Button variant="primary" onClick={handleAddOrderClick}>
                Add New Order
              </Button>
            </div>
          </Card>

          <Card className="text-center mt-3">
            <DataTable columns={columns} data={sampleOrders} />
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default Dashboard;