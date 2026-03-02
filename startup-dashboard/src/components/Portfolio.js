import React, { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Portfolio() {

  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "http://localhost:5001/portfolio",
      formData
    );

    setData(res.data.records);
    setSummary(res.data.summary);
  };

  return (
    <div style={{ padding: 40 }}>

      <h1>Portfolio Analytics</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleUpload}
        style={{ marginTop: 20 }}
      />

      {summary && (
        <div style={{ marginTop: 30 }}>
          <h3>Portfolio Summary</h3>
          <p>Average Risk: {(summary.average_risk * 100).toFixed(2)}%</p>
          <p>High Risk: {summary.high_risk_count}</p>
          <p>Medium Risk: {summary.medium_risk_count}</p>
          <p>Low Risk: {summary.low_risk_count}</p>
        </div>
      )}

      {data && (
        <div style={{ marginTop: 40, height: 300 }}>
          <h3>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="risk_level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="failure_probability" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data && (
        <table
          border="1"
          style={{ marginTop: 40, width: "100%", textAlign: "center" }}
        >
          <thead>
            <tr>
              <th>Funding</th>
              <th>Rounds</th>
              <th>Age</th>
              <th>Risk %</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.funding_total_usd}</td>
                <td>{row.funding_rounds}</td>
                <td>{row.startup_age_years}</td>
                <td>{(row.failure_probability * 100).toFixed(2)}</td>
                <td>{row.risk_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}