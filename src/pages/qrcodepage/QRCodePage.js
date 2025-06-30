import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Col,
  Row,
  Tab,
  Tabs,
  ListGroup,
  Button,
  Form,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BurgerSpinner from "../../components/BurgerSpinner";
import ImageLoader from "../../components/ImageLoader";
import { apiRequest } from "../../hooks/apiRequest";
import {
  MENU_CATEGORY_ENDPOINT,
  TABLE_ENDPOINT,
  ORDER_ENDPOINT,
} from "../../api/endpoints";

const QRCodePage = () => {
  const { qr_prefix } = useParams();
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedTab, setSelectedTab] = useState("");
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedPortions, setSelectedPortions] = useState({}); // NEW

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = await apiRequest(
          `${TABLE_ENDPOINT}?filter[qr_prefix][_eq]=${qr_prefix}&fields=*,branch.*`
        );
        if (response.data.length === 0) {
          toast.error("Invalid QR code or no matching table found.");
        } else {
          setTableData(response.data[0]);
        }
      } catch (error) {
        toast.error("Failed to fetch table.");
      } finally {
        setLoading(false);
      }
    };
    fetchTable();
  }, [qr_prefix]);

  useEffect(() => {
    if (!tableData) return;

    const fetchMenu = async () => {
      try {
        const catRes = await apiRequest(
          `${MENU_CATEGORY_ENDPOINT}?fields=*,menu_items.*,menu_items.menu_items_id.*,menu_items.menu_items_id.labels.labels_id.*`
        );
        setCategories(catRes.data);
        if (catRes.data.length > 0) {
          setSelectedTab(catRes.data[0].name);
        }
      } catch {
        toast.error("Failed to load menu.");
      }
    };
    fetchMenu();
  }, [tableData]);

  const handlePortionChange = (itemId, value) => {
    setSelectedPortions((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleAddToCart = (item) => {
    const portion = selectedPortions[item.id] || "Single";

    const exists = cart.find((c) => c.id === item.id && c.portion === portion);
    if (exists) {
      setCart(
        cart.map((c) =>
          c.id === item.id && c.portion === portion
            ? { ...c, qty: c.qty + 1 }
            : c
        )
      );
    } else {
      setCart([...cart, { ...item, qty: 1, portion }]);
    }

    toast.success(`${item.name} (${portion}) added to cart`);
  };

  const handlePlaceOrder = async () => {
    if (!name || !mobile || cart.length === 0) {
      toast.error("Please fill name, mobile and select at least one item.");
      return;
    }

    try {
      const orderPayload = {
        Name: name,
        Mobile_Number: mobile,
        status: "pending",
        table: tableData.id,
        Menu_Items: cart.map((item) => ({
          menu_items_id: item.id,
          qty: item.qty,
          portion: item.portion,
        })),
      };

      await apiRequest(ORDER_ENDPOINT, "POST", orderPayload);
      toast.success("Order placed successfully!");
      setCart([]);
      setName("");
      setMobile("");
    } catch (e) {
      toast.error("Failed to place order.");
    }
  };

  if (loading) return <BurgerSpinner />;

  return (
    <div className="container mt-4">
      <ToastContainer />
      {tableData && (
        <>
          <Card className="p-4 mb-4 shadow-sm">
            <h4>
              Welcome to {tableData.branch?.name} - Table{" "}
              {tableData.table_number}
            </h4>
            <p>
              <strong>QR Prefix:</strong> {tableData.qr_prefix}
            </p>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mobile</Form.Label>
                    <Form.Control
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Enter mobile number"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card>

          <Tabs
            activeKey={selectedTab}
            onSelect={(k) => setSelectedTab(k)}
            className="mb-3"
          >
            {categories.map((cat) => (
              <Tab eventKey={cat.name} title={cat.name} key={cat.id}>
                <Row>
                  {cat.menu_items
                    ?.map((wrapper) => wrapper.menu_items_id)
                    ?.filter(Boolean)
                    .map((item) => (
                      <Col md={4} key={item.id} className="mb-4">
                        <Card className="h-100 shadow-sm">
                          <Card.Body>
                            <Card.Title>{item.name}</Card.Title>

                            {/* Labels */}
                            {item.labels?.length > 0 && (
                              <div className="mb-2">
                                {item.labels.map((labelWrapper, idx) => (
                                  <span
                                    key={idx}
                                    className="badge bg-warning text-dark me-2 d-inline-flex align-items-center"
                                    style={{ fontSize: "0.75rem", gap: "5px" }}
                                  >
                                    {labelWrapper.labels_id?.icon && (
                                      <ImageLoader
                                        altText=""
                                        imageId={labelWrapper.labels_id.icon}
                                        style={{
                                          width: "18px",
                                          height: "18px",
                                          objectFit: "cover",
                                          borderRadius: "4px",
                                          marginRight: "5px",
                                        }}
                                      />
                                    )}
                                    {labelWrapper.labels_id?.label_name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Image */}
                            <ImageLoader
                              altText=""
                              imageId={item.image}
                              style={{
                                width: "100%",
                                height: "180px",
                                objectFit: "cover",
                                borderRadius: "10px",
                                marginBottom: "10px",
                              }}
                            />

                            {/* Description */}
                            <p style={{ minHeight: "60px" }}>
                              {item.description || "No description available."}
                            </p>

                            {/* Portion selector */}
                            <Form.Group className="mb-3">
                              <Form.Label>Choose Portion</Form.Label>
                              <Form.Select
                                value={selectedPortions[item.id] || "Single"}
                                onChange={(e) =>
                                  handlePortionChange(item.id, e.target.value)
                                }
                              >
                                <option value="Single">Single</option>
                                <option value="Large">Large</option>
                              </Form.Select>
                            </Form.Group>

                            {/* Add to Cart */}
                            <Button
                              variant="primary"
                              onClick={() => handleAddToCart(item)}
                              className="w-100"
                            >
                              Add to Cart
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                </Row>
              </Tab>
            ))}
          </Tabs>

          {/* Cart */}
          <Card className="p-3 mt-4 shadow-sm">
            <h5>🛒 Your Cart</h5>
            {cart.length === 0 ? (
              <p>No items added.</p>
            ) : (
              <ListGroup>
                {cart.map((item, index) => (
                  <ListGroup.Item key={index}>
                    {item.name} ({item.portion}) x {item.qty}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            <div className="text-end mt-3">
              <Button variant="success" onClick={handlePlaceOrder}>
                Place Order
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default QRCodePage;
