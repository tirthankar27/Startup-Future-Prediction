import React from "react";

export default function ExplainCard({ data }) {

  const sorted = Object.entries(data)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 5);

  const maxAbs = Math.max(...sorted.map(([_, v]) => Math.abs(v)));

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Key Risk Drivers</h2>

      {sorted.map(([feature, value]) => {
        const width = (Math.abs(value) / maxAbs) * 100;
        const color = value > 0 ? "#ef4444" : "#10b981";

        return (
          <div key={feature} style={{ marginBottom: 15 }}>
            <div style={{ fontSize: 14 }}>{feature}</div>

            <div style={{
              background: "#1e293b",
              borderRadius: 8,
              overflow: "hidden",
              height: 12
            }}>
              <div style={{
                width: `${width}%`,
                background: color,
                height: "100%"
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}