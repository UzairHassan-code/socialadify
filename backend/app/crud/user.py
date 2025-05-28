# D:\socialadify\backend\app\crud\user.py
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection 
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import logging
from bson import ObjectId
from datetime import datetime, timedelta 

from app.schemas.user import UserCreate, UserInDB, UserPublic, UserUpdate 
from app.core.security import get_password_hash, verify_password
from app.crud.caption import delete_captions_by_user_id # Import function to delete related captions

USERS_COLLECTION = "users"
logging.basicConfig(level=logging.INFO) 
logger = logging.getLogger(__name__)

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[UserInDB]:
    # ... (existing code)
    logger.info(f"Attempting to retrieve user by email: {email}")
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    user_data = await users_collection.find_one({"email": email.lower()}) 
    if user_data:
        logger.info(f"User found for email: {email.lower()}")
        return UserInDB(**user_data)
    logger.info(f"No user found for email: {email.lower()}")
    return None

async def create_user(db: AsyncIOMotorDatabase, user_create: UserCreate) -> UserPublic:
    # ... (existing code)
    logger.info(f"Attempting to create user with email: {user_create.email}")
    existing_user = await get_user_by_email(db, email=user_create.email.lower())
    if existing_user:
        logger.warning(f"Email {user_create.email.lower()} already registered.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed_password = get_password_hash(user_create.password)
    user_in_db_data = user_create.model_dump(exclude_unset=True) 
    user_in_db_data["email"] = user_create.email.lower() 
    user_in_db_data["hashed_password"] = hashed_password
    if "password" in user_in_db_data: del user_in_db_data["password"]
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
    # ... (existing code)
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
    user_update_data: UserUpdate, 
    profile_picture_url: Optional[str] = None 
) -> Optional[UserInDB]:
    # ... (existing code)
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    update_data: Dict[str, Any] = {}
    if user_update_data.firstname is not None: update_data["firstname"] = user_update_data.firstname
    if user_update_data.lastname is not None: update_data["lastname"] = user_update_data.lastname
    if user_update_data.new_email is not None:
        new_email_lower = user_update_data.new_email.lower()
        existing_user_with_new_email = await users_collection.find_one({"email": new_email_lower})
        if existing_user_with_new_email and existing_user_with_new_email["_id"] != user_id:
            logger.warning(f"Attempt to update email to {new_email_lower} failed: email already registered by another user.")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New email address is already in use.")
        update_data["email"] = new_email_lower
        logger.info(f"User {user_id} email will be updated to {new_email_lower}")
    if profile_picture_url is not None: update_data["profile_picture_url"] = profile_picture_url
    if not update_data:
        logger.info(f"No update data provided for user ID {user_id}.")
        current_user_data = await users_collection.find_one({"_id": user_id})
        if current_user_data: return UserInDB(**current_user_data)
        return None
    logger.info(f"Attempting to update profile for user ID {user_id} with data: {update_data}")
    result = await users_collection.update_one({"_id": user_id}, {"$set": update_data})
    if result.matched_count > 0:
        logger.info(f"Profile for user ID {user_id} processed (modified count: {result.modified_count}).")
        updated_user_data = await users_collection.find_one({"_id": user_id})
        if updated_user_data: return UserInDB(**updated_user_data)
    else:
        logger.warning(f"Profile update for user ID {user_id} failed: User not found.")
    return None

async def set_password_reset_token(db: AsyncIOMotorDatabase, user: UserInDB, token: str, expires_delta_seconds: int) -> bool:
    # ... (existing code)
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    expires_at = datetime.utcnow() + timedelta(seconds=expires_delta_seconds)
    result = await users_collection.update_one(
        {"_id": user.id},
        {"$set": {"password_reset_token": token, "password_reset_token_expires_at": expires_at}}
    )
    return result.modified_count == 1

async def get_user_by_password_reset_token(db: AsyncIOMotorDatabase, token: str) -> Optional[UserInDB]:
    # ... (existing code)
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    user_data = await users_collection.find_one({
        "password_reset_token": token,
        "password_reset_token_expires_at": {"$gt": datetime.utcnow()} 
    })
    if user_data:
        return UserInDB(**user_data)
    return None

async def update_user_password(db: AsyncIOMotorDatabase, user: UserInDB, new_password: str) -> bool: 
    # ... (existing code)
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    hashed_password = get_password_hash(new_password)
    result = await users_collection.update_one(
        {"_id": user.id},
        {"$set": {"hashed_password": hashed_password, "password_reset_token": None, "password_reset_token_expires_at": None }}
    )
    return result.modified_count == 1

async def change_password(db: AsyncIOMotorDatabase, user: UserInDB, current_password: str, new_password: str) -> bool:
    # ... (existing code from previous step)
    logger.info(f"Attempting to change password for user: {user.email}")
    if not verify_password(current_password, user.hashed_password):
        logger.warning(f"Current password verification failed for user: {user.email}")
        return False 
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    new_hashed_password = get_password_hash(new_password)
    result = await users_collection.update_one(
        {"_id": user.id},
        {"$set": {"hashed_password": new_hashed_password}}
    )
    if result.modified_count == 1:
        logger.info(f"Password changed successfully for user: {user.email}")
        return True
    logger.error(f"Failed to update password in DB for user: {user.email}, though current password was correct.")
    return False

# --- New CRUD function to delete a user ---
async def delete_user(db: AsyncIOMotorDatabase, user: UserInDB, current_password_to_verify: str) -> bool:
    """
    Deletes a user and their associated data after verifying their current password.
    """
    logger.info(f"Attempting to delete account for user: {user.email}")
    if not verify_password(current_password_to_verify, user.hashed_password):
        logger.warning(f"Password verification failed for account deletion: user {user.email}")
        return False # Password mismatch

    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    
    # Step 1: Delete associated data (e.g., captions)
    # It's good practice to do this first, or within a transaction if your DB supports it.
    try:
        deleted_captions_count = await delete_captions_by_user_id(db, user_id=user.id)
        logger.info(f"Deleted {deleted_captions_count} captions for user {user.email} during account deletion.")
    except Exception as e:
        logger.error(f"Error deleting captions for user {user.email} during account deletion: {e}", exc_info=True)
        # Decide if you want to proceed with user deletion or halt. For now, we'll proceed.
        # In a production system, you might want to log this for manual cleanup or use transactions.

    # Step 2: Delete the user
    delete_result = await users_collection.delete_one({"_id": user.id})
    
    if delete_result.deleted_count == 1:
        logger.info(f"User account deleted successfully: {user.email} (ID: {user.id})")
        # TODO: Consider deleting user's profile picture from static files if it exists.
        # This would require knowing the profile_picture_url and using os.remove.
        # Example:
        # if user.profile_picture_url and user.profile_picture_url.startswith("/static/profile_pics/"):
        #     filename = user.profile_picture_url.split("/")[-1]
        #     # Assuming PROFILE_PICS_DIR is accessible here or passed as an argument
        #     # from app.main import PROFILE_PICS_DIR # (or get from config)
        #     # file_to_delete = PROFILE_PICS_DIR / filename
        #     # if file_to_delete.exists():
        #     #     try: os.remove(file_to_delete); logger.info(f"Deleted profile picture: {file_to_delete}")
        #     #     except Exception as e_del: logger.error(f"Error deleting profile pic {file_to_delete}: {e_del}")
        return True
    
    logger.error(f"Failed to delete user account from DB for user: {user.email}, though password was correct.")
    return False # Should ideally not happen if password was correct and user exists.
