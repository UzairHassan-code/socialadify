# D:\socialadify\backend\app\crud\user.py
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection # Ensure no leading space on this line
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import logging
from bson import ObjectId

from app.schemas.user import UserCreate, UserInDB, UserPublic, UserUpdate
from app.core.security import get_password_hash, verify_password

USERS_COLLECTION = "users"
# It's good practice to configure basicConfig once, e.g., in main.py or a dedicated logging setup.
# If already called elsewhere, this might not have an effect or could be redundant.
# For simplicity in this module, we'll keep it.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[UserInDB]:
    logger.info(f"Attempting to retrieve user by email: {email}")
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    user_data = await users_collection.find_one({"email": email.lower()}) 
    if user_data:
        logger.info(f"User found for email: {email.lower()}")
        return UserInDB(**user_data)
    logger.info(f"No user found for email: {email.lower()}")
    return None


async def create_user(db: AsyncIOMotorDatabase, user_create: UserCreate) -> UserPublic:
    logger.info(f"Attempting to create user with email: {user_create.email}")
    existing_user = await get_user_by_email(db, email=user_create.email.lower())
    if existing_user:
        logger.warning(f"Email {user_create.email.lower()} already registered.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    hashed_password = get_password_hash(user_create.password)
    
    user_in_db_data = user_create.model_dump(exclude_unset=True) 
    user_in_db_data["email"] = user_create.email.lower()
    user_in_db_data["hashed_password"] = hashed_password
    if "password" in user_in_db_data: 
        del user_in_db_data["password"]
    
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    result = await users_collection.insert_one(user_in_db_data)
    created_user_data = await users_collection.find_one({"_id": result.inserted_id})
    if not created_user_data:
        logger.error(f"Could not retrieve user {user_create.email.lower()} after insertion.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create user after insertion.")
    user_in_db_obj = UserInDB(**created_user_data)
    logger.info(f"User {user_in_db_obj.email} created successfully.")
    return UserPublic.from_user_in_db(user_in_db_obj)

async def authenticate_user(db: AsyncIOMotorDatabase, email: str, password: str) -> Optional[UserInDB]:
    logger.info(f"Attempting to authenticate user: {email}")
    user = await get_user_by_email(db, email=email.lower())
    if not user:
        logger.warning(f"Authentication failed: User {email.lower()} not found.")
        return None
    logger.info(f"User {email.lower()} found. Verifying password...")
    is_password_valid = verify_password(password, user.hashed_password)
    if not is_password_valid:
        logger.warning(f"Authentication failed: Invalid password for user {email.lower()}.")
        return None
    logger.info(f"Password verified successfully for user {email.lower()}. Authentication successful.")
    return user


async def update_user_profile(
    db: AsyncIOMotorDatabase, 
    user_id: ObjectId,
    user_update_data: UserUpdate # UserUpdate no longer has profile_picture_url
) -> Optional[UserInDB]:
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    update_data: Dict[str, Any] = user_update_data.model_dump(exclude_unset=True) 
    
    if not update_data:
        logger.info(f"No update data provided for user ID {user_id}.")
        current_user_data = await users_collection.find_one({"_id": user_id})
        if current_user_data: 
            return UserInDB(**current_user_data)
        return None

    logger.info(f"Attempting to update profile for user ID {user_id} with data: {update_data}")
    result = await users_collection.update_one({"_id": user_id}, {"$set": update_data})
    
    # Check if at least one document was matched, even if no modifications were made
    # (e.g., update data was same as existing data)
    if result.matched_count > 0:
        logger.info(f"Profile for user ID {user_id} processed (modified count: {result.modified_count}).")
        updated_user_data = await users_collection.find_one({"_id": user_id})
        if updated_user_data: 
            return UserInDB(**updated_user_data)
    else:
        logger.warning(f"Profile update for user ID {user_id} failed: User not found or no changes applied.")
        # If user not found, result.matched_count would be 0.
        # If user found but data was identical, matched_count > 0 but modified_count == 0.
        # The logic above handles returning the user if matched.
        # This else block is for cases where matched_count is 0.
    return None
# Ensure there are no extra characters or misaligned indentation after this line.
# A final newline character at the end of the file is standard practice.
