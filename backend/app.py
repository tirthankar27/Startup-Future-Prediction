from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np

# IMPORTANT: import class so pickle can find it
from feature_engineering import FeatureEngineer

app = Flask(__name__)
CORS(app)

pipeline = joblib.load("backend/production_pipeline.pkl")
cox_model = joblib.load("backend/cox_model.pkl")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        input_df = pd.DataFrame([data])

        probability = pipeline.predict_proba(input_df)[0][1]

        if probability > 0.15:
            risk_level = "High"
        elif probability > 0.08:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return jsonify({
            "failure_probability": round(float(probability), 4),
            "risk_level": risk_level
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/survival", methods=["POST"])
def survival():
    try:
        data = request.json

        funding_total = pd.to_numeric(
            data.get("funding_total_usd", 0),
            errors="coerce"
        )
        funding_total = 0 if pd.isna(funding_total) else funding_total

        funding_rounds = pd.to_numeric(
            data.get("funding_rounds", 0),
            errors="coerce"
        )
        funding_rounds = 0 if pd.isna(funding_rounds) else funding_rounds

        df = pd.DataFrame([{
            "funding_rounds": funding_rounds,
            "log_funding": np.log1p(funding_total)
        }])

        survival_function = cox_model.predict_survival_function(df)

        MAX_YEARS = 5

        curve = [
            {
                "time": float(t),
                "survival": float(survival_function.iloc[i, 0])
            }
            for i, t in enumerate(survival_function.index)
            if float(t) <= MAX_YEARS
        ]

        return jsonify({"curve": curve})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/portfolio", methods=["POST"])
def portfolio():
    try:
        file = request.files.get("file")

        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        df = pd.read_csv(file)

        required_cols = [
            "funding_total_usd",
            "funding_rounds",
            "startup_age_years"
        ]

        for col in required_cols:
            if col not in df.columns:
                return jsonify({"error": f"Missing column: {col}"}), 400

        # Clean numeric columns
        for col in required_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        probabilities = pipeline.predict_proba(df)[:, 1]

        df["failure_probability"] = probabilities

        df["risk_level"] = np.where(
            probabilities > 0.15,
            "High",
            np.where(probabilities > 0.08, "Medium", "Low")
        )

        # Portfolio summary
        summary = {
            "average_risk": float(np.mean(probabilities)),
            "high_risk_count": int(np.sum(probabilities > 0.15)),
            "medium_risk_count": int(np.sum((probabilities > 0.08) & (probabilities <= 0.15))),
            "low_risk_count": int(np.sum(probabilities <= 0.08))
        }

        return jsonify({
            "summary": summary,
            "records": df.to_dict(orient="records")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/simulate", methods=["POST"])
def simulate():
    try:
        data = request.json
        input_df = pd.DataFrame([data])

        simulations = []

        for _ in range(300):
            noise = np.random.normal(0, 0.02)
            prob = pipeline.predict_proba(input_df)[0][1] + noise
            prob = np.clip(prob, 0, 1)
            simulations.append(float(prob))

        return jsonify({"distribution": simulations})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5001)