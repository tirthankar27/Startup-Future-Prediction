import React, { useState } from "react";
import { predictRisk, getSurvival } from "../services/api";
import RiskCard from "./RiskCard";
import SurvivalChart from "./SurvivalChart";
import ExplainCard from "./ExplainCard";
import "./dashboard.css";

export default function Dashboard() {

  const [form, setForm] = useState({
    funding_total_usd: "",
    funding_rounds: "",
    startup_age_years: ""
  });

  const [riskData, setRiskData] = useState(null);
  const [survivalData, setSurvivalData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const riskRes = await predictRisk(form);
      const survivalRes = await getSurvival(form);

      setRiskData(riskRes.data);
      setSurvivalData(survivalRes.data);

    } catch (err) {
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">

      {/* HERO SECTION */}
      <div className="dashboard-hero">
        <h1>Startup Risk Intelligence</h1>
        <p>AI-powered failure probability & survival forecasting</p>
      </div>

      {/* MAIN GRID */}
      <div className="dashboard-grid">

        {/* INPUT PANEL */}
        <div className="glass-card input-card">
          <h2>Input Parameters</h2>

          <div className="form-group">

            <input
              name="funding_total_usd"
              placeholder="Total Funding (USD)"
              type="number"
              onChange={handleChange}
            />

            <input
              name="funding_rounds"
              placeholder="Funding Rounds"
              type="number"
              onChange={handleChange}
            />

            <input
              name="startup_age_years"
              placeholder="Startup Age (Years)"
              type="number"
              step="0.1"
              onChange={handleChange}
            />

            <button
              className="analyze-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze Risk"}
            </button>

          </div>
        </div>

        {/* RISK OUTPUT */}
        {riskData && (
          <div className="glass-card">
            <RiskCard data={riskData} />
          </div>
        )}

      </div>

      {/* EXPLAINABILITY */}
      {riskData?.explanation && (
        <div className="glass-card explain-card">
          <ExplainCard data={riskData.explanation} />
        </div>
      )}

      {/* SURVIVAL CHART */}
      {survivalData && (
        <div className="glass-card chart-card">
          <SurvivalChart data={survivalData} />
        </div>
      )}

    </div>
  );
}