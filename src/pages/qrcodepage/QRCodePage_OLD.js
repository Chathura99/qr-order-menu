import React, { useEffect, useState, useRef } from "react";
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
  Badge,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BurgerSpinner from "../../components/BurgerSpinner";
import ImageLoader from "../../components/ImageLoader";
import { apiRequest } from "../../hooks/apiRequest";
import demoFood from "../../images/demoFood.png";

import {
  MENU_CATEGORY_ENDPOINT,
  TABLE_ENDPOINT,
  ORDER_ENDPOINT,
  SETTINGS_ENDPOINT,
} from "../../api/endpoints";
import "./QRCodePage.css";

const QRCodePage = () => {
  const { qr_prefix } = useParams();
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedTab, setSelectedTab] = useState("");
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [homeData, setHomeData] = useState(null);
  const [showGoToCart, setShowGoToCart] = useState(true);

  // Scroll targets
  const menuRef = useRef(null);
  const cartRef = useRef(null);

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

    const fetchHomePageData = async () => {
      try {
        const response = await apiRequest(`${SETTINGS_ENDPOINT}`);
        if (response.data) {
          setHomeData(response.data);
        } else {
          toast.info("No home page general data found.");
        }
      } catch (error) {
        console.error("Failed to fetch home page general data:", error);
        toast.error("Failed to load home page general content.");
      }
    };

    fetchTable();
    fetchHomePageData();
  }, [qr_prefix]);

  useEffect(() => {
    if (!tableData) return;
    const fetchMenu = async () => {
      try {
        const catRes = await apiRequest(
          `${MENU_CATEGORY_ENDPOINT}?filter[menu_items][menu_items_id][branches][branches_id][id][_eq]=${tableData.branch.id}&fields=*,menu_items.*,menu_items.menu_items_id.*,menu_items.menu_items_id.labels.labels_id.*,menu_items.menu_items_id.branches.branches_id.id&limit=-1`
        );

        const branchId = tableData.branch.id;
        const filteredCategories = catRes.data
          .map((category) => {
            const filteredMenuItems = category.menu_items.filter((menuItem) => {
              const branches = menuItem.menu_items_id.branches || [];
              return branches.some(
                (b) => b.branches_id && b.branches_id.id === branchId
              );
            });

            if (filteredMenuItems.length > 0) {
              return {
                ...category,
                menu_items: filteredMenuItems,
              };
            }

            return null;
          })
          .filter(Boolean);

        setCategories(filteredCategories);
        if (catRes.data.length > 0) {
          setSelectedTab(catRes.data[0]?.name || "");
        }
      } catch {
        toast.error("Failed to load menu.");
      }
    };
    fetchMenu();
  }, [tableData]);

  // Scroll listener to toggle button label
  useEffect(() => {
    const handleScroll = () => {
      setShowGoToCart(window.scrollY < 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = (item) => {
    const exists = cart.find((c) => c.id === item.id);
    if (exists) {
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
    toast.info("Item removed from cart.");
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Select at least one item.");
      return;
    }

    try {
      const orderPayload = {
        Name: name.trim() || `order_${Date.now()}`,
        Mobile_Number: mobile.trim(),
        status: "pending",
        table: tableData.id,
        Menu_Items: cart.map((item) => ({
          menu_items_id: item.id,
          qty: item.qty,
        })),
      };
      await apiRequest(ORDER_ENDPOINT, "POST", orderPayload);
      toast.success("Order placed successfully!");
      setCart([]);
      setName("");
      setMobile("");
    } catch (e) {
      console.error("Order placement failed:", e);
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (loading) return <BurgerSpinner />;

  return (
    <div className="container-fluid p-0">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      {tableData && (
        <>
          <div className="header-section">
            <div className="header-top-buttons">
              <Button
                variant="outline-light"
                className="me-2 header-top-btn m-2"
                onClick={() => (window.location.href = "/")}
              >
                Login
              </Button>
              <Button
                variant="outline-light"
                className="header-top-btn"
                onClick={() =>
                  (window.location.href =
                    homeData.google_map_link || "https://maps.google.com")
                }
              >
                📍 Map
              </Button>
            </div>

            <div className="header-logo">
              {homeData?.logo && (
                <ImageLoader
                  imageId={homeData?.logo || ""}
                  altText="Company Logo"
                  className="company-logo mb-4"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              )}
            </div>

            <div className="header-details">
              <h4>QuickDine - {homeData?.Name || ""}</h4>
              <div className="qr-menu-section">
                <p>{homeData?.location || ""}</p>
              </div>
            </div>
          </div>

          <div className="container mt-4 main-content-area">
            <Card className="customer-info-card mb-2">
              <div className="card-header-styled">
                <h4 className="card-title-styled">
                  Welcome to{" "}
                  <span className="highlight-text">
                    {tableData.branch?.name}
                  </span>{" "}
                  - Table{" "}
                  <span className="highlight-text">
                    {tableData.table_number}
                  </span>
                </h4>
              </div>
              {homeData?.customer_details && (
                <Card.Body className="card-body-styled">
                  <Form className="customer-info-form">
                    <Row className="form-row-custom">
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label className="form-label-styled">
                            Your Name (Not Mandatory)
                          </Form.Label>
                          <Form.Control
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., John Doe"
                            className="form-control-custom"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="form-label-styled">
                            Mobile Number (Not Mandatory)
                          </Form.Label>
                          <Form.Control
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="e.g., +94771234567"
                            className="form-control-custom"
                            type="tel"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              )}
            </Card>

            {/* Scroll Target for Menu */}
            <div ref={menuRef}></div>

            <Tabs
              activeKey={selectedTab}
              onSelect={(k) => setSelectedTab(k)}
              className="mb-3 custom-tabs-container"
            >
              {categories.map((cat) => (
                <Tab eventKey={cat.name} title={cat.name} key={cat.id}>
                  <Row className="g-2">
                    {cat.menu_items
                      ?.map((wrapper) => wrapper.menu_items_id)
                      ?.filter(Boolean)
                      .map((item) => (
                        <Col xs={6} md={4} key={item.id}>
                          <Card.Body className="p-2 d-flex flex-column justify-content-between">
                            <Card.Title className="fs-6 mb-1 ">
                              {item.name}
                            </Card.Title>

                            {item.labels?.length > 0 ? (
                              <div className="mb-1 d-flex flex-wrap gap-1">
                                {item.labels.map((labelWrapper, idx) => (
                                  <Badge
                                    key={idx}
                                    bg="warning"
                                    className="d-flex align-items-center gap-1 px-1 py-0"
                                    style={{ fontSize: "0.65em" }}
                                  >
                                    {labelWrapper.labels_id?.icon && (
                                      <ImageLoader
                                        altText=""
                                        imageId={labelWrapper.labels_id.icon}
                                        style={{
                                          width: "0.9em",
                                          height: "0.9em",
                                        }}
                                      />
                                    )}
                                    {labelWrapper.labels_id?.label_name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <div
                                // className="mb-1"
                                style={{ height: "1em" }}
                              ></div>
                            )}

                            {item.image ? (
                              <ImageLoader
                                altText={item.name}
                                imageId={item.image}
                                className="img-fluid rounded mb-2"
                                style={{
                                  width: "100%",
                                  height: "120px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <img
                                src={demoFood}
                                alt={item.name}
                                className="img-fluid rounded mb-2"
                                style={{
                                  width: "100%",
                                  height: "112px",
                                  objectFit: "cover",
                                }}
                              />
                            )}

                            <p
                              className="item-description text-muted mb-2"
                              style={{ fontSize: "0.75em" }}
                            >
                              {item.description || "No description available."}
                            </p>

                            <div className="d-flex justify-content-between align-items-center mt-auto">
                              <Button
                                variant="primary"
                                onClick={() => handleAddToCart(item)}
                                className="add-to-cart-btn px-2 py-1"
                                style={{ fontSize: "0.75em" }}
                              >
                                Add to Cart
                              </Button>
                              <span
                                className="fw-bold text-success item-price"
                                style={{ fontSize: "0.8em" }}
                              >
                                {item.price ? `Rs. ${item.price}` : "Free"}
                              </span>
                            </div>
                          </Card.Body>
                        </Col>
                      ))}
                  </Row>
                </Tab>
              ))}
            </Tabs>
      

            {/* Scroll Target for Cart */}
            <div ref={cartRef}></div>

            <Card className="p-3 mt-4 shadow-sm cart-card">
              <h5>🛒 Your Cart</h5>
              {cart.length === 0 ? (
                <p className="text-muted">
                  No items added yet. Start Browse the menu!
                </p>
              ) : (
                <ListGroup variant="flush">
                  {cart.map((item) => (
                    <ListGroup.Item
                      key={item.id}
                      className="d-flex justify-content-between align-items-center cart-item"
                    >
                      <div>
                        <strong>{item.name}</strong> (Qty: {item.qty})
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="remove-from-cart-btn"
                      >
                        Remove
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              <div className="text-end mt-3">
                <Button
                  variant="success"
                  onClick={handlePlaceOrder}
                  className="place-order-btn"
                  disabled={cart.length === 0}
                >
                  Place Order
                </Button>
              </div>
            </Card>
          </div>

          {/* Floating Scroll Button */}
          <Button
            variant="dark"
            className="floating-toggle-btn"
            onClick={() =>
              showGoToCart
                ? cartRef.current?.scrollIntoView({ behavior: "smooth" })
                : menuRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {showGoToCart ? "⬇️ Go to Cart" : "⬆️ Menu"}
          </Button>
        </>
      )}
    </div>
  );
};

export default QRCodePage;
