import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function SurvivalChart({ data }) {

  const chartData = [
    { year: "1 Year", survival: data["1_year_survival"] },
    { year: "3 Years", survival: data["3_year_survival"] },
    { year: "5 Years", survival: data["5_year_survival"] }
  ];

  return (
    <div className="card" style={{ height: "400px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        Survival Probability
      </h2>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="#334155" />
          <XAxis dataKey="year" stroke="white" />
          <YAxis domain={[0, 1]} stroke="white" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="survival"
            stroke="#3b82f6"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}