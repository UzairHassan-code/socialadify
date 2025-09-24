# D:\socialadify\backend\app\api\insights\meta_router.py
from fastapi import APIRouter, Depends, HTTPException, status
import logging
from typing import Annotated, Dict, Any, List

from app.core.security import get_current_active_user
from app.schemas.user import UserInDB

# --- Dependencies ---
CurrentUserDependency = Annotated[UserInDB, Depends(get_current_active_user)]

# --- Router Setup ---
router = APIRouter()
logger = logging.getLogger(__name__)

# --- REALISTIC MOCK DATA ---
# This is a fake list of campaigns that looks exactly like the real Meta API response.
# You can change these names and numbers to whatever you like.
MOCK_CAMPAIGN_DATA: Dict[str, List[Dict[str, Any]]] = {
    "data": [
        {
            "id": "120202304128940123",
            "name": "Summer Sale 2024 - Traffic",
            "status": "PAUSED",
            "objective": "OUTCOME_TRAFFIC",
            "spend": "152.34",
            "impressions": "25432",
            "clicks": "1289",
            "cpc": "0.12",
            "ctr": "5.07",
            "created_time": "2024-06-15T10:00:00-0700"
        },
        {
            "id": "120202304128940456",
            "name": "New Product Launch - Leads",
            "status": "ACTIVE",
            "objective": "OUTCOME_LEADS",
            "spend": "345.67",
            "impressions": "45123",
            "clicks": "2103",
            "cpc": "0.16",
            "ctr": "4.66",
            "created_time": "2024-07-01T12:30:00-0700"
        },
        {
            "id": "120202304128940789",
            "name": "Brand Awareness Campaign",
            "status": "ARCHIVED",
            "objective": "OUTCOME_AWARENESS",
            "spend": "500.00",
            "impressions": "150876",
            "clicks": "1502",
            "cpc": "0.33",
            "ctr": "0.99",
            "created_time": "2024-05-20T09:00:00-0700"
        }
    ],
    "paging": {
        "cursors": {
            "before": "MAZDZD",
            "after": "MAZDZD"
        }
    }
}


@router.get("/campaigns", status_code=status.HTTP_200_OK)
async def get_meta_ad_campaigns(current_user: CurrentUserDependency):
    """
    Returns a list of realistic MOCK ad campaigns for the authenticated user.
    This endpoint still requires the user to have connected their Meta account
    to simulate the full end-to-end feature.
    """
    logger.info(f"Fetching MOCK Meta ad campaigns for user: {current_user.email}")

    # We still check for credentials to prove the connection flow works.
    if not current_user.meta_ad_account_id or not current_user.meta_access_token:
        logger.warning(f"User {current_user.email} attempted to fetch campaigns without Meta credentials.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Meta account not connected. Please connect your account in the settings.",
        )

    # Instead of calling the Meta API, we just return our mock data.
    logger.info(f"Successfully returned {len(MOCK_CAMPAIGN_DATA.get('data', []))} mock campaigns for user {current_user.email}")
    
    return MOCK_CAMPAIGN_DATA
