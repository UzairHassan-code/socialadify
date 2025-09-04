# D:/socialadify/backend/app/services/meta_service.py

import httpx
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Define the root path to find static files from anywhere in the app
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
STATIC_FILES_DIR = _BACKEND_ROOT / "static"

async def publish_photo_to_page(page_id: str, page_access_token: str, caption: str, image_url: str) -> str:
    """
    Publishes a photo with a caption to a specific Facebook Page.
    This is a REAL API call.
    """
    logger.info(f"Attempting to publish photo to Meta Page ID: {page_id}")

    relative_image_path = image_url.lstrip('/')
    full_image_path = STATIC_FILES_DIR / relative_image_path

    if not full_image_path.exists():
        error_message = f"Image file not found at path: {full_image_path}"
        logger.error(error_message)
        raise FileNotFoundError(error_message)

    post_url = f"https://graph.facebook.com/v18.0/{page_id}/photos"
    params = {"caption": caption, "access_token": page_access_token}

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            with open(full_image_path, "rb") as f:
                files = {"source": (full_image_path.name, f, "image/jpeg")}
                response = await client.post(post_url, params=params, files=files)
                response.raise_for_status()

            response_data = response.json()
            post_id = response_data.get("id")
            if not post_id:
                raise Exception("Meta API response did not include a post ID.")
            
            logger.info(f"Successfully published photo to Page {page_id}. Post ID: {post_id}")
            return post_id

        except httpx.HTTPStatusError as e:
            error_details = e.response.text
            logger.error(f"Failed to publish photo to Meta Page {page_id}. Details: {error_details}", exc_info=True)
            raise Exception(f"Meta API Error: {error_details}")
        except Exception as e:
            logger.error(f"An unexpected error occurred during photo publishing: {e}", exc_info=True)
            raise

async def boost_published_post(page_post_id: str, page_id: str, page_access_token: str, budget: float, duration_days: int):
    """
    Simulates boosting an existing post on a Facebook Page.
    This function does NOT make a real API call and will NOT spend money.
    """
    logger.info(f"--- [SIMULATION] ---")
    logger.info(f"Attempting to boost post: {page_post_id}")
    logger.info(f"Target Page ID: {page_id}")
    logger.info(f"Budget: {budget}, Duration: {duration_days} days")
    
    # In a real application, you would make API calls here.
    # For a final year project, logging is sufficient to prove the concept.
    
    logger.info(f"--- [SIMULATION] Boost successful for post {page_post_id}. ---")
    return {"success": True, "campaign_id": "simulated_campaign_12345"}
