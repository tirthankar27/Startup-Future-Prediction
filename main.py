import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.calibration import CalibratedClassifierCV
from xgboost import XGBClassifier
import shap

# -----------------------------
# 1️⃣ LOAD DATA
# -----------------------------
df = pd.read_csv("startup_failure_prediction.csv")


# -----------------------------
# 2️⃣ CREATE LABEL
# -----------------------------
df["label"] = (df["status"] == "closed").astype(int)


# -----------------------------
# 3️⃣ DATE FEATURE ENGINEERING
# -----------------------------
for col in ["founded_at", "first_funding_at", "last_funding_at"]:
    df[col] = pd.to_datetime(df[col], errors="coerce")

df["startup_age_years"] = (
    (df["last_funding_at"] - df["founded_at"]).dt.days / 365
)

df["time_to_first_funding"] = (
    (df["first_funding_at"] - df["founded_at"]).dt.days / 365
)

df["funding_duration"] = (
    (df["last_funding_at"] - df["first_funding_at"]).dt.days / 365
)

df["no_funding_info"] = df["last_funding_at"].isnull().astype(int)
df["no_founded_date"] = df["founded_at"].isnull().astype(int)

for col in ["startup_age_years", "time_to_first_funding", "funding_duration"]:
    df[col] = df[col].fillna(df[col].median())


# -----------------------------
# 4️⃣ FUNDING CLEANING
# -----------------------------
df["funding_total_usd"] = df["funding_total_usd"].replace("-", np.nan)
df["funding_total_usd"] = pd.to_numeric(df["funding_total_usd"], errors="coerce")

df["no_funding"] = df["funding_total_usd"].isnull().astype(int)
df["funding_total_usd"] = df["funding_total_usd"].fillna(0)

df["log_funding"] = np.log1p(df["funding_total_usd"])


# -----------------------------
# 5️⃣ CATEGORY FEATURE
# -----------------------------
df["primary_category"] = df["category_list"].str.split("|").str[0]

top_50 = df["primary_category"].value_counts().nlargest(50).index
df["primary_category"] = df["primary_category"].where(
    df["primary_category"].isin(top_50),
    "Other"
)

df = pd.get_dummies(df, columns=["primary_category"], drop_first=True)


# -----------------------------
# 6️⃣ COUNTRY FEATURE
# -----------------------------
top_20 = df["country_code"].value_counts().nlargest(20).index
df["country_code"] = df["country_code"].where(
    df["country_code"].isin(top_20),
    "Other"
)

df = pd.get_dummies(df, columns=["country_code"], drop_first=True)


# -----------------------------
# 7️⃣ DROP UNUSED COLUMNS
# -----------------------------
drop_cols = [
    "permalink", "name", "homepage_url", "status",
    "category_list", "state_code", "region", "city",
    "founded_at", "first_funding_at", "last_funding_at"
]

df = df.drop(columns=drop_cols)


# -----------------------------
# 8️⃣ ADVANCED FEATURES
# -----------------------------
df["funding_per_round"] = df["funding_total_usd"] / df["funding_rounds"]
df["log_funding_per_round"] = np.log1p(df["funding_per_round"])

df["funding_velocity"] = df["funding_rounds"] / (df["funding_duration"] + 1)
df["funding_density"] = df["log_funding"] / (df["startup_age_years"] + 1)

df["age_x_rounds"] = df["startup_age_years"] * df["funding_rounds"]
df["age_x_funding"] = df["startup_age_years"] * df["log_funding"]


# Clean numerical issues
df.replace([np.inf, -np.inf], 0, inplace=True)
df.fillna(0, inplace=True)


# -----------------------------
# 9️⃣ TRAIN TEST SPLIT
# -----------------------------
X = df.drop(columns=["label"])
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)


# -----------------------------
# 🔟 MODEL TRAINING
# -----------------------------
scale_pos_weight = len(y_train) / y_train.sum()

xgb = XGBClassifier(
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

xgb.fit(X_train, y_train)


# -----------------------------
# 1️⃣1️⃣ EVALUATION
# -----------------------------
y_pred_proba = xgb.predict_proba(X_test)[:, 1]
roc_auc = roc_auc_score(y_test, y_pred_proba)

print("XGBoost ROC-AUC:", round(roc_auc, 4))

calibrated = CalibratedClassifierCV(xgb, method='isotonic', cv=5)
calibrated.fit(X_train, y_train)

probs = calibrated.predict_proba(X_test)[:,1]
print("Calibrated AUC:", roc_auc_score(y_test, probs))