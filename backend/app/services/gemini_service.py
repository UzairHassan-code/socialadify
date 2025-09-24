# D:/socialadify/backend/app/services/gemini_service.py

import google.generativeai as genai
import os
import logging
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

# It's recommended to load the API key from environment variables
# Ensure you have GOOGLE_API_KEY set in your .env file
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.warning("GOOGLE_API_KEY not found in environment variables. AI features will not work.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Replace the existing function with this one
async def get_optimal_post_time(caption: str, platform: str, is_boosted: bool) -> dict:
    """
    Uses the Gemini AI to suggest an optimal posting time and provides reasoning,
    tailoring the prompt based on the selected platform.
    """
    if not GEMINI_API_KEY:
        raise Exception("Gemini API key is not configured.")

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # --- THIS IS THE NEW LOGIC ---
    if platform == "Google Ads":
        prompt = (
            f"You are an expert digital advertising analyst specializing in the Pakistani market for Google Ads. "
            f"Based on the following ad creative, suggest the single best day and time to **launch a Google Display Ad campaign** for maximum click-through rate and conversions. "
            f"The current date is {datetime.now().strftime('%Y-%m-%d')}. The suggestion should be a future date within the next 7 days. "
            f"The target audience is in Pakistan (Timezone: PKT, UTC+5). "
            f"Analyze the ad caption to infer the product and likely target demographic to inform your suggestion.\n\n"
            f"**Platform:** Google Ads (Display Network)\n"
            f"**Ad Caption:** \"{caption}\"\n\n"
            f"Return ONLY a valid JSON object with two keys: 'suggested_time_utc' (a string in YYYY-MM-DDTHH:MM:SS format) and 'reasoning' (a brief, one-sentence explanation for your choice, max 150 characters)."
        )
    else: # Default prompt for Meta platforms (Facebook/Instagram)
        post_type = "paid ad campaign" if is_boosted else "organic (non-paid) post"
        goal = "maximum user engagement and conversions" if is_boosted else "maximum organic reach"
        prompt = (
            f"You are an expert social media marketing strategist specializing in the Pakistani market. "
            f"Based on the following content, suggest the single best day and time to launch this {post_type} on {platform} for {goal}. "
            f"The current date is {datetime.now().strftime('%Y-%m-%d')}. The suggestion should be a future date within the next 7 days. "
            f"The target audience is in Pakistan (Timezone: PKT, UTC+5). "
            f"Analyze the caption content to infer the product, tone, and likely target demographic to inform your suggestion.\n\n"
            f"**Platform:** {platform}\n"
            f"**Caption:** \"{caption}\"\n\n"
            f"Return ONLY a valid JSON object with two keys: 'suggested_time_utc' (a string in YYYY-MM-DDTHH:MM:SS format) and 'reasoning' (a brief, one-sentence explanation for your choice, max 150 characters)."
        )

    try:
        logger.info(f"Sending prompt to Gemini for {platform} time suggestion...")
        response = await model.generate_content_async(prompt)
        
        response_text = response.text.strip()
        json_match = response_text[response_text.find('{'):response_text.rfind('}')+1]
        
        logger.info(f"Received structured suggestion from Gemini: {json_match}")
        suggestion_data = json.loads(json_match)
        
        if 'suggested_time_utc' not in suggestion_data or 'reasoning' not in suggestion_data:
            raise ValueError("AI response did not contain the required JSON keys.")

        return suggestion_data

    except Exception as e:
        logger.error(f"Error communicating with or parsing Gemini response: {e}", exc_info=True)
        fallback_time = datetime.now() + timedelta(days=1, hours=4)
        return {
            "suggested_time_utc": fallback_time.strftime('%Y-%m-%dT%H:%M:%S'),
            "reasoning": "Could not generate a custom suggestion. This is a fallback time."
        }
