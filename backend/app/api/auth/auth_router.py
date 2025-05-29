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

from app.schemas.user import UserCreate, UserPublic, Token, UserInDB, UserUpdate, PasswordResetRequest, PasswordResetConfirm # CORRECTED: Import PasswordResetRequest and PasswordResetConfirm
from app.crud import user as user_service
from app.core.security import create_access_token, get_current_active_user
from app.db.session import get_database

_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent.parent
PROFILE_PICS_DIR = _BACKEND_ROOT / "static" / "profile_pics"


router = APIRouter()
logger = logging.getLogger(__name__)
DbDependency = Annotated[AsyncIOMotorDatabase, Depends(get_database)]
CurrentUserDependency = Annotated[UserInDB, Depends(get_current_active_user)]


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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    access_token = create_access_token(data={"sub": user.email}) # Token 'sub' is based on current email
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
    if firstname is not None: update_data_dict["firstname"] = firstname
    if lastname is not None: update_data_dict["lastname"] = lastname
    if new_email is not None: update_data_dict["new_email"] = new_email

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
        raise HTTPException(status_code=400, detail=f"Unsupported image extension: {file_extension}. Allowed: {', '.join(allowed_extensions)}.")
    timestamp = int(time.time())
    unique_filename = f"{str(current_user.id)}_{timestamp}{file_extension}"
    file_path = PROFILE_PICS_DIR / unique_filename
    try:
        with open(file_path, "wb") as buffer: shutil.copyfileobj(profile_picture.file, buffer)
        logger.info(f"Profile picture for {current_user.email} saved to: {file_path}")
    except Exception as e:
        logger.error(f"Failed to save profile picture for {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not save profile picture.")
    finally:
        profile_picture.file.close()
    profile_picture_url_path = f"/static/profile_pics/{unique_filename}"
    updated_user_db = await user_service.update_user_profile(
        db=db, user_id=current_user.id,
        user_update_data=UserUpdate(), # Pass empty UserUpdate for text fields
        profile_picture_url=profile_picture_url_path
    )
    if not updated_user_db:
        logger.error(f"Failed to update profile picture URL in DB for user {current_user.email}")
        if file_path.exists():
            try: os.remove(file_path); logger.info(f"Orphaned profile picture deleted: {file_path}")
            except Exception as e_del: logger.error(f"Error deleting orphaned profile picture {file_path}: {e_del}")
        raise HTTPException(status_code=500, detail="Could not update profile picture information.")
    logger.info(f"Profile picture for {updated_user_db.email} updated successfully. URL: {profile_picture_url_path}")
    return UserPublic.from_user_in_db(updated_user_db)
