import httpx
from pathlib import Path
import logging
from typing import Optional, List, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
import asyncio
from datetime import datetime

# --- FIX: Import SERVER_HOST from your existing config file ---
from app.core.config import SERVER_HOST
from app.api.insights.schemas import PostReactions

logger = logging.getLogger(__name__)

_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
GRAPH_API_VERSION = "v19.0"
GRAPH_API_URL = "https://graph.facebook.com"

async def publish_photo_to_facebook_page(
    db: AsyncIOMotorDatabase,
    user_id: ObjectId,
    page_id: str,
    page_access_token: str,
    image_url_from_db: str,
    caption: str
) -> Optional[str]:
    """
    Publishes a photo to a Facebook Page using a direct file upload.
    (This is your original function, just renamed)
    """
    logger.info(f"Attempting to publish photo for user {user_id} to Facebook Page ID: {page_id}")

    relative_image_path = image_url_from_db.lstrip('/')
    image_path = _BACKEND_ROOT / relative_image_path
    
    if not image_path.exists():
        error_message = f"Image file not found at path: {image_path}"
        logger.error(error_message)
        raise FileNotFoundError(error_message)

    post_url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{page_id}/photos"
    
    params = {
        'caption': caption,
        'access_token': page_access_token
    }

    timeout_config = httpx.Timeout(60.0, connect=120.0)

    async with httpx.AsyncClient(timeout=timeout_config) as client:
        try:
            with open(image_path, "rb") as image_file:
                files = {'source': (image_path.name, image_file, 'image/png')}
                
                logger.info(f"Sending POST request to Facebook: {post_url}")
                response = await client.post(post_url, params=params, files=files)
                
                if response.status_code != 200:
                    logger.error(f"HTTP error publishing to Facebook: {response.text}")
                response.raise_for_status()
                
                response_data = response.json()
                post_id = response_data.get('id')
                logger.info(f"Successfully published photo to Facebook. New post ID: {post_id}")
                return post_id

        except httpx.HTTPStatusError as e:
            error_json = e.response.json().get("error", {})
            error_message = error_json.get("message", "An unknown error occurred.")
            raise Exception(f"Failed to publish to Facebook: {error_message}")
        except Exception as e:
            logger.error(f"An unexpected error occurred during Facebook publishing: {e}", exc_info=True)
            raise Exception("An unexpected error occurred while publishing the post.")

async def publish_photo_to_instagram(
    db: AsyncIOMotorDatabase,
    user_id: ObjectId,
    instagram_id: str,
    page_access_token: str,
    image_url_from_db: str,
    caption: str
) -> Optional[str]:
    """
    Publishes a photo to an Instagram Business Account using the 2-step
    media creation and publishing flow.
    """
    logger.info(f"Attempting to publish photo for user {user_id} to Instagram Account ID: {instagram_id}")

    # --- FIX: Use SERVER_HOST from your config.py ---
    # Instagram API requires a public URL, not a file upload.
    public_image_url = f"{SERVER_HOST}{image_url_from_db}"
    logger.info(f"Using public image URL for Instagram: {public_image_url}")

    timeout_config = httpx.Timeout(60.0, connect=120.0)
    creation_id = None

    async with httpx.AsyncClient(timeout=timeout_config) as client:
        
        # --- STEP 1: Create Media Container ---
        try:
            media_creation_url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{instagram_id}/media"
            params = {
                'image_url': public_image_url,
                'caption': caption,
                'access_token': page_access_token
            }
            logger.info(f"Sending POST to Instagram (Step 1 - Create Media): {media_creation_url}")
            response = await client.post(media_creation_url, params=params)

            if response.status_code != 200:
                logger.error(f"HTTP error creating Instagram media container: {response.text}")
            response.raise_for_status()
            
            response_data = response.json()
            creation_id = response_data.get('id')
            if not creation_id:
                raise Exception("Failed to get creation_id from Instagram.")
            
            logger.info(f"Successfully created Instagram media container. Creation ID: {creation_id}")

        except httpx.HTTPStatusError as e:
            error_json = e.response.json().get("error", {})
            error_message = error_json.get("message", "An unknown error occurred.")
            raise Exception(f"Failed to create Instagram media (Step 1): {error_message}")
        except Exception as e:
            logger.error(f"An unexpected error occurred during Instagram media creation: {e}", exc_info=True)
            raise Exception(f"An unexpected error occurred during Instagram media creation.")

        # Give Meta's servers a moment to process the container
        await asyncio.sleep(5) 

        # --- STEP 2: Publish Media Container ---
        try:
            media_publish_url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{instagram_id}/media_publish"
            params = {
                'creation_id': creation_id,
                'access_token': page_access_token
            }
            logger.info(f"Sending POST to Instagram (Step 2 - Publish Media): {media_publish_url}")
            response = await client.post(media_publish_url, params=params)

            if response.status_code != 200:
                logger.error(f"HTTP error publishing Instagram media: {response.text}")
            response.raise_for_status()

            response_data = response.json()
            post_id = response_data.get('id')
            logger.info(f"Successfully published photo to Instagram. New post ID: {post_id}")
            return post_id

        except httpx.HTTPStatusError as e:
            error_json = e.response.json().get("error", {})
            error_message = error_json.get("message", "An unknown error occurred.")
            if error_json.get("code") == 9007:
                logger.warning(f"Instagram publish failed (Code 9007): Media container was not ready. Retrying may succeed.")
                raise Exception(f"Failed to publish to Instagram: The media was not ready. Please try again later. (Code 9007)")
            raise Exception(f"Failed to publish to Instagram (Step 2): {error_message}")
        except Exception as e:
            logger.error(f"An unexpected error occurred during Instagram media publishing: {e}", exc_info=True)
            raise Exception(f"An unexpected error occurred during Instagram media publishing.")
            
#
# --- NEW INSIGHTS FUNCTIONS START HERE ---
#

async def get_facebook_page_insights(
    page_id: str, 
    page_access_token: str, 
    since: datetime, 
    until: datetime
) -> List[Dict[str, Any]]:
    """
    Fetches daily page-level insights for a Facebook Page.
    """
    logger.info(f"Fetching Facebook Page insights for Page ID: {page_id}")
    
    # Define the metrics we want for Facebook
    metrics = "page_impressions_unique,page_post_engagements,page_fans"
    
    insights_url = f"{GRAPH_API_URL}/{GRAPH_API_VERSION}/{page_id}/insights"
    params = {
        "metric": metrics,
        "period": "day",
        "since": since.isoformat(),
        "until": until.isoformat(),
        "access_token": page_access_token
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(insights_url, params=params)
        response.raise_for_status() # Will raise exception on 4xx/5xx
        return response.json().get("data", [])

# --- THIS FUNCTION IS NOW FIXED (Using your solution) ---
async def get_instagram_account_insights(
    instagram_id: str, 
    page_access_token: str, 
    since: datetime, 
    until: datetime
) -> List[Dict[str, Any]]:
    """
    Fetches daily and total-value insights for an Instagram Business Account.
    """
    logger.info(f"Fetching Instagram Account insights for Account ID: {instagram_id}")

    base_url = f"{GRAPH_API_URL}/{GRAPH_API_VERSION}/{instagram_id}/insights"
    all_data = []

    async with httpx.AsyncClient() as client:
        # 1. Period-based (daily) metrics
        daily_metrics = "reach,follower_count"
        params_daily = {
            "metric": daily_metrics,
            "period": "day",
            "since": since.isoformat(),
            "until": until.isoformat(),
            "access_token": page_access_token
        }
        
        try:
            resp_daily = await client.get(base_url, params=params_daily)
            resp_daily.raise_for_status()
            all_data.extend(resp_daily.json().get("data", []))
        except Exception as e:
            logger.error(f"Daily Instagram metrics fetch failed: {e}")

        # 2. Total-value metrics (which also require a time range)
        total_metrics = "accounts_engaged,profile_views,website_clicks,total_interactions"
        params_total = {
            "metric": total_metrics,
            "metric_type": "total_value",
            "since": since.isoformat(),
            "until": until.isoformat(),
            "access_token": page_access_token
        }

        try:
            resp_total = await client.get(base_url, params=params_total)
            resp_total.raise_for_status()
            all_data.extend(resp_total.json().get("data", []))
        except Exception as e:
            logger.error(f"Total Instagram metrics fetch failed: {e}")
            
    if not all_data:
        # If both calls failed, raise an exception so the router can catch it
        raise Exception("Failed to fetch any Instagram account insights.")

    return all_data
# --- END OF FIX ---

async def get_facebook_post_list(
    page_id: str, 
    page_access_token: str, 
    since: datetime, 
    until: datetime
) -> List[Dict[str, Any]]:
    """
    Fetches a list of posts from a Facebook Page within a date range.
    """
    logger.info(f"Fetching Facebook post list for Page ID: {page_id}")
    posts_url = f"{GRAPH_API_URL}/{GRAPH_API_VERSION}/{page_id}/posts"
    
    # This correctly fetches comments and shares
    params = {
        "fields": "id,created_time,message,comments.summary(true),shares",
        "since": since.isoformat(),
        "until": until.isoformat(),
        "limit": 50, # Get up to 50 posts
        "access_token": page_access_token
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(posts_url, params=params)
        response.raise_for_status()
        return response.json().get("data", [])

async def get_facebook_post_insights(
    post_id: str, 
    page_access_token: str
) -> Dict[str, Any]:
    """
    Fetches insights for a single Facebook post using valid v19.0 metrics.
    """
    logger.debug(f"Fetching insights for Facebook Post ID: {post_id}")
    insights_url = f"{GRAPH_API_URL}/{GRAPH_API_VERSION}/{post_id}/insights"
    
    # These are the correct, valid metrics we found
    metrics = "post_impressions,post_impressions_unique,post_clicks,post_reactions_by_type_total"
    
    params = {"metric": metrics, "access_token": page_access_token}
    
    insights_data: Dict[str, Any] = {}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(insights_url, params=params)
            response.raise_for_status()
            
            # Helper to flatten the complex JSON response from Meta
            for item in response.json().get("data", []):
                name = item.get("name")
                value = item.get("values", [{}])[0].get("value")
                
                if name == "post_reactions_by_type_total" and isinstance(value, dict):
                    insights_data['reactions'] = _parse_fb_reactions(value)
                elif value is not None and isinstance(value, int):
                    if name == "post_impressions":
                        insights_data['impressions'] = value
                    elif name == "post_impressions_unique":
                        insights_data['reach'] = value
                    elif name == "post_clicks":
                        # We use 'post_clicks' as the base for 'engagement'
                        # The router will add comments + shares to this.
                        insights_data['engagement'] = value
        
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching insights for post {post_id}: {e.response.text}")
            # Don't raise, just return empty data for this post
        except Exception as e:
            logger.error(f"Unexpected error fetching insights for {post_id}: {e}")
            # Don't raise, just return empty data for this post

    # Ensure all keys exist, even if they are 0 or default
    insights_data.setdefault('impressions', 0)
    insights_data.setdefault('reach', 0)
    insights_data.setdefault('engagement', 0)
    insights_data.setdefault('reactions', PostReactions(total=0))

    return insights_data

def _parse_fb_reactions(reactions_dict: Dict[str, int]) -> PostReactions:
    """Helper to convert Meta's reaction dict to our Pydantic schema."""
    total = sum(reactions_dict.values())
    return PostReactions(
        like=reactions_dict.get('like', 0),
        love=reactions_dict.get('love', 0),
        wow=reactions_dict.get('wow', 0),
        haha=reactions_dict.get('haha', 0),
        sad=reactions_dict.get('sad', 0),
        angry=reactions_dict.get('angry', 0),
        total=total
    )

async def get_instagram_post_list(
    instagram_id: str, 
    page_access_token: str, 
    since: datetime, 
    until: datetime
) -> List[Dict[str, Any]]:
    """
    Fetches a list of media from an Instagram Account within a date range.
    """
    logger.info(f"Fetching Instagram post list for Account ID: {instagram_id}")
    media_url = f"{GRAPH_API_URL}/{GRAPH_API_VERSION}/{instagram_id}/media"
    
    # Per your advice, comments/shares will come from the insights endpoint,
    # so we only need basic fields here.
    params = {
        "fields": "id,timestamp,caption,media_type",
        "since": since.isoformat(),
        "until": until.isoformat(),
        "limit": 50,
        "access_token": page_access_token
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(media_url, params=params)
        response.raise_for_status()
        
        # Filter out non-post types like stories
        all_media = response.json().get("data", [])
        posts = [
            item for item in all_media 
            if item.get("media_type") in ["IMAGE", "CAROUSEL_ALBUM"]
        ]
        return posts

# --- THIS FUNCTION IS NOW FIXED (Using your metrics) ---
async def get_instagram_post_insights(
    post_id: str, 
    page_access_token: str
) -> Dict[str, Any]:
    """
    Fetches insights for a single Instagram post (media object).
    """
    logger.debug(f"Fetching insights for Instagram Post ID: {post_id}")
    insights_url = f"{GRAPH_API_URL}/{GRAPH_API_VERSION}/{post_id}/insights"
    
    # --- THIS IS THE FIX (Part 2) ---
    # Using the valid v19.0 metrics you provided (changed 'saves' to 'saved')
    metrics = "impressions,reach,likes,comments,shares,saved"
    
    params = {"metric": metrics, "access_token": page_access_token}
    
    insights_data: Dict[str, Any] = {}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(insights_url, params=params)
            response.raise_for_status()
            
            # Helper to flatten the JSON response
            for item in response.json().get("data", []):
                name = item.get("name")
                value = item.get("values", [{}])[0].get("value")
                
                if value is not None:
                    # Map metric names to our schema names (as per your suggestion)
                    if name == "impressions":
                        insights_data['impressions'] = value
                    elif name == "reach":
                        insights_data['reach'] = value
                    elif name == "likes":
                        # We use setdefault to safely create the reactions dict
                        insights_data.setdefault('reactions', {})['like'] = value
                    elif name == "comments":
                        insights_data['comments'] = value
                    elif name == "shares":
                        insights_data['shares'] = value
                    elif name == "saved": # <-- THIS IS THE FIX (changed from 'saves')
                        insights_data['saved_count'] = value # Using 'saved_count' to avoid name clash
            
            # Manually calculate total engagement: likes + comments + shares + saves
            likes = insights_data.get('reactions', {}).get('like', 0)
            comments = insights_data.get('comments', 0)
            shares = insights_data.get('shares', 0)
            saves = insights_data.get('saved_count', 0)
            insights_data['engagement'] = likes + comments + shares + saves
            
            # Format reactions to match our schema
            insights_data['reactions'] = PostReactions(like=likes, total=likes)

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching insights for IG post {post_id}: {e.response.text}")
        except Exception as e:
            logger.error(f"Unexpected error fetching insights for IG {post_id}: {e}")

    # Ensure all keys exist, even if they are 0 or default
    insights_data.setdefault('impressions', 0)
    insights_data.setdefault('reach', 0)
    insights_data.setdefault('engagement', 0)
    insights_data.setdefault('comments', 0)
    insights_data.setdefault('shares', 0)
    insights_data.setdefault('saved_count', 0)
    insights_data.setdefault('reactions', PostReactions(total=0))

    return insights_data