# D:\socialadify\backend\app\api\post_generator\router.py
import os
import httpx
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_active_user
from app.schemas.user import UserInDB
from .schemas import PostGenerationRequest, PostGenerationResponse
import logging
import json
import io
import base64

router = APIRouter()
CurrentUserDependency = Depends(get_current_active_user)
logger = logging.getLogger(__name__)

# --- Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")
STABILITY_API_URL = "https://api.stability.ai/v2beta/stable-image/generate/sd3"


async def call_stability_api(prompt: str, aspect_ratio: str) -> bytes:
    """Calls the official Stability AI API to generate an image."""
    if not STABILITY_API_KEY:
        raise HTTPException(status_code=503, detail="Stability AI API key is not configured.")

    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Accept": "image/*",
    }
    
    # The Stability API uses multipart/form-data
    files = {
        'prompt': (None, prompt),
        'model': (None, 'sd3-medium'),
        'output_format': (None, 'png'),
        'aspect_ratio': (None, aspect_ratio)
    }
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(STABILITY_API_URL, headers=headers, files=files)
            
            if response.status_code == 200:
                return response.content
            else:
                error_text = response.text
                logger.error(f"HTTP error calling Stability AI API: {response.status_code} - {error_text}")
                raise HTTPException(status_code=502, detail=f"Image generation service failed: {error_text}")

        except httpx.RequestError as e:
            logger.error(f"Error calling Stability AI API: {e}")
            raise HTTPException(status_code=500, detail="An unexpected error occurred with the image generation service.")


@router.post("/generate", response_model=PostGenerationResponse)
async def generate_visual_post(
    request: PostGenerationRequest,
    current_user: UserInDB = CurrentUserDependency
):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service is not configured.")

    # *** THIS IS THE FIX ***
    # We now include the aspect_ratio in the prompt for Gemini.
    gemini_prompt = f"""
    You are an expert social media marketing copywriter and a creative art director.
    Based on the user's answers, do two things:
    1. Write the Ad Copy: Generate a compelling "headline".
    2. Describe the Visuals: Create a concise, visually descriptive prompt for the Stable Diffusion 3 AI text-to-image model. This prompt should describe a background image that fits the product AND include the headline text you generated, so the image model can render it. The final image will have an aspect ratio of {request.aspect_ratio}, so make sure your description fits that shape (e.g., a tall, vertical composition for a 9:16 ratio).

    User's Answers:
    - Desired Ad Dimensions: {request.aspect_ratio}
    - Product: {request.product_name}
    - Audience: {request.target_audience}
    - Features: {", ".join(request.key_features)}
    - Tone: {request.tone}

    Your Response Format:
    Provide your response as a single, valid JSON object with two keys: "headline" and "image_prompt".
    Example: {{ "headline": "Pure Refreshment", "image_prompt": "A vibrant, professional product shot of a sparkling water can, with condensation, surrounded by fresh citrus slices. The text 'Pure Refreshment' is written in a clean, modern font at the top." }}
    """
    
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash-latest', generation_config={"response_mime_type": "application/json"})
        response = await model.generate_content_async(gemini_prompt)
        ad_content = json.loads(response.text)
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate ad copy.")

    image_prompt = ad_content.get("image_prompt", f"An ad for {request.product_name}")
    generated_image_bytes = await call_stability_api(image_prompt, request.aspect_ratio)
    
    try:
        encoded_image = base64.b64encode(generated_image_bytes).decode('utf-8')
        image_data_url = f"data:image/png;base64,{encoded_image}"
    except Exception as e:
        logger.error(f"Error encoding image: {e}")
        raise HTTPException(status_code=500, detail="Failed to process the final ad image.")

    return PostGenerationResponse(
        image_data_url=image_data_url,
        prompt_used=image_prompt
    )

