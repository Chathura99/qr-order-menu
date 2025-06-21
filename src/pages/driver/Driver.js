import React from "react";
import Sidebar from "../../components/Sidebar";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import DataTable from "../../components/DataTable";

const Driver = () => {
  const userRole = localStorage.getItem("user_role") || "guest";

  const sampleData = [
    {
      driverName: "Anura Perera",
      idNo: "78965324456V",
      contactNo: "0717336065",
      ntcExpDate: "12-05-2024",
    },
    {
      driverName: "Kamal Silva",
      idNo: "56734523455V",
      contactNo: "0721234567",
      ntcExpDate: "23-09-2023",
    },
  ];

  const handleEdit = (row) => {
    console.log("Edit row:", row);
  };

  const handleDelete = (row) => {
    console.log("Delete row:", row);
  };

  const columns = [
    {
      Header: "Driver Name",
      accessor: "driverName", // Field for driver name
    },
    {
      Header: "ID No",
      accessor: "idNo", // Field for ID number
    },
    {
      Header: "Contact No",
      accessor: "contactNo", // Field for contact number
    },
    {
      Header: "NTC Ex- Date",
      accessor: "ntcExpDate", // Field for NTC Expiry Date
    },
    {
      Header: "Actions", // Action column for Edit and Delete buttons
      Cell: ({ row }) => (
        <>
          <Button
            variant="success"
            onClick={() => handleEdit(row.original)}
            className="m-1"
          >
            <i className="fas fa-edit"></i> Edit
          </Button>
          <Button
            variant="danger"
            className="ml-2"
            onClick={() => handleDelete(row.original)}
          >
            <i className="fas fa-trash-alt"></i> Delete
          </Button>
        </>
      ),
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
              <h1>Drivers</h1>
            </div>
          </Card>

          <Card className="text-center mt-3">
            <DataTable columns={columns} data={sampleData} />{" "}
            {/* Passing updated columns and data */}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Driver;
