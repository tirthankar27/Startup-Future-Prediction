import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from xgboost import XGBClassifier
from lifelines import CoxPHFitter
import joblib

from feature_engineering import FeatureEngineer

# -----------------------------
# LOAD DATA
# -----------------------------
df = pd.read_csv("startup_failure_prediction.csv")

df["label"] = (df["status"] == "closed").astype(int)

# Date processing
df["founded_at"] = pd.to_datetime(df["founded_at"], errors="coerce")
df["last_funding_at"] = pd.to_datetime(df["last_funding_at"], errors="coerce")

df["startup_age_years"] = (
    (df["last_funding_at"] - df["founded_at"]).dt.days / 365
)

df["startup_age_years"] = df["startup_age_years"].fillna(0)

# Raw features only
X_raw = df[[
    "funding_total_usd",
    "funding_rounds",
    "startup_age_years"
]]

y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X_raw,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

# Class imbalance handling
neg = (y_train == 0).sum()
pos = (y_train == 1).sum()
scale_pos_weight = neg / pos

base_model = XGBClassifier(
    n_estimators=800,
    max_depth=4,
    learning_rate=0.03,
    subsample=0.7,
    colsample_bytree=0.7,
    min_child_weight=3,
    gamma=1,
    reg_alpha=0.5,
    reg_lambda=1.5,
    scale_pos_weight=scale_pos_weight,
    random_state=42,
    n_jobs=-1
)

pipeline = Pipeline([
    ("feature_engineering", FeatureEngineer()),
    ("imputer", SimpleImputer(strategy="median")),
    ("model", CalibratedClassifierCV(
        base_model,
        method="isotonic",
        cv=5
    ))
])

pipeline.fit(X_train, y_train)

probs = pipeline.predict_proba(X_test)[:, 1]
print("Pipeline ROC-AUC:",
      round(roc_auc_score(y_test, probs), 4))

# Save pipeline
joblib.dump(pipeline, "production_pipeline.pkl")

# -----------------------------
# SURVIVAL MODEL
# -----------------------------
survival_df = df.copy()

survival_df["event"] = survival_df["label"]

survival_df["duration_years"] = (
    (survival_df["last_funding_at"] - survival_df["founded_at"]).dt.days / 365
)

survival_df["duration_years"] = survival_df["duration_years"].fillna(0)

survival_df["log_funding"] = np.log1p(
    pd.to_numeric(survival_df["funding_total_usd"], errors="coerce").fillna(0)
)

survival_df = survival_df[[
    "duration_years",
    "event",
    "funding_rounds",
    "log_funding"
]].dropna()

cph = CoxPHFitter()
cph.fit(
    survival_df,
    duration_col="duration_years",
    event_col="event"
)

joblib.dump(cph, "cox_model.pkl")

print("Production pipeline and survival model saved.")