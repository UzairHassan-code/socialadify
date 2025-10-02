# D:\socialadify\backend\app\api\insights\router.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Union

# --- ML/Data Handling Imports (Restored) ---
import joblib
from pathlib import Path
import pandas as pd
import random

# --- MODIFIED: Import the correct mock data structure ---
from .mock_data import MOCK_CAMPAIGN_PERFORMANCE_1

router = APIRouter()

# --- BEGIN: ML Model Loading Section (Restored) ---
# This section is the same as your old file, ensuring models are loaded on startup.
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "ml_models"

preprocessor = None
suggestion_model = None
label_encoder = None
models_loaded_successfully = False

try:
    print(f"Attempting to load models from: {MODEL_DIR}")
    preprocessor = joblib.load(MODEL_DIR / "preprocessor.joblib")
    suggestion_model = joblib.load(MODEL_DIR / "xgb_suggestion_classifier.joblib")
    label_encoder = joblib.load(MODEL_DIR / "suggestion_label_encoder.joblib")
    models_loaded_successfully = True
    print("ML models (preprocessor, XGBoost classifier, label encoder) loaded successfully.")
except Exception as e:
    print(f"An unexpected error occurred during ML model loading: {e}")
finally:
    if not models_loaded_successfully:
        print("One or more ML models failed to load. AI Suggestion functionality will be affected.")
# --- END: ML Model Loading Section ---

# --- Pydantic Schemas for AI Suggestion (Restored) ---
class AdSuggestionResponse(BaseModel):
    ad_id: str # We'll use the campaign ID here
    suggestion: str

# --- AI SUGGESTION ENDPOINT (FIXED) ---
@router.post("/campaign/{campaign_id}/generate-suggestion", response_model=AdSuggestionResponse, summary="Generate AI-based suggestion for a campaign")
async def generate_campaign_suggestion(campaign_id: str):
    """
    Generates an AI-based optimization suggestion for a specific campaign.
    For the mock campaign, it synthesizes model inputs from the performance data.
    """
    if not models_loaded_successfully:
        raise HTTPException(status_code=503, detail="AI Suggestion service is unavailable: Models not loaded.")

    # --- MODIFIED: Check against the correct campaign ID from the imported object ---
    if campaign_id != MOCK_CAMPAIGN_PERFORMANCE_1["campaign_id"]:
        raise HTTPException(status_code=404, detail=f"AI suggestions are only available for the main mock campaign in this demo.")

    try:
        # 1. Use the correctly imported performance data
        perf_data = MOCK_CAMPAIGN_PERFORMANCE_1["performance_data"]
        total_clicks = sum(day['clicks'] for day in perf_data)
        total_impressions = sum(day['impressions'] for day in perf_data)
        total_cost_micros = sum(day['cost_micros'] for day in perf_data)
        
        # 2. Calculate derived metrics
        spend = total_cost_micros / 1000000
        revenue = spend * 1.8 
        roi = ((revenue - spend) / spend) if spend > 0 else 0
        conversion_rate = (total_clicks / total_impressions) * 100 if total_impressions > 0 else 0
        
        # 3. Create the feature dictionary that our model expects
        features_for_model_dict = {
            "Target_Audience": "Young_Professionals",
            "Conversion_Rate": conversion_rate,
            "Spend": spend,
            "ROI": roi,
            "Clicks": total_clicks,
            "Impressions": total_impressions,
            "Engagement_Score": random.uniform(0.05, 0.15),
            "Ad_Type": "Video_Ad",
        }
        
        model_feature_order = [
            "Target_Audience", "Conversion_Rate", "Spend", "ROI",
            "Clicks", "Impressions", "Engagement_Score", "Ad_Type"
        ]
        features_df = pd.DataFrame([features_for_model_dict], columns=model_feature_order)

    except Exception as e:
        print(f"Error preparing features for mock campaign: {e}")
        raise HTTPException(status_code=500, detail=f"Error preparing data for AI model: {str(e)}")

    # --- Prediction Pipeline (Same as your old logic) ---
    try:
        processed_features = preprocessor.transform(features_df)
        prediction_encoded = suggestion_model.predict(processed_features)
        suggestion_text_array = label_encoder.inverse_transform(prediction_encoded)
        final_suggestion = suggestion_text_array[0] 
    except Exception as e:
        print(f"Error during AI model prediction pipeline: {e}")
        raise HTTPException(status_code=500, detail=f"AI model prediction error: {str(e)}")

    return AdSuggestionResponse(
        ad_id=campaign_id,
        suggestion=str(final_suggestion)
    )

