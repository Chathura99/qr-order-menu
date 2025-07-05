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
  Badge, // Import Badge for better label styling
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BurgerSpinner from "../../components/BurgerSpinner";
import ImageLoader from "../../components/ImageLoader";
import { apiRequest } from "../../hooks/apiRequest";
import logoBg from "../../images/logo.png"; // Assuming this is your logo image

import {
  MENU_CATEGORY_ENDPOINT,
  TABLE_ENDPOINT,
  ORDER_ENDPOINT,
  SETTINGS_ENDPOINT,
} from "../../api/endpoints";
import "./QRCodePage.css"; // Import your CSS file
import { tab } from "@material-tailwind/react";

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

    fetchTable();
    fetchHomePageData();
  }, [qr_prefix]);

  useEffect(() => {
    if (!tableData) return;
    console.log(tableData);
    const fetchMenu = async () => {
      try {
        const catRes = await apiRequest(
          `${MENU_CATEGORY_ENDPOINT}?filter[menu_items][menu_items_id][branches][branches_id][id][_eq]=${tableData.branch.id}&fields=*,menu_items.*,menu_items.menu_items_id.*,menu_items.menu_items_id.labels.labels_id.*,menu_items.menu_items_id.branches.branches_id.id&limit=-1`
        );
        // setCategories(catRes.data);
        const branchId = tableData.branch.id;

        const filteredCategories = catRes.data
          .map((category) => {
            // Filter menu items within each category by branch ID
            const filteredMenuItems = category.menu_items.filter((menuItem) => {
              const branches = menuItem.menu_items_id.branches || [];
              return branches.some(
                (b) => b.branches_id && b.branches_id.id === branchId
              );
            });

            // Only include categories that have matching menu items
            if (filteredMenuItems.length > 0) {
              return {
                ...category,
                menu_items: filteredMenuItems,
              };
            }

            return null;
          })
          .filter(Boolean); // Remove null values

        // Set filtered data
        setCategories(filteredCategories);

        if (catRes.data.length > 0) {
          // Set initial selected tab to the first category name, or an empty string if no categories
          setSelectedTab(catRes.data[0]?.name || "");
        }
      } catch {
        toast.error("Failed to load menu.");
      }
    };
    fetchMenu();
  }, [tableData]);

  // Handle adding item to cart
  const handleAddToCart = (item) => {
    const exists = cart.find((c) => c.id === item.id); // Check if item already exists
    if (exists) {
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  // Handle removing item from cart
  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
    toast.info("Item removed from cart.");
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Select at least one item.");
      return;
    }

    // if (mobile.trim().length < 10 || !/^\d+$/.test(mobile.trim())) {
    //   toast.error("Please enter a valid mobile number (at least 10 digits).");
    //   return;
    // }

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
                onClick={
                  () =>
                    (window.location.href =
                      homeData.google_map_link || "https://maps.google.com")
                  // window.open(homeData.location || "https://maps.google.com")
                }
              >
                📍 Map
              </Button>
            </div>

            <div className="header-logo">
              {/* <img
                src={logoBg}
                alt="QuickDine Logo"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              /> */}
              {homeData.logo && (
                <ImageLoader
                  imageId={homeData.logo}
                  altText="Company Logo"
                  className="company-logo mb-4"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              )}
            </div>

            <div className="header-details">
              <h4>QuickDine - {homeData.Name || ""}</h4>
              <div className="qr-menu-section">
                {/* <p>QR Code Restaurant Menu System</p> */}
                 <p>{homeData.location || ""}</p>
              </div>
            </div>
          </div>

          <div className="container mt-4 main-content-area">
            <Card className="customer-info-card mb-2">
              {/* Removed p-4 mb-4 shadow-sm from here as defined in CSS */}
              <div className="card-header-styled">
                {/* New div for header styling */}
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
              <Card.Body className="card-body-styled">
                <Form className="customer-info-form">
                  {/* Added a class for form styling */}
                  <Row className="form-row-custom">
                    {/* Added a class for row spacing */}
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        {/* Increased bottom margin for more space */}
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
                        {" "}
                        {/* Increased bottom margin */}
                        <Form.Label className="form-label-styled">
                          Mobile Number (Not Mandatory)
                        </Form.Label>{" "}
                        {/* Styled label */}
                        <Form.Control
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="e.g., +94771234567"
                          className="form-control-custom"
                          type="tel" // Use type tel for mobile numbers
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            <Tabs
              activeKey={selectedTab}
              onSelect={(k) => setSelectedTab(k)}
              className="mb-3 custom-tabs-container" // Add custom class for styling
            >
              {categories.map((cat) => (
                <Tab eventKey={cat.name} title={cat.name} key={cat.id}>
                  <Row>
                    {cat.menu_items
                      ?.map((wrapper) => wrapper.menu_items_id)
                      ?.filter(Boolean)
                      .map((item) => (
                        <Col md={4} key={item.id} className="mb-4">
                          <Card className="h-100 menu-item-card">
                            <Card.Body>
                              <Card.Title>{item.name}</Card.Title>
                              {/* Labels */}
                              {item.labels?.length > 0 && (
                                <div className="mb-2 item-labels-container">
                                  {item.labels.map((labelWrapper, idx) => (
                                    <Badge
                                      key={idx}
                                      bg="warning" // Using Bootstrap badge background
                                      className="item-label-badge" // Custom class for styling
                                    >
                                      {labelWrapper.labels_id?.icon && (
                                        <ImageLoader
                                          altText=""
                                          imageId={labelWrapper.labels_id.icon}
                                          className="item-label-icon"
                                          style={{
                                            width: "1em",
                                            height: "1em",
                                          }}
                                        />
                                      )}
                                      {labelWrapper.labels_id?.label_name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {/* Image */}
                              <ImageLoader
                                altText={item.name}
                                imageId={item.image}
                                className="card-img-top"
                              />
                              {/* Description */}
                              <p className="item-description">
                                {item.description ||
                                  "No description available."}
                              </p>
                              {/* Price */}
                              <p className="item-price">
                                {`Rs. ${item.price}` || "Free"}
                              </p>
                              {/* Add to Cart */}
                              <Button
                                variant="primary"
                                onClick={() => handleAddToCart(item)}
                                className="w-100 add-to-cart-btn"
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

            {/* Cart Section */}
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
                      key={item.id} // Use item.id as key for unique identification
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
        </>
      )}
    </div>
  );
};

export default QRCodePage;
