// src/components/Sidebar.js
import React, { useEffect, useState } from "react";
import { Nav, Dropdown, Button } from "react-bootstrap"; // Import Button
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import {
  FaHome,
  FaUser,
  FaFileAlt,
  FaUsers,
  FaSignOutAlt,
  FaGlobe,
  FaUtensils,
  FaMoneyBillWave,
  FaClipboardList,
  FaChair,
  FaBars, // Hamburger icon
  FaTimes, // Close icon
  FaHourglassHalf, // For pending orders
  FaPlayCircle, // For in-progress orders
  FaChartLine,
  FaAlignRight, // For reports
} from "react-icons/fa";
import styled from "styled-components";
import directusClient from "../api/directusClient";
import {
  ROLE_RES_ADMIN,
  ROLE_CUSTOMER,
  ROLE_GUEST,
  ROLE_SUPER_ADMIN,
} from "../api/roles.js";
import { useTranslation } from "react-i18next";

// --- Styled Components ---
const MAIN_COLOR = "var(--main-color)";

const SidebarContainer = styled(Nav)`
  height: 100vh;
  width: ${(props) =>
    props.$isCollapsed ? "80px" : "300px"};
  background: linear-gradient(
    to bottom,
    ${MAIN_COLOR},
    ${MAIN_COLOR}
  );
  /* Orange gradient */
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  transition: width 0.3s ease-in-out, transform 0.3s ease-in-out; /* Smooth transition */
  z-index: 1050; /* Above most content, below modals */
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 250px; /* Full width when open on mobile */
    transform: translateX(
      ${(props) => (props.$isMobileOpen ? "0" : "-100%")}
    ); /* Slide in/out */
  }
`;

const SidebarHeader = styled.h2`
  color: white;
  text-align: center;
  font-weight: bold;
  margin-bottom: 40px;
  font-size: ${(props) => (props.$isCollapsed ? "1.2em" : "1.8em")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px;
  transition: font-size 0.3s ease-in-out;
`;

const SidebarLink = styled(Nav.Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s, padding 0.3s;
  text-decoration: none;
  border-radius: 8px; /* Slightly rounded */
  margin: 0 10px 5px 10px; /* Margin for separation */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
  }

  &.active {
    background-color: rgba(255, 255, 255, 0.4);
    color: #333; /* Darker color for active text */
    font-weight: 700; /* Bolder for active */
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2); /* Inner shadow for depth */
  }

  &.active:hover {
    background-color: rgba(255, 255, 255, 0.5);
    color: #333;
  }

  ${(props) =>
    props.$isCollapsed &&
    `
    padding: 12px 0; /* Center icon when collapsed */
    justify-content: center;
    span { display: none; } /* Hide text */
    &:hover { background-color: rgba(255, 255, 255, 0.2); }
    &.active { background-color: rgba(255, 255, 255, 0.4); }
  `}
`;

const IconWrapper = styled.div`
  font-size: 1.3em; /* Slightly larger icon size */
  margin-right: ${(props) => (props.$isCollapsed ? "0" : "10px")};
  width: ${(props) => (props.$isCollapsed ? "100%" : "auto")};
  text-align: ${(props) => (props.$isCollapsed ? "center" : "left")};
  transition: margin-right 0.3s ease-in-out, width 0.3s ease-in-out;
`;

// Footer: Styling for the copyright/info footer
const Footer = styled.footer`
  margin-top: 40px; /* More space above footer */
  text-align: center;
  color:rgb(255, 255, 255); /* Muted grey color */
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1.5;

  strong {
    color:rgb(210, 210, 210); /* Darker grey for strong text */
  }
`;

const LanguageSwitcher = styled(Dropdown)`
  margin-top: auto; /* Pushes it to the bottom */
  padding: 12px 20px;
  cursor: pointer;
  color: white;
  font-weight: 500;
  border-top: 1px solid rgba(255, 255, 255, 0.2); /* Separator line */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .dropdown-toggle {
    color: white;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0;
    justify-content: ${(props) =>
      props.$isCollapsed ? "center" : "flex-start"};

    &::after {
      display: ${(props) =>
        props.$isCollapsed
          ? "none"
          : "block"}; /* Hide dropdown arrow when collapsed */
      margin-left: auto;
    }
    &:hover {
      background: none;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .dropdown-menu {
    background-color: #f8f9fa; /* Light background for dropdown menu */
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .dropdown-item {
    color: #333;
    padding: 8px 15px;
    &:hover {
      background-color: #ffc107; /* Orange hover */
      color: white;
    }
    &.active {
      background-color: ${MAIN_COLOR};
      color: white;
    }
  }

  ${(props) =>
    props.$isCollapsed &&
    `
    padding: 12px 0;
    .dropdown-toggle span { display: none; }
  `}
`;

const ToggleButton = styled(Button)`
  position: fixed;
  bottom: 15px;
  left: ${(props) =>
    props.$isCollapsed ? "90px" : "310px"}; /* Adjust position */
  background-color: #014F42;
  border: none;
  color: white;
  font-size: 1.5em;
  padding: 8px 12px;
  border-radius: 8px;
  z-index: 1060; /* Above sidebar */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: left 0.3s ease-in-out;

  &:hover {
    background-color: #e07b00;
  }

  @media (max-width: 768px) {
    left: 15px; /* Fixed position on mobile */
    top: 15px;
    background-color: #014F42; /* Visible on mobile */
    display: block; /* Show on mobile */
  }

  @media (min-width: 769px) {
    display: block; /* Always show on desktop */
  }
`;

const Overlay = styled.div`
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
    z-index: 1040; /* Below sidebar, above content */
    display: ${(props) => (props.$isVisible ? "block" : "none")};
  }
  @media (min-width: 769px) {
    display: none; /* Hide on desktop */
  }
`;

// --- Sidebar Component ---
const Sidebar = ({ role }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation(); // To get current path for active link
  const [isCollapsed, setIsCollapsed] = useState(false); // State for desktop collapse
  const [isMobileOpen, setIsMobileOpen] = useState(false); // State for mobile sidebar

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }

    // Close mobile sidebar on route change
    setIsMobileOpen(false);
  }, [i18n, location]);

  // Handle screen size changes for sidebar collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(false); // Force not collapsed on mobile
        setIsMobileOpen(false); // Ensure it's closed by default
      } else {
        // You can set a default collapsed state for desktop here if desired
        // setIsCollapsed(false); // or true
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call on initial render

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      roles: [ROLE_RES_ADMIN, ROLE_GUEST, ROLE_SUPER_ADMIN],
      icon: <FaHome />,
    },
    {
      name: "Pending Orders",
      path: "/p-orders",
      roles: [ROLE_RES_ADMIN, ROLE_SUPER_ADMIN],
      icon: <FaHourglassHalf />,
    },
    {
      name: "Inprogress Orders",
      path: "/i-orders",
      roles: [ROLE_RES_ADMIN, ROLE_SUPER_ADMIN],
      icon: <FaPlayCircle />,
    },
    {
      name: "Completed Orders",
      path: "/c-orders",
      roles: [ROLE_RES_ADMIN, ROLE_SUPER_ADMIN],
      icon: <FaAlignRight />,
    },
    {
      name: "Tables", // New: Table Management
      path: "/qr-tables",
      roles: [ROLE_RES_ADMIN, ROLE_SUPER_ADMIN],
      icon: <FaChair />,
    },
    {
      name: "Reports",
      path: "/reports",
      roles: [ROLE_RES_ADMIN, ROLE_SUPER_ADMIN],
      icon: <FaChartLine />,
    },
    // {
    //   name: "Users", // Adding Users page
    //   path: "/users",
    //   roles: [ROLE_RES_ADMIN, ROLE_SUPER_ADMIN],
    //   icon: <FaUsers />,
    // },
    // {
    //   name: "Menu Items", // New: Menu Management
    //   path: "/menu-items",
    //   roles: [ROLE_RES_ADMIN, ROLE_SUPER_ADMIN],
    //   icon: <FaUtensils />,
    // },

    {
      name: "Profile",
      path: "/profile",
      roles: [ROLE_RES_ADMIN, ROLE_CUSTOMER, ROLE_SUPER_ADMIN],
      icon: <FaUser />,
    },
    {
      name: "Logout",
      path: "/", // Logout action
      roles: [ROLE_RES_ADMIN, ROLE_CUSTOMER, ROLE_SUPER_ADMIN],
      icon: <FaSignOutAlt />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("name");
    localStorage.removeItem("branch_id");

    delete directusClient.defaults.headers.common["Authorization"];
    navigate("/");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <>
      <ToggleButton
        onClick={toggleSidebar}
        $isCollapsed={isCollapsed}
        className="d-lg-none d-block" // Show only on small screens for initial click
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </ToggleButton>

      <ToggleButton
        onClick={toggleSidebar}
        $isCollapsed={isCollapsed}
        className="d-none d-lg-block" // Show only on large screens for collapse/expand
      >
        {isCollapsed ? <FaBars /> : <FaTimes />}
      </ToggleButton>

      {/* Overlay for mobile when sidebar is open */}
      <Overlay
        $isVisible={isMobileOpen}
        onClick={() => setIsMobileOpen(false)}
      />

      <SidebarContainer $isCollapsed={isCollapsed} $isMobileOpen={isMobileOpen}>
        <SidebarHeader $isCollapsed={isCollapsed}>
          {isCollapsed ? "QR" : "QuickDineQR"}
          <hr></hr>
          {isCollapsed ? "" : "Restaurant Name"}
        </SidebarHeader>
        {sidebarItems
          .filter((item) => item.roles.includes(role))
          .map((item) =>
            item.name === "Logout" ? ( // Check for "Logout" explicitly
              <SidebarLink
                as="a"
                onClick={handleLogout}
                key={item.name}
                $isCollapsed={isCollapsed}
                className={location.pathname === item.path ? "active" : ""} // Set active based on path
                style={{ cursor: "pointer" }} // Ensure pointer cursor
              >
                <IconWrapper $isCollapsed={isCollapsed}>
                  {item.icon}
                </IconWrapper>
                <span>{item.name}</span>
              </SidebarLink>
            ) : (
              <SidebarLink
                as={Link}
                to={item.path}
                key={item.name}
                $isCollapsed={isCollapsed}
                className={location.pathname === item.path ? "active" : ""} // Set active based on path
              >
                <IconWrapper $isCollapsed={isCollapsed}>
                  {item.icon}
                </IconWrapper>
                <span>{item.name}</span>
              </SidebarLink>
            )
          )}

        {/* <LanguageSwitcher $isCollapsed={isCollapsed}>
          <Dropdown>
            <Dropdown.Toggle as="button">
              <IconWrapper $isCollapsed={isCollapsed}>
                <FaGlobe />
              </IconWrapper>
              <span>
                {i18n.language === "en"
                  ? "English"
                  : i18n.language === "es"
                  ? "Español"
                  : "සිංහල"}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => changeLanguage("en")}>
                English
              </Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage("es")}>
                Español
              </Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage("si")}>
                සිංහල
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </LanguageSwitcher> */}

        <Footer>
          <strong>QuickDine - QR Code Restaurant Menu System</strong>
          <br />
          Powered by ETech Solutions
          <br />
          Contact: 0702534588 / 0775164010
          <br />
          &copy; 2025. All rights reserved.
        </Footer>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
