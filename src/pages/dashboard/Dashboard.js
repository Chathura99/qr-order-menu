import React from "react";
import Sidebar from "../../components/Sidebar";
import { Container, Row, Col, Card } from "react-bootstrap";
import DataTable from "../../components/DataTable";

const Dashboard = () => {
  const userRole = localStorage.getItem("user_role") || "guest";

  const sampleData = [
    { route: "Colombo - Badulla", time: "9.30 p.m.", busNumber: "NC-1313", driver: "Kamal", conductor: "Nadun" },
    { route: "Colombo - Badulla", time: "9.30 p.m.", busNumber: "NC-1313", driver: "Kamal", conductor: "Nadun" },
    { route: "Colombo - Badulla", time: "9.30 p.m.", busNumber: "NC-1313", driver: "Kamal", conductor: "Nadun" },
    { route: "Colombo - Badulla", time: "9.30 p.m.", busNumber: "NC-1313", driver: "Kamal", conductor: "Nadun" },
    { route: "Colombo - Badulla", time: "9.30 p.m.", busNumber: "NC-1313", driver: "Kamal", conductor: "Nadun" },
  ];

  const columns = [
    {
      Header: "Route",
      accessor: "route",
    },
    {
      Header: "Time",
      accessor: "time",
    },
    {
      Header: "Bus Number",
      accessor: "busNumber",
    },
    {
      Header: "Driver",
      accessor: "driver",
    },
    {
      Header: "Conductor",
      accessor: "conductor",
    },
  ];

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="p-3">
          <Sidebar role={userRole} />
        </Col>
        <Col md={10} className="p-3">
          <Card className="p-3">
            <div className="d-flex justify-content-between align-items-center">
              <h1>Dashboard - Running Schedule</h1>
            </div>
          </Card>

          <Card className="text-center mt-3">
            <DataTable columns={columns} data={sampleData} /> {/* Passing updated columns and data */}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
