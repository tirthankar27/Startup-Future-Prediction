import React from "react";

export default function ExplainCard({ data }) {

  const sorted = Object.entries(data)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 5);

  return (
    <div className="card" style={{ marginTop: "30px" }}>
      <h2>Key Risk Drivers</h2>

      {sorted.map(([feature, value]) => (
        <div key={feature} style={{ marginTop: "10px" }}>
          {feature}: {value.toFixed(4)}
        </div>
      ))}
    </div>
  );
}