import React from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from "recharts";
import "./riskcard.css";

export default function RiskCard({ data }) {

  const { failure_probability, risk_level } = data;
  const percentage = failure_probability * 100;

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
    <div className="risk-card">

      <h2 className="risk-title">Risk Assessment</h2>

      <div className="risk-chart-wrapper">
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="75%"
            outerRadius="100%"
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              background
              clockWise
              dataKey="value"
              cornerRadius={20}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div
          className="risk-center-value"
          style={{ color: riskColor }}
        >
          {percentage.toFixed(1)}%
        </div>
      </div>

      <div
        className={`risk-level ${risk_level.toLowerCase()}`}
      >
        {risk_level} Risk
      </div>

    </div>
  );
}