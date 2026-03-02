import React, { useState } from "react";
import {
  FiHome,
  FiBarChart2,
  FiFileText,
  FiSettings
} from "react-icons/fi";
import "./sidebar.css";

export default function Sidebar() {

  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <FiHome /> },
    { name: "Analytics", icon: <FiBarChart2 /> },
    { name: "Reports", icon: <FiFileText /> },
    { name: "Settings", icon: <FiSettings /> }
  ];

  return (
    <div className="sidebar">

      <div className="sidebar-logo">
        🚀 Venture <span>Oracle</span>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className={`sidebar-item ${
              active === item.name ? "active" : ""
            }`}
            onClick={() => setActive(item.name)}
          >
            <div className="icon">{item.icon}</div>
            <span>{item.name}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        AI Risk Intelligence v1.0
      </div>

    </div>
  );
}