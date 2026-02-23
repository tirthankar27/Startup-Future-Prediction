import React from "react";

export default function Sidebar() {
  return (
    <div style={sidebarStyle}>
      <h2 style={{ marginBottom: "40px" }}>🚀 RiskAI</h2>

      <div style={menuItem}>Dashboard</div>
      <div style={menuItem}>Analytics</div>
      <div style={menuItem}>Reports</div>
      <div style={menuItem}>Settings</div>
    </div>
  );
}

const sidebarStyle = {
  width: "240px",
  backgroundColor: "#0b1220",
  padding: "30px 20px",
  borderRight: "1px solid #1f2937"
};

const menuItem = {
  marginBottom: "20px",
  padding: "10px 12px",
  borderRadius: "8px",
  color: "#9ca3af",
  cursor: "pointer"
};