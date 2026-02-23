import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div style={layoutContainer}>
      <Sidebar />

      <div style={mainSection}>
        <Header />

        <div style={contentArea}>
          {children}
        </div>
      </div>
    </div>
  );
}

const layoutContainer = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#0f172a"
};

const mainSection = {
  flex: 1,
  display: "flex",
  flexDirection: "column"
};

const contentArea = {
  padding: "40px"
};