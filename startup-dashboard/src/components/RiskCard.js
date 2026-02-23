import React from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from "recharts";

export default function RiskCard({ data }) {

  const { failure_probability, risk_level } = data;

  const percentage = (failure_probability * 100);

  const riskColor =
    risk_level === "High"
      ? "#ef4444"
      : risk_level === "Medium"
      ? "#f59e0b"
      : "#10b981";

  const chartData = [
    {
      name: "Risk",
      value: percentage,
      fill: riskColor
    }
  ];

  return (
    <div className="card" style={{ width: "350px", textAlign: "center" }}>
      <h2 style={{ marginBottom: "20px" }}>
        Risk Assessment
      </h2>

      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              minAngle={15}
              background
              clockWise
              dataKey="value"
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <h1 style={{
        fontSize: "36px",
        marginTop: "-40px",
        color: riskColor
      }}>
        {percentage.toFixed(2)}%
      </h1>

      <div style={{
        marginTop: "10px",
        fontSize: "16px",
        fontWeight: "bold",
        color: riskColor
      }}>
        {risk_level} Risk
      </div>
    </div>
  );
}