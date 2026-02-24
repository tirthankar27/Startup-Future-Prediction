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

        times = [1, 3, 5]

        survival_probs = {
            f"{t}_year_survival":
            float(
                survival_function.iloc[
                    survival_function.index.get_indexer([t], method="nearest")
                ][0]
            )
            for t in times
        }

        return jsonify(survival_probs)

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5001)