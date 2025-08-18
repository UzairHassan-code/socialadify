# D:\socialadify\backend\app\api\post_generator\router.py
import os
import httpx
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_active_user
from app.schemas.user import UserInDB, PyObjectId
from .schemas import PostGenerationRequest, PostGenerationResponse, SavePostRequest, GeneratedPostCreate
from app.crud import generated_post as post_crud
from app.db.session import get_database
import logging
import json
import io
import base64
from PIL import Image
import random
import time
from pathlib import Path

router = APIRouter()
CurrentUserDependency = Depends(get_current_active_user)
DbDependency = Depends(get_database)
logger = logging.getLogger(__name__)

# --- Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")
STABILITY_API_URL = "https://api.stability.ai/v2beta/stable-image/generate/sd3"
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent.parent
SAVED_POSTS_DIR = _BACKEND_ROOT / "static" / "generated_posts"
SAVED_POSTS_DIR.mkdir(parents=True, exist_ok=True)


# --- This is now the LIVE Stability AI API call ---
async def call_stability_api(prompt: str, aspect_ratio: str) -> bytes:
    """Calls the official Stability AI API to generate an image."""
    if not STABILITY_API_KEY:
        raise HTTPException(status_code=503, detail="Stability AI API key is not configured.")

    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Accept": "image/*",
    }
    
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

    gemini_prompt = f"""
    You are an expert social media marketing copywriter and a creative art director.
    Based on the user's answers, do two things:
    1. Write the Ad Copy: Generate a compelling "headline".
    2. Describe the Visuals: Create a concise, visually descriptive prompt for the Stable Diffusion 3 AI text-to-image model. This prompt should describe a background image that fits the product AND include the headline text you generated, so the image model can render it. The final image will have an aspect ratio of {request.aspect_ratio}, so make sure your description fits that shape.

    User's Answers:
    - Desired Ad Dimensions: {request.aspect_ratio}
    - Product: {request.product_name}
    - Audience: {request.target_audience}
    - Features: {", ".join(request.key_features)}
    - Tone: {request.tone}

    Your Response Format:
    Provide your response as a single, valid JSON object with two keys: "headline" and "image_prompt".
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
    # *** THIS IS THE CHANGE: We are now calling the live API again ***
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


@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_generated_post(
    request: SavePostRequest,
    current_user: UserInDB = CurrentUserDependency,
    db = DbDependency
):
    try:
        header, encoded = request.image_data_url.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        
        timestamp = int(time.time())
        unique_filename = f"user_{str(current_user.id)}_time_{timestamp}.png"
        file_path_on_disk = SAVED_POSTS_DIR / unique_filename
        
        with open(file_path_on_disk, "wb") as f:
            f.write(image_bytes)
        
        image_url_for_db = f"/static/generated_posts/{unique_filename}"
        
        post_to_save = GeneratedPostCreate(
            user_id=current_user.id,
            image_url=image_url_for_db,
            prompt_used=request.prompt_used,
            original_request=request.original_request
        )
        
        await post_crud.create_generated_post(db, post_in=post_to_save)
        
        return {"message": "Post saved successfully", "image_url": image_url_for_db}

    except Exception as e:
        logger.error(f"Failed to save post for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not save the post.")


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_visual_post(
    post_id: str,
    current_user: UserInDB = CurrentUserDependency,
    db = DbDependency
):
    try:
        post_object_id = PyObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format.")

    post_to_delete = await post_crud.get_post_by_id_for_user(db, post_id=post_object_id, user_id=current_user.id)
    if not post_to_delete:
        raise HTTPException(status_code=404, detail="Post not found or you do not have permission to delete it.")

    image_url = post_to_delete.get("image_url")
    if image_url:
        relative_path = image_url.replace("/static/", "", 1)
        file_path_on_disk = _BACKEND_ROOT / "static" / relative_path
        if file_path_on_disk.exists():
            os.remove(file_path_on_disk)
            logger.info(f"Deleted image file: {file_path_on_disk}")

    success = await post_crud.delete_post_by_id(db, post_id=post_object_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete post from the database.")
    
    return None
