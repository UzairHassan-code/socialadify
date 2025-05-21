# D:\socialadify\backend\app\api\auth\auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status, Form # Ensure no leading space on this line
from fastapi.security import OAuth2PasswordRequestForm 
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Annotated, Optional
# Removed shutil, Path as they were for file ops
import logging

from app.schemas.user import UserCreate, UserPublic, Token, UserInDB, UserUpdate 
from app.crud import user as user_service 
from app.core.security import create_access_token, get_current_active_user
from app.db.session import get_database

router = APIRouter()
logger = logging.getLogger(__name__) # Ensure logger is defined
DbDependency = Annotated[AsyncIOMotorDatabase, Depends(get_database)]
CurrentUserDependency = Annotated[UserInDB, Depends(get_current_active_user)]

# Removed PROFILE_PICS_DIR and STATIC_FILES_DIR definitions as profile picture feature is removed

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
    access_token = create_access_token(data={"sub": user.email})
    logger.info(f"Login successful for user: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserPublic)
async def read_users_me(current_user: CurrentUserDependency):
    logger.info(f"Executing /users/me for user: {current_user.email}")
    return UserPublic.from_user_in_db(current_user)

# --- MODIFIED PROFILE UPDATE ENDPOINT (No File Upload) ---
@router.put("/users/me/profile", response_model=UserPublic)
async def update_current_user_profile(
    current_user: CurrentUserDependency,
    db: DbDependency,
    firstname: Optional[str] = Form(None), # Accept as Form data
    lastname: Optional[str] = Form(None)  # Accept as Form data
):
    logger.info(f"Attempting to update profile (no pic) for user: {current_user.email}")
    
    update_data_dict = {}
    if firstname is not None: 
        update_data_dict["firstname"] = firstname
    if lastname is not None: 
        update_data_dict["lastname"] = lastname
    
    if not update_data_dict:
        logger.info(f"No actual text update data provided for user {current_user.email}, returning current profile.")
        return UserPublic.from_user_in_db(current_user)

    user_update_schema = UserUpdate(**update_data_dict)

    updated_user_db = await user_service.update_user_profile(
        db=db, 
        user_id=current_user.id, # Pass ObjectId
        user_update_data=user_update_schema
    )

    if not updated_user_db:
        logger.error(f"Failed to update profile in DB for user {current_user.email}")
        raise HTTPException(status_code=500, detail="Could not update profile.")
    
    logger.info(f"Profile for {updated_user_db.email} updated successfully in DB.")
    return UserPublic.from_user_in_db(updated_user_db)
# Ensure the file ends cleanly here, typically with a newline character.
# No extra spaces or misaligned indentation below this line.
