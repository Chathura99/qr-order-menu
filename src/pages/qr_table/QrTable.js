import React, { useState, useEffect, useRef } from "react"; // Import useRef
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Spinner,
  Alert,
  Form, // Import Form for dimension selection
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../components/Sidebar";
import BurgerSpinner from "../../components/BurgerSpinner";
import { apiRequest } from "../../hooks/apiRequest";
import { SETTINGS_ENDPOINT, TABLE_ENDPOINT } from "../../api/endpoints";
import directusClient from "../../api/directusClient";
import QRCode from "react-qr-code";
import { FaQrcode, FaEye, FaFilePdf, FaDownload } from "react-icons/fa"; // Added FaFilePdf, FaDownload icons

import jsPDF from "jspdf"; // Import jsPDF
import html2canvas from "html2canvas"; // Import html2canvas

const QrTable = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedQrValue, setSelectedQrValue] = useState("");
  const [selectedTableNumber, setSelectedTableNumber] = useState("");

  // New state for PDF dimensions
  const [pdfWidth, setPdfWidth] = useState(210); // Default A4 width in mm
  const [pdfHeight, setPdfHeight] = useState(297); // Default A4 height in mm
  const [pdfOrientation, setPdfOrientation] = useState("portrait"); // Default orientation

  const qrCodeRef = useRef(null); // Ref to the QR code element in the modal

  const userRole = localStorage.getItem("user_role") || "";

  const QR_BASE_URL =
    process.env.REACT_APP_QR_BASE_URL || "http://localhost:3000/qr/";

  // Effect to verify user authentication
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No access token found");
        }
        directusClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        await directusClient.get("/users/me");
      } catch (err) {
        console.error("Authentication check failed:", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("name");
        delete directusClient.defaults.headers.common["Authorization"];
        window.location.href = "/";
        toast.error(
          "Session expired or failed to fetch profile. Please log in again."
        );
      }
    };
    fetchUserProfile();
  }, []);

  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    // Fetch general home page data
    const fetchHomePageData = async () => {
      try {
        const response = await apiRequest(`${SETTINGS_ENDPOINT}`);
        if (response.data) {
          setHomeData(response.data); // Assuming it returns an array, take the first item
        } else {
          toast.info("No home page general data found.");
        }
      } catch (error) {
        console.error("Failed to fetch home page general data:", error);
        toast.error("Failed to load home page general content.");
      } finally {
      }
    };

    fetchHomePageData();
  }, []);

  // Effect to fetch table data
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        const branchId = localStorage.getItem("branch_id") || ""; // Get branchId
        let apiUrl = `${TABLE_ENDPOINT}?fields=*,branch.*`;
        if (branchId) {
          apiUrl += `&filter[_and][0][branch][_eq]=${branchId}&limit=-1`;
        }
        const response = await apiRequest(apiUrl);
        setTables(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tables:", err);
        setError("Failed to load table data.");
        toast.error("Failed to load table data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  const handleViewQr = (qrPrefix, tableNumber) => {
    setSelectedQrValue(`${QR_BASE_URL}${qrPrefix}`);
    setSelectedTableNumber(tableNumber);
    setShowModal(true);
  };

  const handleDownloadPdf = async () => {
    if (!qrCodeRef.current) {
      toast.error("QR code element not found for PDF generation.");
      return;
    }

    toast.info("Generating PDF, please wait...");

    try {
      // Changed: Capture the entire div containing the QR code instead of querying for SVG
      const canvas = await html2canvas(qrCodeRef.current, {
        scale: 2, // Increase scale for better resolution
        backgroundColor: null, // Transparent background
        useCORS: true, // Important for images/SVGs from other origins, even if local
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF(pdfOrientation, "mm", [pdfWidth, pdfHeight]);

      const imgWidth = 100; // Fixed image width in PDF (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

      // Calculate center position
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      // Add text below the QR code
      pdf.setFontSize(12);
      pdf.setTextColor(50, 50, 50); // Dark grey text
      const text = `Scan for Table ${selectedTableNumber} Menu`;
      const textWidth =
        (pdf.getStringUnitWidth(text) * pdf.internal.getFontSize()) /
        pdf.internal.scaleFactor;
      const textX = (pdfWidth - textWidth) / 2;
      const textY = y + imgHeight + 10; // 10mm below the image

      pdf.text(text, textX, textY);

      pdf.save(`QR_Table_${selectedTableNumber}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  // Handle dimension preset change
  const handleDimensionPresetChange = (e) => {
    const preset = e.target.value;
    setPdfOrientation("portrait"); // Reset to portrait for presets
    if (preset === "A4") {
      setPdfWidth(210);
      setPdfHeight(297);
    } else if (preset === "A5") {
      setPdfWidth(148);
      setPdfHeight(210);
    } else if (preset === "Square") {
      setPdfWidth(150);
      setPdfHeight(150);
    } else if (preset === "Custom") {
      // User will manually input values, keep current or reset to defaults
      setPdfWidth(210); // Default to A4 if custom is selected
      setPdfHeight(297);
    }
  };

  // Handle orientation change
  const handleOrientationChange = (e) => {
    const newOrientation = e.target.value;
    setPdfOrientation(newOrientation);
    // Swap width and height if changing orientation from portrait to landscape or vice-versa
    // Only swap if the current dimensions don't already match the new orientation's aspect
    if (newOrientation === "landscape" && pdfWidth > pdfHeight) {
      // If already landscape proportions, don't swap
    } else if (newOrientation === "portrait" && pdfHeight > pdfWidth) {
      // If already portrait proportions, don't swap
    } else {
      // Otherwise, swap
      setPdfWidth(pdfHeight);
      setPdfHeight(pdfWidth);
    }
  };

  if (loading) return <BurgerSpinner />;
  if (error)
    return (
      <Alert variant="danger" className="qr-table-alert">
        {error}
      </Alert>
    );

  return (
    <>
      <Container fluid className="qr-table-page-container">
        <Row>
          {/* Sidebar Column */}
          <Col md={2} className="d-none d-md-block">
            <Sidebar role={userRole} />
          </Col>

          {/* Main Content Column */}
          <Col md={10} className="main-content-offset">
            <Card className="qr-table-header-card p-3 mt-4">
              <h1 className="qr-table-title mb-0">Manage Table QR Codes</h1>
            </Card>

            <Row className="g-4">
              {tables.length > 0 ? (
                tables.map((table) => (
                  <Col key={table.id} xs={12} sm={6} md={4} lg={3}>
                    <Card className="qr-table-item-card h-100 mt-2">
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                        <FaQrcode className="qr-icon" />
                        <Card.Title className="table-number-title">
                          Table {table.table_number}
                        </Card.Title>
                        <Card.Text className="qr-prefix-text">
                          Prefix: <strong>{table.qr_prefix}</strong>
                        </Card.Text>
                        <div className="qr-code-thumbnail mb-3">
                          {table.qr_prefix ? (
                            <QRCode
                              value={`${QR_BASE_URL}${table.qr_prefix}`}
                              size={90}
                              level="L"
                            />
                          ) : (
                            <div className="text-muted text-center">
                              No QR Prefix
                            </div>
                          )}
                        </div>
                        <Button
                          variant="primary"
                          className="view-qr-btn w-100"
                          onClick={() =>
                            handleViewQr(table.qr_prefix, table.table_number)
                          }
                          disabled={!table.qr_prefix}
                        >
                          <FaEye className="me-2" /> View QR
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12}>
                  <Alert
                    variant="info"
                    className="text-center mt-4 qr-table-alert"
                  >
                    No tables found.
                  </Alert>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </Container>

      {/* QR Code Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="md"
        centered
        className="qr-code-modal"
      >
        <Modal.Header closeButton className="qr-modal-header">
          <Modal.Title className="qr-modal-title">
            QR Code for Table {selectedTableNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="qr-modal-body text-center">
          {selectedQrValue ? (
            <div className="qr-code-large-display" ref={qrCodeRef}>
              {" "}
              {/* Attach ref here */}
              <QRCode value={selectedQrValue} size={256} level="H" />
              <p className="qr-value-text mt-3">{homeData.qr_text_1 || ""}</p>
              <p className="qr-value-text mt-3">{homeData.qr_text_2 || ""}</p>
              <p className="qr-value-text mt-3">
                Scan this QR code to access the menu for Table{" "}
                {selectedTableNumber}.
              </p>
              <p className="qr-value-url">URL: {selectedQrValue}</p>
            </div>
          ) : (
            <p className="text-muted">QR code value not available.</p>
          )}

          {/* PDF Dimension Selection */}
          <div className="pdf-options-container mt-4 p-3 border rounded bg-light">
            <h5 className="mb-3 text-start">PDF Download Options</h5>
            <Form.Group className="mb-3 text-start">
              <Form.Label>Preset Size:</Form.Label>
              <Form.Select
                value={
                  pdfWidth === 210 && pdfHeight === 297
                    ? "A4"
                    : pdfWidth === 297 && pdfHeight === 210
                    ? "A4" // Also check landscape A4
                    : pdfWidth === 148 && pdfHeight === 210
                    ? "A5"
                    : pdfWidth === 210 && pdfHeight === 148
                    ? "A5" // Also check landscape A5
                    : pdfWidth === 150 && pdfHeight === 150
                    ? "Square"
                    : "Custom"
                }
                onChange={handleDimensionPresetChange}
              >
                <option value="A4">A4 (210x297 mm)</option>
                <option value="A5">A5 (148x210 mm)</option>
                <option value="Square">Square (150x150 mm)</option>
                <option value="Custom">Custom</option>
              </Form.Select>
            </Form.Group>

            <Row className="mb-3">
              <Col>
                <Form.Group controlId="pdfWidth">
                  <Form.Label>Width (mm):</Form.Label>
                  <Form.Control
                    type="number"
                    value={pdfWidth}
                    onChange={(e) => {
                      setPdfWidth(Number(e.target.value));
                      // If custom, unset preset selection
                      if (
                        e.target.value !== "210" &&
                        e.target.value !== "148" &&
                        e.target.value !== "150"
                      ) {
                        // This logic is handled by the value prop of Form.Select
                      }
                    }}
                    min="50"
                    max="500"
                    // Disable if current dimensions match a preset and preset is selected
                    disabled={
                      ["A4", "A5", "Square"].includes(
                        (pdfWidth === 210 && pdfHeight === 297) ||
                          (pdfWidth === 297 && pdfHeight === 210)
                          ? "A4"
                          : (pdfWidth === 148 && pdfHeight === 210) ||
                            (pdfWidth === 210 && pdfHeight === 148)
                          ? "A5"
                          : pdfWidth === 150 && pdfHeight === 150
                          ? "Square"
                          : "Custom"
                      ) &&
                      pdfWidth !== 0 &&
                      pdfHeight !== 0 // Ensure not disabled if values are 0
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="pdfHeight">
                  <Form.Label>Height (mm):</Form.Label>
                  <Form.Control
                    type="number"
                    value={pdfHeight}
                    onChange={(e) => {
                      setPdfHeight(Number(e.target.value));
                      // If custom, unset preset selection
                      if (
                        e.target.value !== "297" &&
                        e.target.value !== "210" &&
                        e.target.value !== "150"
                      ) {
                        // This logic is handled by the value prop of Form.Select
                      }
                    }}
                    min="50"
                    max="500"
                    // Disable if current dimensions match a preset and preset is selected
                    disabled={
                      ["A4", "A5", "Square"].includes(
                        (pdfWidth === 210 && pdfHeight === 297) ||
                          (pdfWidth === 297 && pdfHeight === 210)
                          ? "A4"
                          : (pdfWidth === 148 && pdfHeight === 210) ||
                            (pdfWidth === 210 && pdfHeight === 148)
                          ? "A5"
                          : pdfWidth === 150 && pdfHeight === 150
                          ? "Square"
                          : "Custom"
                      ) &&
                      pdfWidth !== 0 &&
                      pdfHeight !== 0 // Ensure not disabled if values are 0
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3 text-start">
              <Form.Label>Orientation:</Form.Label>
              <Form.Select
                value={pdfOrientation}
                onChange={handleOrientationChange}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </Form.Select>
            </Form.Group>

            <Button
              variant="success"
              onClick={handleDownloadPdf}
              className="download-pdf-btn w-100 mt-3"
            >
              <FaDownload className="me-2" /> Download QR as PDF
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer className="qr-modal-footer">
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            className="qr-modal-close-btn"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </>
  );
};

export default QrTable;
