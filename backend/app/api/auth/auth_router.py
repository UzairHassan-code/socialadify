# D:\socialadify\backend\app\api\auth\auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Annotated, Optional
import logging
import shutil
from pathlib import Path
import time
import os
import secrets
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel

from app.core.config import settings
from app.db.session import get_database

# from app.api.deps import get_current_active_user
# from app.models.user import UserInDB
from app.schemas.user import UserInDB


import httpx
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger

router = APIRouter()

from app.schemas.user import UserCreate, UserPublic, Token, UserInDB, UserUpdate, PasswordResetRequest, PasswordResetConfirm  # CORRECTED: Import PasswordResetRequest and PasswordResetConfirm
from app.crud import user as user_service
from app.core.security import create_access_token, get_current_active_user
from app.db.session import get_database

_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent.parent
PROFILE_PICS_DIR = _BACKEND_ROOT / "static" / "profile_pics"

router = APIRouter()
logger = logging.getLogger(__name__)
DbDependency = Annotated[AsyncIOMotorDatabase, Depends(get_database)]
CurrentUserDependency = Annotated[UserInDB, Depends(get_current_active_user)]


class GoogleToken(BaseModel):
    id_token: str


@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def signup_user(user_in: UserCreate, db: DbDependency):
    logger.info(f"Signup attempt for email: {user_in.email}")
    existing_user = await user_service.get_user_by_email(db, email=user_in.email.lower())
    if existing_user:
        logger.warning(f"Signup failed: Email {user_in.email.lower()} already registered.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    created_user = await user_service.create_user(db=db, user_create=user_in)
    logger.info(f"Signup successful for email: {created_user.email}")
    return created_user


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbDependency):
    logger.info(f"Login attempt for username: {form_data.username}")
    user = await user_service.authenticate_user(db=db, email=form_data.username.lower(), password=form_data.password)
    if not user:
        logger.warning(f"Login failed for username: {form_data.username.lower()}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token = create_access_token(data={"sub": user.email})  # Token 'sub' is based on current email
    logger.info(f"Login successful for user: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=UserPublic)
async def read_users_me(current_user: CurrentUserDependency):
    logger.info(f"Executing /users/me for user: {current_user.email}")
    return UserPublic.from_user_in_db(current_user)


@router.put("/users/me/profile", response_model=UserPublic)
async def update_current_user_profile_text_and_email(
    current_user: CurrentUserDependency,
    db: DbDependency,
    firstname: Optional[str] = Form(None),
    lastname: Optional[str] = Form(None),
    new_email: Optional[str] = Form(None)
):
    logger.info(f"Attempting to update profile text/email for user: {current_user.email}")

    update_data_dict = {}
    if firstname is not None:
        update_data_dict["firstname"] = firstname
    if lastname is not None:
        update_data_dict["lastname"] = lastname
    if new_email is not None:
        update_data_dict["new_email"] = new_email

    if not update_data_dict:
        logger.info(f"No actual text/email update data provided for user {current_user.email}, returning current profile.")
        return UserPublic.from_user_in_db(current_user)

    try:
        user_update_schema = UserUpdate(**update_data_dict)
    except Exception as e:
        logger.warning(f"Invalid data for profile update: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    try:
        updated_user_db = await user_service.update_user_profile(
            db=db,
            user_id=current_user.id,
            user_update_data=user_update_schema
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error updating profile for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update profile.")

    if not updated_user_db:
        logger.error(f"Failed to update profile text/email in DB for user {current_user.email}")
        raise HTTPException(status_code=500, detail="Could not update profile information.")

    response_message = f"Profile for {updated_user_db.email} updated successfully."
    if new_email and new_email.lower() != current_user.email.lower():
        response_message += " Please log out and log back in with your new email address to update your session."

    logger.info(response_message)
    return UserPublic.from_user_in_db(updated_user_db)


@router.post("/users/me/profile-picture", response_model=UserPublic)
async def upload_profile_picture(
    current_user: CurrentUserDependency,
    db: DbDependency,
    profile_picture: UploadFile = File(...)
):
    logger.info(f"Attempting to upload profile picture for user: {current_user.email}, filename: {profile_picture.filename}")
    if not profile_picture.content_type or not profile_picture.content_type.startswith("image/"):
        logger.warning(f"Invalid file type: {profile_picture.content_type} for user {current_user.email}")
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    PROFILE_PICS_DIR.mkdir(parents=True, exist_ok=True)
    file_extension = Path(profile_picture.filename).suffix.lower() if profile_picture.filename else ".jpg"
    allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]

    if file_extension not in allowed_extensions:
        logger.warning(f"Unsupported image extension: {file_extension} for user {current_user.email}")
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image extension: {file_extension}. Allowed: {', '.join(allowed_extensions)}."
        )

    timestamp = int(time.time())
    unique_filename = f"{str(current_user.id)}_{timestamp}{file_extension}"
    file_path = PROFILE_PICS_DIR / unique_filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(profile_picture.file, buffer)
        logger.info(f"Profile picture for {current_user.email} saved to: {file_path}")
    except Exception as e:
        logger.error(f"Failed to save profile picture for {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not save profile picture.")
    finally:
        profile_picture.file.close()

    profile_picture_url_path = f"/static/profile_pics/{unique_filename}"
    updated_user_db = await user_service.update_user_profile(
        db=db,
        user_id=current_user.id,
        user_update_data=UserUpdate(),  # Pass empty UserUpdate for text fields
        profile_picture_url=profile_picture_url_path
    )

    if not updated_user_db:
        logger.error(f"Failed to update profile picture URL in DB for user {current_user.email}")
        if file_path.exists():
            try:
                os.remove(file_path)
                logger.info(f"Orphaned profile picture deleted: {file_path}")
            except Exception as e_del:
                logger.error(f"Error deleting orphaned profile picture {file_path}: {e_del}")
        raise HTTPException(status_code=500, detail="Could not update profile picture information.")

    logger.info(f"Profile picture for {updated_user_db.email} updated successfully. URL: {profile_picture_url_path}")
    return UserPublic.from_user_in_db(updated_user_db)


@router.post("/google-login", response_model=Token)
async def google_signup_login(google_token: GoogleToken, db: DbDependency):
    """
    Handles Google ID token for user sign-up or login.
    If the user does not exist, a new account is created.
    If the user exists, they are logged in.
    """
    logger.info("Attempting Google sign-up/login.")
    try:
        # Get Google Client ID from environment variable
        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        if not GOOGLE_CLIENT_ID:
            logger.error("GOOGLE_CLIENT_ID environment variable not set. This is required for Google authentication.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server configuration error: Google Client ID is missing."
            )

        # Verify the Google ID token
        id_info = id_token.verify_oauth2_token(
            google_token.id_token, requests.Request(), GOOGLE_CLIENT_ID
        )

        user_email = id_info['email'].lower()
        user_firstname = id_info.get('given_name')
        user_lastname = id_info.get('family_name')
        google_profile_picture_url = id_info.get('picture')

        logger.info(f"Google token verified for email: {user_email}")

        existing_user = await user_service.get_user_by_email(db, email=user_email)
        user_to_authenticate = None

        if not existing_user:
            # If user does not exist, create a new account
            logger.info(f"New user: {user_email}. Creating account via Google.")
            dummy_password = secrets.token_urlsafe(16)
            user_create_data = UserCreate(
                email=user_email,
                password=dummy_password,
                firstname=user_firstname or "",
                lastname=user_lastname or "",
                profile_picture_url=google_profile_picture_url
            )
            created_user = await user_service.create_user(db=db, user_create=user_create_data)
            user_to_authenticate = created_user
            logger.info(f"User {user_email} created successfully via Google.")
        else:
            # If user exists, log them in
            logger.info(f"Existing user: {user_email}. Logging in via Google.")
            user_to_authenticate = existing_user

            update_data = {}
            if user_firstname is not None and existing_user.firstname != user_firstname:
                update_data["firstname"] = user_firstname
            if user_lastname is not None and existing_user.lastname != user_lastname:
                update_data["lastname"] = user_lastname

            profile_pic_updated = False
            if google_profile_picture_url is not None and existing_user.profile_picture_url != google_profile_picture_url:
                profile_pic_updated = True

            if update_data or profile_pic_updated:
                try:
                    user_update_schema = UserUpdate(**update_data)
                    await user_service.update_user_profile(
                        db=db,
                        user_id=existing_user.id,
                        user_update_data=user_update_schema,
                        profile_picture_url=google_profile_picture_url if profile_pic_updated else None
                    )
                    logger.info(f"Updated profile details for existing user {user_email} from Google.")
                except Exception as e:
                    logger.warning(f"Failed to update profile for existing user {user_email} from Google: {e}")

        access_token = create_access_token(data={"sub": user_to_authenticate.email})
        logger.info(f"Google login successful for user: {user_email}")
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        logger.warning(f"Google token verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google ID token")
    except Exception as e:
        logger.error(f"An unexpected error occurred during Google authentication: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during authentication. Please try again later."
        )
    
# #Connection Code:

# @router.get("/auth/meta/callback", status_code=status.HTTP_200_OK)
# async def meta_callback(
#     code: str,
#     db: AsyncIOMotorDatabase = Depends(get_database),
#     current_user: UserInDB = Depends(get_current_active_user)
# ):
#     """
#     Handles the callback from Meta after user authentication.
#     Exchanges the authorization code for a long-lived access token,
#     and then finds and saves the linked Instagram Business account.
#     """
#     logger.info("Received callback from Meta. Attempting to exchange code for token.")

#     # 1. Exchange the authorization code for a short-lived access token
#     token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
#     params = {
#         "client_id": settings.META_APP_ID,
#         "redirect_uri": settings.META_CALLBACK_URL,
#         "client_secret": settings.META_APP_SECRET,
#         "code": code,
#     }
    
#     async with httpx.AsyncClient() as client:
#         try:
#             token_response = await client.get(token_url, params=params)
#             token_response.raise_for_status()
#             short_lived_access_token = token_response.json()["access_token"]
#         except httpx.HTTPStatusError as e:
#             logger.error(f"Failed to get short-lived access token: {e.response.text}", exc_info=True)
#             raise HTTPException(status_code=400, detail="Failed to get access token from Meta.")

#     logger.info("Successfully received short-lived access token. Now getting long-lived token.")
    
#     # 2. Exchange the short-lived access token for a long-lived one
#     long_lived_token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
#     long_lived_params = {
#         "grant_type": "fb_exchange_token",
#         "client_id": settings.META_APP_ID,
#         "client_secret": settings.META_APP_SECRET,
#         "fb_exchange_token": short_lived_access_token,
#     }

#     async with httpx.AsyncClient() as client:
#         try:
#             long_lived_response = await client.get(long_lived_token_url, params=long_lived_params)
#             long_lived_response.raise_for_status()
#             long_lived_access_token = long_lived_response.json()["access_token"]
#         except httpx.HTTPStatusError as e:
#             logger.error(f"Failed to exchange for long-lived token: {e.response.text}", exc_info=True)
#             raise HTTPException(status_code=400, detail="Failed to get long-lived token from Meta.")

#     logger.info("Successfully received long-lived access token. Now fetching pages.")
    
#     # 3. Use the long-lived token to find the linked Instagram Business Account
#     accounts_url = f"https://graph.facebook.com/v19.0/me/accounts?access_token={long_lived_access_token}"
#     async with httpx.AsyncClient() as client:
#         try:
#             accounts_response = await client.get(accounts_url)
#             accounts_response.raise_for_status()
#             pages_data = accounts_response.json().get("data", [])
#         except httpx.HTTPStatusError as e:
#             logger.error(f"Failed to get user's pages: {e.response.text}", exc_info=True)
#             raise HTTPException(status_code=500, detail="Failed to retrieve user's pages.")

#     instagram_accounts = []
#     for page in pages_data:
#         page_id = page.get("id")
#         page_access_token = page.get("access_token")
        
#         # Get the page's details, including the linked Instagram account
#         page_details_url = f"https://graph.facebook.com/v19.0/{page_id}?fields=instagram_business_account&access_token={page_access_token}"
#         async with httpx.AsyncClient() as client:
#             try:
#                 page_details_response = await client.get(page_details_url)
#                 page_details_response.raise_for_status()
#                 page_details = page_details_response.json()
                
#                 instagram_business_account = page_details.get("instagram_business_account")
#                 if instagram_business_account:
#                     # Found an Instagram account, now get its details
#                     ig_account_id = instagram_business_account.get("id")
                    
#                     ig_account_details_url = f"https://graph.facebook.com/v19.0/{ig_account_id}?fields=username,name,profile_picture_url&access_token={page_access_token}"
#                     ig_account_details_response = await client.get(ig_account_details_url)
#                     ig_account_details_response.raise_for_status()
#                     ig_account_data = ig_account_details_response.json()
                    
#                     # Store the relevant data
#                     account_data = {
#                         "platform": "instagram",
#                         "username": ig_account_data.get("username"),
#                         "platform_id": ig_account_id,
#                         "access_token": page_access_token, # We use the page access token for Instagram API calls
#                         "page_id": page_id,
#                         "profile_pic_url": ig_account_data.get("profile_picture_url")
#                     }
#                     instagram_accounts.append(account_data)
                    
#             except httpx.HTTPStatusError as e:
#                 logger.warning(f"Could not get details for page {page_id}: {e.response.text}")
#                 continue

#     if not instagram_accounts:
#         raise HTTPException(status_code=404, detail="No Instagram Business Account found linked to your Facebook Pages.")

#     # 4. Save all found accounts to the database
#     for account in instagram_accounts:
#         linked_account_data = LinkedAccountCreate(
#             user_id=str(current_user.id),
#             platform=account["platform"],
#             platform_id=account["platform_id"],
#             access_token=account["access_token"],
#             page_id=account["page_id"],
#             username=account["username"],
#             profile_pic_url=account["profile_pic_url"]
#         )
#         await create_linked_account_for_user(db, linked_account_data)

#     return {"message": "Instagram account(s) successfully linked.", "accounts_linked": len(instagram_accounts)}


# @router.get("/connect/meta", response_model=OAuthURLResponse, status_code=status.HTTP_200_OK)
# async def connect_meta(request: Request, current_user: UserInDB = Depends(get_current_active_user)):
#     """
#     Initiates the OAuth 2.0 flow for Meta.
#     Generates a secure OAuth URL and saves the state token for later validation.
#     """
#     # 1. Generate a secure, unique state token to prevent CSRF attacks.
#     state = secrets.token_urlsafe(16)
#     # 2. Store the state token in the user's session or a temporary database.
#     #    For simplicity, we'll use a temporary, in-memory dictionary.
#     STATE_STORAGE[str(current_user.id)] = state

#     # 3. Build the authorization URL with required parameters.
#     scopes = [
#         "pages_show_list",
#         "instagram_basic",
#         "instagram_manage_comments",
#         "pages_read_engagement",
#         "ads_management"
#     ]

#     auth_url = (
#         f"https://www.facebook.com/v19.0/dialog/oauth?"
#         f"client_id={settings.META_APP_ID}&"
#         f"redirect_uri={settings.META_CALLBACK_URL}&"
#         f"scope={','.join(scopes)}&"
#         f"state={state}"
#     )

#     return {"redirect_url": auth_url}

# # Include the SSO router at the end of the file to register its endpoints
# router.include_router(sso_router, prefix="/sso", tags=["sso"])




# #Connection Code:
# @router.get("/auth/meta/callback", status_code=status.HTTP_200_OK)
# async def meta_callback(
#     code: str,
#     db: AsyncIOMotorDatabase = Depends(get_database),
#     current_user: UserInDB = Depends(get_current_active_user)
# ):
#     """
#     Handles the callback from Meta after user authentication.
#     Exchanges the authorization code for a long-lived access token,
#     and then finds and saves the linked Instagram Business account.
#     """
#     logger.info("Received callback from Meta. Attempting to exchange code for token.")

#     # 1. Exchange the authorization code for a short-lived access token
#     token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
#     params = {
#         "client_id": settings.META_APP_ID,
#         "redirect_uri": settings.META_CALLBACK_URL,
#         "client_secret": settings.META_APP_SECRET,
#         "code": code,
#     }

#     async with httpx.AsyncClient() as client:
#         try:
#             token_response = await client.get(token_url, params=params)
#             token_response.raise_for_status()
#             short_lived_access_token = token_response.json()["access_token"]
#         except httpx.HTTPStatusError as e:
#             logger.error(f"Failed to get short-lived access token: {e.response.text}", exc_info=True)
#             raise HTTPException(status_code=400, detail="Failed to get access token from Meta.")

#     logger.info("Successfully received short-lived access token. Now getting long-lived token.")

#     # 2. Exchange the short-lived access token for a long-lived one
#     long_lived_token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
#     long_lived_params = {
#         "grant_type": "fb_exchange_token",
#         "client_id": settings.META_APP_ID,
#         "client_secret": settings.META_APP_SECRET,
#         "fb_exchange_token": short_lived_access_token,
#     }

#     async with httpx.AsyncClient() as client:
#         try:
#             long_lived_response = await client.get(long_lived_token_url, params=long_lived_params)
#             long_lived_response.raise_for_status()
#             long_lived_access_token = long_lived_response.json()["access_token"]
#         except httpx.HTTPStatusError as e:
#             logger.error(f"Failed to exchange for long-lived token: {e.response.text}", exc_info=True)
#             raise HTTPException(status_code=400, detail="Failed to get long-lived token from Meta.")

#     logger.info("Successfully received long-lived access token. Now fetching pages.")

#     # 3. Use the long-lived token to find the linked Instagram Business Account
#     accounts_url = f"https://graph.facebook.com/v19.0/me/accounts?access_token={long_lived_access_token}"
#     async with httpx.AsyncClient() as client:
#         try:
#             accounts_response = await client.get(accounts_url)
#             accounts_response.raise_for_status()
#             pages_data = accounts_response.json().get("data", [])
#         except httpx.HTTPStatusError as e:
#             logger.error(f"Failed to get user's pages: {e.response.text}", exc_info=True)
#             raise HTTPException(status_code=500, detail="Failed to retrieve user's pages.")

#     instagram_accounts = []
#     for page in pages_data:
#         page_id = page.get("id")
#         page_access_token = page.get("access_token")

#         # Get the page's details, including the linked Instagram account
#         page_details_url = f"https://graph.facebook.com/v19.0/{page_id}?fields=instagram_business_account&access_token={page_access_token}"
#         async with httpx.AsyncClient() as client:
#             try:
#                 page_details_response = await client.get(page_details_url)
#                 page_details_response.raise_for_status()
#                 page_details = page_details_response.json()

#                 instagram_business_account = page_details.get("instagram_business_account")
#                 if instagram_business_account:
#                     # Found an Instagram account, now get its details
#                     ig_account_id = instagram_business_account.get("id")

#                     ig_account_details_url = f"https://graph.facebook.com/v19.0/{ig_account_id}?fields=username,name,profile_picture_url&access_token={page_access_token}"
#                     ig_account_details_response = await client.get(ig_account_details_url)
#                     ig_account_details_response.raise_for_status()
#                     ig_account_data = ig_account_details_response.json()

#                     # Store the relevant data
#                     account_data = {
#                         "platform": "instagram",
#                         "username": ig_account_data.get("username"),
#                         "platform_id": ig_account_id,
#                         "access_token": page_access_token,  # We use the page access token for Instagram API calls
#                         "page_id": page_id,
#                         "profile_pic_url": ig_account_data.get("profile_picture_url"),
#                     }
#                     instagram_accounts.append(account_data)

#             except httpx.HTTPStatusError as e:
#                 logger.warning(f"Could not get details for page {page_id}: {e.response.text}")
#                 continue

#     if not instagram_accounts:
#         raise HTTPException(status_code=404, detail="No Instagram Business Account found linked to your Facebook Pages.")

#     # 4. Save all found accounts to the database
#     for account in instagram_accounts:
#         linked_account_data = LinkedAccountCreate(
#             user_id=str(current_user.id),
#             platform=account["platform"],
#             platform_id=account["platform_id"],
#             access_token=account["access_token"],
#             page_id=account["page_id"],
#             username=account["username"],
#             profile_pic_url=account["profile_pic_url"]
#         )
#         await create_linked_account_for_user(db, linked_account_data)

#     return {"message": "Instagram account(s) successfully linked.", "accounts_linked": len(instagram_accounts)}


# @router.get("/connect/meta", response_model=OAuthURLResponse, status_code=status.HTTP_200_OK)
# async def connect_meta(request: Request, current_user: UserInDB = Depends(get_current_active_user)):
#     """
#     Initiates the OAuth 2.0 flow for Meta.
#     Generates a secure OAuth URL and saves the state token for later validation.
#     """
#     # 1. Generate a secure, unique state token to prevent CSRF attacks.
#     state = secrets.token_urlsafe(16)
#     # 2. Store the state token in the user's session or a temporary database.
#     STATE_STORAGE[str(current_user.id)] = state

#     # 3. Build the authorization URL with required parameters.
#     scopes = [
#         "pages_show_list",
#         "instagram_basic",
#         "instagram_manage_comments",
#         "pages_read_engagement",
#         "ads_management"
#     ]

#     auth_url = (
#         f"https://www.facebook.com/v19.0/dialog/oauth?"
#         f"client_id={settings.META_APP_ID}&"
#         f"redirect_uri={settings.META_CALLBACK_URL}&"
#         f"scope={','.join(scopes)}&"
#         f"state={state}"
#     )

#     return {"redirect_url": auth_url}


# # ⚠️ Do not include this here unless you actually have `sso_router` defined.
# # router.include_router(sso_router, prefix="/sso", tags=["sso"])
