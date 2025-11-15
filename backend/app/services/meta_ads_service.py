# D:/socialadify/backend/app/services/meta_ads_service.py

import httpx
from pathlib import Path
import logging
from typing import Optional, Dict, Any

from app.schemas.user import UserInDB
from app.api.ads.meta_schemas import MetaAdCreativeInDB

logger = logging.getLogger(__name__)

META_API_VERSION = "v19.0"
GRAPH_API_URL = f"https://graph.facebook.com/{META_API_VERSION}"

# --- Internal Helper Functions ---

async def _make_meta_api_request(
    endpoint: str,
    method: str = "GET",
    params: Optional[Dict[str, Any]] = None,
    data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    A helper function to make authenticated requests to the Meta Graph API.
    """
    async with httpx.AsyncClient() as client:
        try:
            if method == "GET":
                response = await client.get(f"{GRAPH_API_URL}{endpoint}", params=params)
            elif method == "POST":
                response = await client.post(f"{GRAPH_API_URL}{endpoint}", params=params, json=data)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
        
        except httpx.HTTPStatusError as e:
            error_details = e.response.json().get("error", {})
            error_message = error_details.get("message", "An unknown Meta API error occurred.")
            logger.error(f"Meta API Error: {error_message} | Response: {e.response.text}")
            raise Exception(error_message)
        except Exception as e:
            logger.error(f"HTTPX request failed: {e}")
            raise

async def _create_campaign(
    ad_account_id: str,
    page_access_token: str,
    ad_draft: MetaAdCreativeInDB
) -> str:
    """
    Step 1: Creates a new, PAUSED campaign.
    Returns the new campaign ID.
    """
    logger.info(f"Creating campaign '{ad_draft.campaign_name}'...")
    params = {
        "access_token": page_access_token,
    }
    data = {
        "name": ad_draft.campaign_name,
        "objective": ad_draft.ad_goal,
        "status": "PAUSED",
        "special_ad_categories": [], # Required field
    }
    
    response = await _make_meta_api_request(
        endpoint=f"/{ad_account_id}/campaigns",
        method="POST",
        params=params,
        data=data
    )
    
    campaign_id = response.get("id")
    if not campaign_id:
        raise Exception("Failed to get campaign ID from Meta API response.")
    
    logger.info(f"Successfully created Campaign ID: {campaign_id}")
    return campaign_id

async def _upload_image(
    ad_account_id: str,
    page_access_token: str,
    image_path: Path
) -> str:
    """
    Step 2: Uploads the ad image to Meta.
    Returns the image hash required for ad creative.
    """
    logger.info(f"Uploading image: {image_path.name}...")
    
    url = f"{GRAPH_API_URL}/{ad_account_id}/adimages"
    params = {"access_token": page_access_token}
    
    timeout_config = httpx.Timeout(60.0, connect=120.0)
    async with httpx.AsyncClient(timeout=timeout_config) as client:
        try:
            with open(image_path, "rb") as image_file:
                files = {'filename': (image_path.name, image_file, 'image/png')}
                
                response = await client.post(url, params=params, files=files)
                response.raise_for_status()
                
                response_data = response.json()
                image_hash = response_data.get("images", {}).get(image_path.name, {}).get("hash")
                
                if not image_hash:
                    raise Exception("Failed to get image hash from Meta API response.")
                
                logger.info(f"Successfully uploaded image. Hash: {image_hash}")
                return image_hash
        
        except httpx.HTTPStatusError as e:
            error_details = e.response.json().get("error", {})
            error_message = error_details.get("message", "An unknown Meta API error occurred.")
            logger.error(f"Meta API Error during image upload: {error_message}")
            raise Exception(error_message)

async def _create_ad_creative(
    ad_account_id: str,
    page_access_token: str,
    page_id: str,
    ad_draft: MetaAdCreativeInDB,
    image_hash: str
) -> str:
    """
    Step 3: Creates the Ad Creative (the visual part of the ad).
    Returns the new ad creative ID.
    """
    logger.info("Creating ad creative...")
    params = {"access_token": page_access_token}
    
    object_story_spec = {
        "page_id": page_id,
        "link_data": {
            "image_hash": image_hash,
            "link": ad_draft.website_url,
            "message": ad_draft.primary_text,
            "call_to_action": {
                "type": ad_draft.call_to_action,
                "value": {"link": ad_draft.website_url}
            }
        }
    }
    
    data = {
        "name": f"{ad_draft.campaign_name} Creative",
        "object_story_spec": object_story_spec
    }

    response = await _make_meta_api_request(
        endpoint=f"/{ad_account_id}/adcreatives",
        method="POST",
        params=params,
        data=data
    )
    
    creative_id = response.get("id")
    if not creative_id:
        raise Exception("Failed to get ad creative ID from Meta API response.")
    
    logger.info(f"Successfully created Ad Creative ID: {creative_id}")
    return creative_id

async def _create_ad_set(
    ad_account_id: str,
    page_access_token: str,
    campaign_id: str,
    ad_draft: MetaAdCreativeInDB
) -> str:
    """
    Step 4: Creates the Ad Set (budget, targeting, etc.).
    Returns the new ad set ID.
    """
    logger.info("Creating ad set...")
    params = {"access_token": page_access_token}
    
    # Basic targeting (must be included)
    # We will target Pakistan (PK) as a default for this project.
    targeting = {
        "geo_locations": {"countries": ["PK"]},
    }
    
    data = {
        "name": f"{ad_draft.campaign_name} Ad Set",
        "campaign_id": campaign_id,
        "status": "PAUSED",
        "billing_event": "IMPRESSIONS",
        "optimization_goal": "LINK_CLICKS", # Must match the campaign objective
        "daily_budget": 100000, # $50 in cents, won't be spent
        "bid_amount": 2000, # $2 in cents, won't be spent
        "targeting": targeting,
    }

    response = await _make_meta_api_request(
        endpoint=f"/{ad_account_id}/adsets",
        method="POST",
        params=params,
        data=data
    )
    
    ad_set_id = response.get("id")
    if not ad_set_id:
        raise Exception("Failed to get ad set ID from Meta API response.")
    
    logger.info(f"Successfully created Ad Set ID: {ad_set_id}")
    return ad_set_id

async def _create_ad(
    ad_account_id: str,
    page_access_token: str,
    ad_set_id: str,
    creative_id: str,
    ad_draft: MetaAdCreativeInDB
) -> str:
    """
    Step 5: Creates the final Ad, linking the Creative to the Ad Set.
    Returns the new ad ID.
    """
    logger.info("Creating final ad...")
    params = {"access_token": page_access_token}
    data = {
        "name": f"{ad_draft.campaign_name} Ad",
        "adset_id": ad_set_id,
        "creative": {"creative_id": creative_id},
        "status": "PAUSED", # Final safety check
    }
    
    response = await _make_meta_api_request(
        endpoint=f"/{ad_account_id}/ads",
        method="POST",
        params=params,
        data=data
    )
    
    ad_id = response.get("id")
    if not ad_id:
        raise Exception("Failed to get ad ID from Meta API response.")
        
    logger.info(f"Successfully created Ad ID: {ad_id}")
    return ad_id

# --- Main Public Function ---

async def publish_meta_ad(
    current_user: UserInDB,
    ad_draft: MetaAdCreativeInDB,
    image_path: Path
) -> str:
    """
    Main orchestrator function to create a complete, paused Meta ad.
    
    Args:
        current_user: The authenticated user object.
        ad_draft: The MetaAdCreativeInDB object from our database.
        image_path: The absolute server path to the ad image.
        
    Returns:
        The resource name of the created ad.
    """
    logger.info(f"Starting Meta Ad publishing for ad draft: {ad_draft.id}")
    
    # 1. Get critical IDs and Tokens from the user
    ad_account_id = current_user.meta_ad_account_id
    page_access_token = current_user.linked_page_access_token
    page_id = current_user.linked_page_id
    
    if not ad_account_id:
        raise Exception("User has no Meta Ad Account ID linked.")
    if not page_access_token or not page_id:
        raise Exception("User has no Meta Page linked for publishing.")
    
    try:
        # Step 1: Create Campaign
        campaign_id = await _create_campaign(ad_account_id, page_access_token, ad_draft)
        
        # Step 2: Upload Image
        image_hash = await _upload_image(ad_account_id, page_access_token, image_path)
        
        # Step 3: Create Ad Creative
        creative_id = await _create_ad_creative(
            ad_account_id, page_access_token, page_id, ad_draft, image_hash
        )
        
        # Step 4: Create Ad Set
        ad_set_id = await _create_ad_set(ad_account_id, page_access_token, campaign_id, ad_draft)
        
        # Step 5: Create Ad
        ad_id = await _create_ad(ad_account_id, page_access_token, ad_set_id, creative_id, ad_draft)
        
        logger.info(f"Successfully published new Meta ad with ID: {ad_id}")
        return ad_id

    except Exception as e:
        logger.error(f"Meta Ad publishing failed: {e}", exc_info=True)
        # Re-raise the clean error message to be caught by the router
        raise Exception(str(e))