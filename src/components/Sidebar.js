// src/components/Sidebar.js
import React, { useEffect } from "react";
import { Nav, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaFileAlt,
  FaChartBar,
  FaMoneyBillWave,
  FaUsers,
  FaChalkboardTeacher,
  FaSignOutAlt,
  FaGlobe,
} from "react-icons/fa";
import styled from "styled-components";
import directusClient from "../api/directusClient";
import { ROLE_ADMIN, ROLE_OFFICER, ROLE_GUEST } from "../api/roles.js";
import { useTranslation } from "react-i18next";

const SidebarContainer = styled(Nav)`
  height: 100vh;
  width: 250px;
  background-color: #58a6f0; /* Light blue background */
  border-right: 1px solid #e0e0e0;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
`;

const SidebarHeader = styled.h2`
  color: white;
  text-align: center;
  font-weight: bold;
  margin-bottom: 40px; /* Add some space below the header */
`;

const SidebarLink = styled(Nav.Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white; /* White text color */
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s;
  text-decoration: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2); /* Lighten on hover */
    color: white; /* Maintain white color on hover */
    border-radius: 4px;
  }

  &.active {
    background-color: rgba(
      255,
      255,
      255,
      0.4
    ); /* Light background for active item */
    color: #007bff; /* Change text color for active item */
  }

  &.active:hover {
    background-color: rgba(255, 255, 255, 0.4);
    color: #007bff;
  }
`;

const IconWrapper = styled.div`
  font-size: 1.2em; /* Adjust icon size */
  margin-right: 10px;
`;

const LanguageSwitcher = styled(Dropdown)`
  margin-top: auto;
  padding: 12px 20px;
  cursor: pointer;
  color: white; /* White text color */
  font-weight: 500;

  .dropdown-toggle::after {
    display: none; /* Hide dropdown arrow */
  }

  .dropdown-item {
    color: #333; /* Color for dropdown items */
  }

  .dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.2); /* Lighten on hover */
  }
`;

const Sidebar = ({ role }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const sidebarItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      roles: [ROLE_ADMIN, ROLE_GUEST],
      icon: <FaHome />,
    },
    {
      name: "Drivers",
      path: "/drivers",
      roles: [ROLE_ADMIN],
      icon: <FaUser />,
    },
    {
      name: "Conductors",
      path: "/conductors",
      roles: [ROLE_ADMIN],
      icon: <FaUsers />,
    },
    {
      name: "Daily Routes",
      path: "/daily-route",
      roles: [ROLE_ADMIN],
      icon: <FaFileAlt />,
    },
    {
      name: "Payments",
      path: "/payments",
      roles: [ROLE_ADMIN],
      icon: <FaMoneyBillWave />,
    },
    {
      name: "Reports",
      path: "/reports",
      roles: [ROLE_ADMIN],
      icon: <FaChartBar />,
    },
    {
      name: "Co-Monitor",
      path: "/co-monitor",
      roles: [ROLE_ADMIN],
      icon: <FaChalkboardTeacher />,
    },
    {
      name: "Dr-Monitor",
      path: "/dr-monitor",
      roles: [ROLE_ADMIN],
      icon: <FaChalkboardTeacher />,
    },
    {
      name: "Profile",
      path: "/profile",
      roles: [ROLE_ADMIN, ROLE_OFFICER],
      icon: <FaUser />,
    },
    {
      name: "Logout",
      path: "/",
      roles: [ROLE_ADMIN, ROLE_OFFICER],
      icon: <FaSignOutAlt />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("name");

    delete directusClient.defaults.headers.common["Authorization"];
    navigate("/");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <SidebarContainer>
      <SidebarHeader>HPL TRAVELS</SidebarHeader>
      {sidebarItems
        .filter((item) => item.roles.includes(role))
        .map((item) =>
          item.name === "logout" ? (
            <SidebarLink
              as="a"
              onClick={handleLogout}
              key={item.name}
              style={{ cursor: "pointer", textDecoration: "none" }}
            >
              <IconWrapper>{item.icon}</IconWrapper>
              {/* {t(`sidebar.${item.name}`)} */}
              {item.name}
            </SidebarLink>
          ) : (
            <SidebarLink as={Link} to={item.path} key={item.name}>
              <IconWrapper>{item.icon}</IconWrapper>
              {/* {t(`sidebar.${item.name}`)} */}
              {item.name}
            </SidebarLink>
          )
        )}

      <LanguageSwitcher>
        <Dropdown>
          <Dropdown.Toggle as="button">
            <IconWrapper>
              <FaGlobe />
            </IconWrapper>
            {i18n.language === "en"
              ? "English"
              : i18n.language === "es"
              ? "Español"
              : "සිංහල"}
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
      </LanguageSwitcher>
    </SidebarContainer>
  );
};

export default Sidebar;
