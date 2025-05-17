# D:\socialadify\backend\app\crud\user.py
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from typing import Optional
from fastapi import HTTPException, status
import logging 

from app.schemas.user import UserCreate, UserInDB, UserPublic
from app.core.security import get_password_hash, verify_password

USERS_COLLECTION = "users"

# Configure logging
# You can also configure this in main.py or a dedicated logging config file
logging.basicConfig(level=logging.INFO) # Or logging.DEBUG for more verbosity
logger = logging.getLogger(__name__)

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[UserInDB]:
    logger.info(f"Attempting to retrieve user by email: {email}")
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    # Ensure email is queried in lowercase for case-insensitive matching
    user_data = await users_collection.find_one({"email": email.lower()}) 
    if user_data:
        logger.info(f"User found for email: {email.lower()}") # Log the email used for query
        return UserInDB(**user_data)
    logger.info(f"No user found for email: {email.lower()}") # Log the email used for query
    return None

async def create_user(db: AsyncIOMotorDatabase, user_create: UserCreate) -> UserPublic:
    logger.info(f"Attempting to create user with email: {user_create.email}")
    # Store and check emails in lowercase to prevent case-sensitivity issues for usernames
    existing_user = await get_user_by_email(db, email=user_create.email.lower())
    if existing_user:
        logger.warning(f"Email {user_create.email.lower()} already registered.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_create.password)
    
    user_in_db_data = user_create.model_dump()
    user_in_db_data["email"] = user_create.email.lower() # Store email in lowercase
    user_in_db_data["hashed_password"] = hashed_password
    if "password" in user_in_db_data:
        del user_in_db_data["password"]
    
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    result = await users_collection.insert_one(user_in_db_data)
    
    created_user_data = await users_collection.find_one({"_id": result.inserted_id})
    if not created_user_data:
        logger.error(f"Could not retrieve user {user_create.email.lower()} after insertion.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create user after insertion."
        )
        
    user_in_db_obj = UserInDB(**created_user_data)
    logger.info(f"User {user_in_db_obj.email} created successfully.")
    return UserPublic.from_user_in_db(user_in_db_obj)


async def authenticate_user(db: AsyncIOMotorDatabase, email: str, password: str) -> Optional[UserInDB]:
    logger.info(f"Attempting to authenticate user: {email}")
    # Authenticate using lowercase email
    user = await get_user_by_email(db, email=email.lower())

    if not user:
        logger.warning(f"Authentication failed: User {email.lower()} not found.")
        return None
    
    logger.info(f"User {email.lower()} found. Verifying password...")
    # The verify_password function from app.core.security handles the actual comparison
    is_password_valid = verify_password(password, user.hashed_password)
    
    if not is_password_valid:
        logger.warning(f"Authentication failed: Invalid password for user {email.lower()}.")
        # For security, do not log the entered password or the stored hash here in production.
        # For deep debugging, you might temporarily log `user.hashed_password`
        # and the hash of the entered `password` (using get_password_hash)
        # to see if they look structurally similar or if one is obviously wrong.
        # Example (for debugging only, remove for production):
        # logger.debug(f"Stored hash for {email.lower()}: {user.hashed_password}")
        # logger.debug(f"Hash of entered password: {get_password_hash(password)}")
        return None
        
    logger.info(f"Password verified successfully for user {email.lower()}. Authentication successful.")
    return user
# Ensure no extra lines or spaces after this line
