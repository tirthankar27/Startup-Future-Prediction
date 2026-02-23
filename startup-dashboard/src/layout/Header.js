import React from "react";

export default function Header() {
  return (
    <div style={headerStyle}>
      <h2 style={{ margin: 0 }}>Dashboard</h2>
    </div>
  );
}

const headerStyle = {
  height: "70px",
  backgroundColor: "#111827",
  padding: "0 30px",
  display: "flex",
  alignItems: "center",
  borderBottom: "1px solid #1f2937"
};