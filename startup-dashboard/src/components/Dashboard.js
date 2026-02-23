import React, { useState } from "react";
import { predictRisk, getSurvival } from "../services/api";
import RiskCard from "./RiskCard";
import SurvivalChart from "./SurvivalChart";

export default function Dashboard() {

  const [form, setForm] = useState({
    funding_total_usd: "",
    funding_rounds: "",
    startup_age_years: ""
  });

  const [riskData, setRiskData] = useState(null);
  const [survivalData, setSurvivalData] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const riskRes = await predictRisk(form);
      const survivalRes = await getSurvival(form);

      setRiskData(riskRes.data);
      setSurvivalData(survivalRes.data);
    } catch (err) {
      alert("Prediction failed");
    }
  };

  return (
    <div style={container}>

      <div style={topSection}>

        <div className="card" style={{ width: "350px" }}>
          <h2 style={{ marginBottom: "20px" }}>Input Parameters</h2>

          <div style={formStyle}>
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

            <button onClick={handleSubmit}>
              Analyze Risk
            </button>
          </div>
        </div>

        {riskData && <RiskCard data={riskData} />}

      </div>

      {survivalData && (
        <div style={{ marginTop: "50px" }}>
          <SurvivalChart data={survivalData} />
        </div>
      )}

    </div>
  );
}

const container = {
  maxWidth: "1200px",
  margin: "0 auto"
};

const topSection = {
  display: "flex",
  alignItems: "flex-start",
  gap: "40px",
  flexWrap: "wrap"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px"
};