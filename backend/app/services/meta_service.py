# D:/socialadify/backend/app/services/meta_service.py

import httpx
from pathlib import Path
import logging
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone

from app.crud import user as user_crud

logger = logging.getLogger(__name__)

# --- Get the project's root directory ---
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent

async def publish_photo_to_page(
    db: AsyncIOMotorDatabase,
    user_id: ObjectId,
    page_id: str,
    page_access_token: str,
    image_url_from_db: str,
    caption: str
) -> Optional[str]:
    """
    Publishes a photo with a caption to a specific Facebook Page.
    Returns the ID of the new post if successful.
    """
    logger.info(f"Attempting to publish photo to Meta Page ID: {page_id}")

    # Correctly construct the absolute path to the image file
    # This removes the leading '/' from the DB URL and joins it with the project root
    relative_image_path = image_url_from_db.lstrip('/')
    image_path = _BACKEND_ROOT / relative_image_path
    
    logger.info(f"Constructed absolute image path: {image_path}")

    if not image_path.exists():
        error_message = f"Image file not found at path: {image_path}"
        logger.error(error_message)
        raise FileNotFoundError(error_message)

    post_url = f"https://graph.facebook.com/v18.0/{page_id}/photos"
    params = {
        'caption': caption,
        'access_token': page_access_token
    }

    # --- THIS IS THE FIX ---
    # We create a Timeout configuration object to give the upload more time.
    # 30 seconds for read operations is a safe value for file uploads.
    timeout_config = httpx.Timeout(30.0, connect=60.0)

    # We pass the new timeout configuration when creating the client.
    async with httpx.AsyncClient(timeout=timeout_config) as client:
        try:
            with open(image_path, "rb") as image_file:
                files = {'source': (image_path.name, image_file, 'image/png')}
                
                logger.info(f"Sending POST request to {post_url} to publish photo.")
                response = await client.post(post_url, params=params, files=files)
                
                response.raise_for_status()  # This will raise an exception for 4xx or 5xx errors
                
                response_data = response.json()
                post_id = response_data.get('id')
                logger.info(f"Successfully published photo to Meta. New post ID: {post_id}")
                return post_id

        except httpx.HTTPStatusError as e:
            error_text = e.response.text
            logger.error(f"HTTP error publishing to Meta: {error_text}")
            raise Exception(f"Failed to publish to Meta: {error_text}")
        except httpx.ReadTimeout:
            logger.error("Timeout occurred while uploading image to Meta.")
            raise Exception("The request to Meta timed out. The file may be too large or the network is slow.")
        except Exception as e:
            logger.error(f"An unexpected error occurred during Meta publishing: ", exc_info=True)
            raise Exception("An unexpected error occurred while publishing the post.")

