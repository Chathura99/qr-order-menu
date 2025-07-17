import React, { useEffect, useState, useRef, useCallback, memo } from "react";
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
  Accordion, // Import Accordion
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
  // Store categories grouped by their parent category
  const [groupedCategories, setGroupedCategories] = useState({});
  const [selectedTab, setSelectedTab] = useState("");
  // Cache for menu items, keyed by actual category ID
  const [categoryItemsCache, setCategoryItemsCache] = useState({});
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [homeData, setHomeData] = useState(null);
  const [showGoToCart, setShowGoToCart] = useState(true);
  const [loadingCategoryItems, setLoadingCategoryItems] = useState(false); // New loading state for category items

  const menuRef = useRef(null);
  const cartRef = useRef(null);

  // --- Initial Data Fetching: Table and Home Data ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [tableResponse, settingsResponse] = await Promise.all([
          apiRequest(
            `${TABLE_ENDPOINT}?filter[qr_prefix][_eq]=${qr_prefix}&fields=*,branch.*`
          ),
          apiRequest(`${SETTINGS_ENDPOINT}`),
        ]);

        if (tableResponse.data.length === 0) {
          toast.error("Invalid QR code or no matching table found.");
          setTableData(null);
        } else {
          setTableData(tableResponse.data[0]);
        }

        setHomeData(settingsResponse.data || {});
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("Failed to load initial page data.");
        setTableData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [qr_prefix]);

  // --- Fetch Categories when tableData is available ---
  useEffect(() => {
    if (!tableData) return;

    const fetchCategories = async () => {
      try {
        const catRes = await apiRequest(
          `${MENU_CATEGORY_ENDPOINT}?filter[menu_items][menu_items_id][branches][branches_id][id][_eq]=${tableData.branch.id}&fields=id,name,parent_category&limit=-1`
        );

        // Group categories by parent_category
        const grouped = catRes.data.reduce((acc, cat) => {
          const parent = cat?.parent_category || "Others";
          if (!acc[parent]) acc[parent] = [];
          acc[parent].push(cat);
          return acc;
        }, {});

        setGroupedCategories(grouped);

        // Set the first tab as selected if categories exist
        if (Object.keys(grouped).length > 0) {
          const firstParentKey = Object.keys(grouped)[0];
          if (grouped[firstParentKey] && grouped[firstParentKey].length > 0) {
            setSelectedTab(grouped[firstParentKey][0].name);
          }
        }
      } catch (e) {
        console.error("Failed to fetch categories:", e);
        toast.error("Failed to load menu categories.");
      }
    };
    fetchCategories();
  }, [tableData]);

  // --- Fetch Menu Items for Selected Tab (Category) ---
  const fetchItemsForCategory = useCallback(async () => {
    if (!selectedTab || !tableData) return;

    // Find the category object from the grouped categories
    let selectedCategoryObject = null;
    for (const parent in groupedCategories) {
      selectedCategoryObject = groupedCategories[parent].find(
        (c) => c.name === selectedTab
      );
      if (selectedCategoryObject) break;
    }

    if (
      !selectedCategoryObject ||
      categoryItemsCache[selectedCategoryObject.id]
    ) {
      return; // Category not found or items already cached
    }

    setLoadingCategoryItems(true);
    try {
      // Fetch details for the specific category, including its menu items
      const res = await apiRequest(
        `${MENU_CATEGORY_ENDPOINT}/${selectedCategoryObject.id}?fields=menu_items.*,menu_items.menu_items_id.labels.labels_id.*,menu_items.menu_items_id.add_ons.add_ons_id.*,menu_items.menu_items_id.*,menu_items.menu_items_id.branches.branches_id.id&limit=-1`
      );

      const filteredItems =
        res.data.menu_items
          ?.filter((mi) =>
            mi.menu_items_id.branches.some(
              (b) => b.branches_id.id === tableData.branch.id
            )
          )
          .map((i) => i.menu_items_id) || []; // Extract the actual menu item object

      setCategoryItemsCache((prev) => ({
        ...prev,
        [selectedCategoryObject.id]: filteredItems,
      }));
    } catch (e) {
      console.error("Failed to load items for selected category:", e);
      toast.error("Failed to load items for selected category.");
    } finally {
      setLoadingCategoryItems(false);
    }
  }, [selectedTab, tableData, groupedCategories, categoryItemsCache]);

  useEffect(() => {
    fetchItemsForCategory();
  }, [fetchItemsForCategory]);

  // --- Scroll Listener to Toggle Button Label ---
  useEffect(() => {
    const handleScroll = () => setShowGoToCart(window.scrollY < 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoize add-to-cart handler
  const handleAddToCart = useCallback(
    (item, selectedAddOns = []) => {
      const itemIdentifier = `${item.id}-${selectedAddOns
        .map((ao) => ao.id)
        .sort()
        .join("-")}`;
      const exists = cart.find((c) => c.itemIdentifier === itemIdentifier);
      const addOnsPrice = selectedAddOns.reduce((sum, ao) => sum + ao.price, 0);
      const itemTotalPrice = item.price + addOnsPrice;
      if (exists) {
        setCart(
          cart.map((c) =>
            c.itemIdentifier === itemIdentifier ? { ...c, qty: c.qty + 1 } : c
          )
        );
      } else {
        setCart([
          ...cart,
          {
            ...item,
            qty: 1,
            selectedAddOns: selectedAddOns,
            itemTotalPrice: itemTotalPrice,
            itemIdentifier: itemIdentifier,
          },
        ]);
      }
      toast.success(`${item.name} added to cart`);
    },
    [cart]
  );

  // Memoize remove-from-cart handler
  const handleRemoveFromCart = useCallback(
    (itemIdentifier) => {
      setCart(cart.filter((item) => item.itemIdentifier !== itemIdentifier));
      toast.info("Item removed from cart.");
    },
    [cart]
  );

  // Memoize place order handler
  const handlePlaceOrder = useCallback(async () => {
    if (cart.length === 0) {
      toast.error("Please select at least one item to place an order.");
      return;
    }
    try {
      const orderPayload = {
        Name: name.trim() || `order_${Date.now()}`,
        Mobile_Number: mobile.trim(),
        status: "pending",
        table: tableData.id,
        Menu_Items: {
          create: cart.map((item) => ({
            menu_items_id: { id: item.id },
            qty: item.qty.toString(),
            selected_add_ons: {
              create: [],
              update: item.selectedAddOns.map((ao) => ({
                selected_add_ons: "+",
                id: ao.id,
              })),
              delete: [],
            },
          })),
          update: [],
          delete: [],
        },
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
  }, [cart, name, mobile, tableData]);

  if (loading) return <BurgerSpinner />;
  if (!tableData)
    return (
      <div className="text-center mt-5">
        Oops! We couldn't find your table or menu. Please check the QR code
        again.
      </div>
    );

  // Find the currently selected category's ID to retrieve items from cache
  const currentSelectedCategory = Object.values(groupedCategories)
    .flat()
    .find((cat) => cat.name === selectedTab);
  const currentItems = currentSelectedCategory
    ? categoryItemsCache[currentSelectedCategory.id] || []
    : [];

  return (
    <div
      className="container-fluid p-0"
      style={{
        minHeight: "100vh",
        overflowY: "visible",
        WebkitOverflowScrolling: "touch", // for iOS smooth scrolling
      }}
    >
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        style={{ fontSize: "0.8rem", padding: "3px" }}
      />
      {/* Header Section */}
      {/* <div className="header-section">
        <div className="header-logo">
          {homeData?.logo && (
            <ImageLoader
              imageId={homeData.logo}
              altText="Company Logo"
              className="company-logo mb-2"
              style={{
                width: "80px",
                height: "80px",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              loading="lazy"
            />
          )}
        </div>
        <div className="header-details">
          <h4
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: 0,
              fontSize: "20px",
            }}
          >
            QuickDine - {homeData?.Name || ""}
            <span
              style={{
                width: 24,
                height: 24,
                backgroundColor: "white",
                color: "black",
                borderRadius: "50%",
                fontSize: 12,
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tableData.table_number}
            </span>
          </h4>
        </div>
      </div> */}
      <div
        className="header-section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px",
        }}
      >
        {/* Logo Left */}
        <div className="header-logo" style={{ flex: "0 0 auto" }}>
          {homeData?.logo && (
            <ImageLoader
              imageId={homeData.logo}
              altText="Company Logo"
              className="company-logo mb-2"
              style={{
                width: "80px",
                height: "80px",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              loading="lazy"
            />
          )}
        </div>

        {/* Name Center */}
        <div
          className="header-details"
          style={{ flex: "1", textAlign: "center" }}
        >
          <h4 style={{ marginLeft: "15px", fontSize: "18px" }}>
            QuickDine - {homeData?.Name || ""}
          </h4>
        </div>

        {/* Table Right */}
        <div style={{ flex: "0 0 auto" }}>
          <span
            style={{
              width: 32,
              height: 32,
              backgroundColor: "white",
              color: "black",
              borderRadius: "50%",
              fontSize: 14,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #ccc",
            }}
          >
            {tableData.table_number}
          </span>
        </div>
      </div>
      <div className="container mt-4 main-content-area">
        {/* Optional Customer Info Card */}
        {homeData?.customer_details && (
          <Card className="customer-info-card mb-2">
            <div className="card-header-styled">
              <h4 className="card-title-styled">
                Welcome to{" "}
                <span className="highlight-text">{tableData.branch?.name}</span>{" "}
                - Table{" "}
                <span className="highlight-text">{tableData.table_number}</span>
              </h4>
            </div>
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
          </Card>
        )}

        {/* --- Menu Section by Parent Category --- */}
        <div ref={menuRef}></div>
        {Object.entries(groupedCategories).map(
          ([parentCategoryName, categoriesInGroup]) => (
            <div key={parentCategoryName} className="mb-4">
              {/* Display Parent Category Name */}
              <h5 className="fw-bold text-uppercase mb-3">
                {parentCategoryName}
              </h5>

              {/* Tabs for Sub-Categories within this Parent Category */}
              <Tabs
                activeKey={selectedTab}
                onSelect={setSelectedTab}
                className="mb-3 custom-tabs-container"
              >
                {categoriesInGroup.map((cat) => (
                  <Tab eventKey={cat.name} title={cat.name} key={cat.id}>
                    {loadingCategoryItems && selectedTab === cat.name ? (
                      <div className="text-center py-5">
                        {/* <BurgerSpinner /> */}
                        <p>Loading items...</p>
                      </div>
                    ) : (
                      <Row className="g-2">
                        {currentItems.length > 0 ? (
                          currentItems.map((item) => (
                            <Col xs={12} md={4} key={item.id}>
                              <MemoizedMenuItemCard
                                item={item}
                                handleAddToCart={handleAddToCart}
                              />
                            </Col>
                          ))
                        ) : (
                          <Col xs={12}>
                            <p className="text-center text-muted">
                              No menu items found for this category.
                            </p>
                          </Col>
                        )}
                      </Row>
                    )}
                  </Tab>
                ))}
              </Tabs>
            </div>
          )
        )}
        {/* --- End Menu Section by Parent Category --- */}

        {/* Cart Section */}
        <div ref={cartRef}></div>
        <Card className="p-3 mt-4 shadow-sm cart-card">
          <h5>🛒 Your Cart</h5>
          {cart.length === 0 ? (
            <p className="text-muted">No items added yet. Start Browse!</p>
          ) : (
            <ListGroup variant="flush">
              {cart.map((item) => (
                <ListGroup.Item
                  key={item.itemIdentifier}
                  className="d-flex justify-content-between align-items-center cart-item"
                >
                  <div style={{ fontSize: "0.8em" }}>
                    <strong>{item.name}</strong> (Qty: {item.qty})
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <div className="cart-addons-display">
                        <small>
                          Add-ons:{" "}
                          {item.selectedAddOns.map((ao) => ao.name).join(", ")}
                        </small>
                      </div>
                    )}
                    <div className="fw-bold" style={{ fontSize: "0.9em" }}>
                      Rs {item.itemTotalPrice}
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveFromCart(item.itemIdentifier)}
                  >
                    Remove
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          {/* Cart Total */}
          <div className="mt-3 text-end fw-bold">
            Total: Rs{" "}
            {cart
              .reduce(
                (total, item) => total + item.itemTotalPrice * item.qty,
                0
              )
              .toFixed(2)}
          </div>

          <div className="text-end mt-3">
            <Button
              variant="success"
              onClick={handlePlaceOrder}
              // disabled={cart.length === 0}
              disabled={
                cart.length === 0 ||
                cart.some((item) => item.itemTotalPrice <= 0)
              }
            >
              Place Order
            </Button>
          </div>
        </Card>
      </div>
      <div className="header-section mt-2"></div> {/* Just a spacer */}
      {/* Floating Scroll Button */}
      <Button
        variant="dark"
        className="floating-toggle-btn"
        style={{
          zIndex: 1000,
          pointerEvents: "auto", // allow button interaction
        }}
        onClick={() =>
          showGoToCart
            ? cartRef.current?.scrollIntoView({ behavior: "smooth" })
            : menuRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      >
        {showGoToCart ? "⬇️ Go to Cart" : "⬆️ Menu"}
      </Button>
    </div>
  );
};

// Memoized MenuItemCard for performance
const MenuItemCard = ({ item, handleAddToCart }) => {
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Memoize add-on change handler
  const handleAddOnChange = useCallback((addOn) => {
    setSelectedAddOns((prev) =>
      prev.some((ao) => ao.id === addOn.id)
        ? prev.filter((ao) => ao.id !== addOn.id)
        : [...prev, addOn]
    );
  }, []);

  const currentItemPrice =
    item.price + selectedAddOns.reduce((sum, ao) => sum + ao.price, 0);

  return (
    <Card className="p-1 mb-0 menu-item-card">
      <div className="d-flex flex-row align-items-center">
        <div style={{ width: 90, height: 90, flexShrink: 0 }}>
          {item.image ? (
            <ImageLoader
              altText={item.name}
              imageId={item.image}
              className="img-fluid rounded"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          ) : (
            <img
              src={demoFood}
              alt={item.name}
              className="img-fluid rounded"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          )}
        </div>
        <div className="px-3 flex-grow-1">
          <h6 className="mb-1 fw-bold" style={{ fontSize: "0.8em" }}>
            {item.name}
          </h6>
          <span style={{ fontFamily: "Montserrat" }}>
            <p className="text-muted mb-0" style={{ fontSize: "0.7em" }}>
              {item.description || "No description available."}
            </p>
          </span>
          {item.labels && item.labels.length > 0 && (
            <div className="item-labels">
              {item.labels.map((label) => (
                <span key={label.labels_id.id} className="menu-item-label">
                  {label.labels_id.label_name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-end">
          <div
            className="fw-bold mb-1"
            style={{ fontSize: "0.7em", marginRight: "10px" }}
          >
            {currentItemPrice ? `Rs ${currentItemPrice}` : "0"}
          </div>
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => handleAddToCart(item, selectedAddOns)}
            style={{ fontWeight: "bold", marginRight: "10px" }}
          >
            ADD
          </Button>
        </div>
      </div>

      {item.add_ons && item.add_ons.length > 0 && (
        <Accordion className="add-ons-accordion">
          <Accordion.Item eventKey="0">
            <Accordion.Header
              onClick={() => setIsAccordionOpen((open) => !open)}
            >
              {isAccordionOpen ? "Hide Add-ons" : "Show Add-ons"}
            </Accordion.Header>
            <Accordion.Body className="add-ons-body">
              {item.add_ons.map((addOn) => (
                <Form.Check
                  key={addOn.add_ons_id.id}
                  type="checkbox"
                  id={`addon-${item.id}-${addOn.add_ons_id.id}`}
                  label={`${addOn.add_ons_id.name} (Rs ${addOn.add_ons_id.price})`}
                  checked={selectedAddOns.some(
                    (ao) => ao.id === addOn.add_ons_id.id
                  )}
                  onChange={() => handleAddOnChange(addOn.add_ons_id)}
                  className="add-on-checkbox"
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
    </Card>
  );
};

const MemoizedMenuItemCard = memo(MenuItemCard);

export default QRCodePage;
