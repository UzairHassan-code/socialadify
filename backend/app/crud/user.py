# D:\socialadify\backend\app\crud\user.py
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from typing import Optional
from fastapi import HTTPException, status

from app.schemas.user import UserCreate, UserInDB, UserPublic # Ensure this path is correct
from app.core.security import get_password_hash, verify_password # Ensure this path is correct

USERS_COLLECTION = "users"

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[UserInDB]:
    """
    Retrieves a user from the database by their email address.
    """
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    user_data = await users_collection.find_one({"email": email})
    if user_data:
        return UserInDB(**user_data)
    return None

async def create_user(db: AsyncIOMotorDatabase, user_create: UserCreate) -> UserPublic:
    """
    Creates a new user in the database without age and university_name.
    """
    existing_user = await get_user_by_email(db, email=user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_create.password)
    
    # Prepare user data for database insertion
    # UserCreate no longer has age or university_name
    user_in_db_data = user_create.model_dump() # Gets all fields from UserCreate
    user_in_db_data["hashed_password"] = hashed_password
    # Remove 'password' field as we are storing 'hashed_password'
    if "password" in user_in_db_data: # Should be present from model_dump()
        del user_in_db_data["password"]
    
    # Fields 'age' and 'university_name' are no longer in user_create or user_in_db_data
    
    users_collection: AsyncIOMotorCollection = db[USERS_COLLECTION]
    result = await users_collection.insert_one(user_in_db_data)
    
    created_user_data = await users_collection.find_one({"_id": result.inserted_id})
    if not created_user_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Could not create user after insertion."
        )
        
    user_in_db_obj = UserInDB(**created_user_data)
    return UserPublic.from_user_in_db(user_in_db_obj)


async def authenticate_user(db: AsyncIOMotorDatabase, email: str, password: str) -> Optional[UserInDB]:
    """
    Authenticates a user by email and password.
    """
    user = await get_user_by_email(db, email=email)
    if not user:
        return None 
    if not verify_password(password, user.hashed_password):
        return None 
    return user
