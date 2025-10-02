# D:/socialadify/backend/app/services/meta_service.py

import httpx
from pathlib import Path
import logging
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
# We no longer need the config file here
# from app.core import config

logger = logging.getLogger(__name__)

_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent

# --- THE FIX: We add 'page_access_token' back to the function signature ---
async def publish_photo_to_page(
    db: AsyncIOMotorDatabase,
    user_id: ObjectId,
    page_id: str,
    page_access_token: str, # <-- THIS IS THE KEY CHANGE
    image_url_from_db: str,
    caption: str
) -> Optional[str]:
    """
    Publishes a photo to a Facebook Page using the provided user-specific access token.
    """
    logger.info(f"Attempting to publish photo for user {user_id} to Meta Page ID: {page_id}")

    relative_image_path = image_url_from_db.lstrip('/')
    image_path = _BACKEND_ROOT / relative_image_path
    
    if not image_path.exists():
        error_message = f"Image file not found at path: {image_path}"
        logger.error(error_message)
        raise FileNotFoundError(error_message)

    post_url = f"https://graph.facebook.com/v19.0/{page_id}/photos"
    
    # --- THE FIX: We use the token passed into the function ---
    params = {
        'caption': caption,
        'access_token': page_access_token # <-- THIS IS THE KEY CHANGE
    }

    timeout_config = httpx.Timeout(60.0, connect=120.0)

    async with httpx.AsyncClient(timeout=timeout_config) as client:
        try:
            with open(image_path, "rb") as image_file:
                files = {'source': (image_path.name, image_file, 'image/png')}
                
                logger.info(f"Sending POST request to {post_url}...")
                response = await client.post(post_url, params=params, files=files)
                
                # We will log the error text before raising the exception for better debugging
                if response.status_code != 200:
                    logger.error(f"HTTP error publishing to Meta: {response.text}")

                response.raise_for_status()
                
                response_data = response.json()
                post_id = response_data.get('id')
                logger.info(f"Successfully published photo to Meta. New post ID: {post_id}")
                return post_id

        except httpx.HTTPStatusError as e:
            error_json = e.response.json().get("error", {})
            error_message = error_json.get("message", "An unknown error occurred.")
            raise Exception(f"Failed to publish to Meta: {error_message}")
        except Exception as e:
            logger.error(f"An unexpected error occurred during Meta publishing: {e}", exc_info=True)
            raise Exception("An unexpected error occurred while publishing the post.")
