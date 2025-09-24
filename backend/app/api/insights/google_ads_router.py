# D:\socialadify\backend\app\api\insights\google_ads_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import logging
from typing import Annotated

from app.core.security import get_current_active_user
from app.schemas.user import UserInDB, UserPublic
import app.services.google_ads_service as google_ads_service
from app.crud import user as user_service
from app.db.session import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

# --- Dependencies ---
CurrentUserDependency = Annotated[UserInDB, Depends(get_current_active_user)]
DbDependency = Annotated[AsyncIOMotorDatabase, Depends(get_database)]

# --- Router Setup ---
router = APIRouter()
logger = logging.getLogger(__name__)

# --- Pydantic Model for the request body ---
class AdAccountSelection(BaseModel):
    ad_account_id: str


@router.get("/google/ad-accounts")
async def get_google_ad_accounts(current_user: CurrentUserDependency):
    """
    Fetches a list of all Google Ads accounts accessible by the authenticated user.
    """
    logger.info(f"Fetching Google Ads accounts for user: {current_user.email}")

    if not current_user.google_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account not connected or refresh token is missing."
        )

    try:
        google_client = google_ads_service.get_google_ads_client(
            refresh_token=current_user.google_refresh_token
        )
        accounts = google_ads_service.list_accessible_customers(client=google_client)
        return {"accounts": accounts}
    except Exception as e:
        logger.error(f"An error occurred while fetching Google Ads accounts for {current_user.email}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve Google Ads accounts."
        )


@router.post("/google/set-ad-account", response_model=UserPublic)
async def set_google_ad_account(
    selection: AdAccountSelection,
    current_user: CurrentUserDependency,
    db: DbDependency
):
    """
    Saves the user's selected Google Ad Account ID to their profile.
    """
    logger.info(f"User {current_user.email} selected Google Ad Account ID: {selection.ad_account_id}")

    updated_user = await user_service.set_user_google_ad_account(
        db=db,
        user_id=current_user.id,
        ad_account_id=selection.ad_account_id
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile with the selected ad account."
        )
    
    logger.info(f"Successfully set ad account for user {current_user.email}")
    return UserPublic.from_user_in_db(updated_user)


# --- *** THIS IS THE FIX: The missing endpoint is now included *** ---
@router.get("/google/campaigns")
async def get_google_campaigns(current_user: CurrentUserDependency):
    """
    Fetches Google Ads campaigns for the user's selected ad account.
    """
    logger.info(f"Fetching Google Ads campaigns for user: {current_user.email}")

    if not current_user.google_refresh_token or not current_user.google_ad_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account is not fully configured. Please select an ad account."
        )

    try:
        google_client = google_ads_service.get_google_ads_client(
            refresh_token=current_user.google_refresh_token
        )
        
        campaigns = google_ads_service.get_campaigns(
            client=google_client, 
            customer_id=current_user.google_ad_account_id
        )
        
        return {"campaigns": campaigns}

    except Exception as e:
        logger.error(f"An error occurred while fetching Google campaigns for {current_user.email}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve Google Ads campaigns."
        )
