import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function SurvivalChart({ data }) {

  const curveData = data.curve.map(point => ({
    time: point.time,
    survival: point.survival * 100
  }));

  return (
    <div style={{ height: 350 }}>
      <h2 style={{ marginBottom: 20 }}>Survival Curve</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={curveData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#cbd5e1" />
          <YAxis domain={[0,100]} stroke="#cbd5e1" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="survival"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}