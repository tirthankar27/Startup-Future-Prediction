import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin


class FeatureEngineer(BaseEstimator, TransformerMixin):

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        df = X.copy()

        df["funding_total_usd"] = pd.to_numeric(
            df.get("funding_total_usd", 0), errors="coerce"
        ).fillna(0)

        df["funding_rounds"] = pd.to_numeric(
            df.get("funding_rounds", 0), errors="coerce"
        ).fillna(0)

        df["startup_age_years"] = pd.to_numeric(
            df.get("startup_age_years", 0), errors="coerce"
        ).fillna(0)

        df["log_funding"] = np.log1p(df["funding_total_usd"])

        df["funding_per_round"] = np.where(
            df["funding_rounds"] > 0,
            df["funding_total_usd"] / df["funding_rounds"],
            0
        )

        df["log_funding_per_round"] = np.log1p(df["funding_per_round"])

        df["funding_velocity"] = df["funding_rounds"] / (df["startup_age_years"] + 1)
        df["funding_density"] = df["log_funding"] / (df["startup_age_years"] + 1)

        df["age_x_rounds"] = df["startup_age_years"] * df["funding_rounds"]
        df["age_x_funding"] = df["startup_age_years"] * df["log_funding"]

        df.replace([np.inf, -np.inf], 0, inplace=True)

        return df