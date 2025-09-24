# D:/socialadify/backend/app/crud/scheduled_post.py

from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
import logging

from app.api.scheduling.schemas import ScheduledPostCreate, ScheduledPostInDB, ScheduledPostUpdate 

SCHEDULED_POSTS_COLLECTION = "scheduled_posts"
logger = logging.getLogger(__name__)

async def create_scheduled_post(
    db: AsyncIOMotorDatabase, 
    user_id: ObjectId, 
    image_url: str,
    post_create_data: ScheduledPostCreate
) -> ScheduledPostInDB:
    logger.info(f"Attempting to schedule post for user_id: {user_id}")
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    
    try:
        # --- THIS IS THE FIX ---
        # The 'Z' at the end of the ISO string from the frontend means UTC.
        # We replace 'Z' with '+00:00' which fromisoformat understands as a timezone.
        # This creates a timezone-AWARE datetime object, which is what we need.
        scheduled_at_dt = datetime.fromisoformat(post_create_data.scheduled_at_str.replace('Z', '+00:00'))
    except ValueError:
        logger.error(f"Invalid datetime format: {post_create_data.scheduled_at_str}")
        raise ValueError("Invalid scheduled_at format. Please use ISO format (YYYY-MM-DDTHH:MM:SSZ).")

    post_doc = {
        "user_id": user_id,
        "image_url": image_url,
        "caption": post_create_data.caption,
        "scheduled_at": scheduled_at_dt, # This is now a timezone-aware object
        "target_platform": post_create_data.target_platform,
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "auto_post": post_create_data.auto_post,
        "auto_boost": post_create_data.auto_boost,
        "boost_budget": post_create_data.boost_budget,
        "boost_duration_days": post_create_data.boost_duration_days,
    }
    
    result = await collection.insert_one(post_doc)
    created_post_data = await collection.find_one({"_id": result.inserted_id})
    
    if not created_post_data:
        raise Exception("Failed to schedule post: Could not retrieve after insertion.")
        
    return ScheduledPostInDB(**created_post_data)

async def update_scheduled_post(
    db: AsyncIOMotorDatabase, 
    post_id: ObjectId, 
    user_id: ObjectId, 
    update_data: ScheduledPostUpdate
) -> Optional[ScheduledPostInDB]:
    logger.info(f"Attempting to update scheduled post_id: {post_id} for user_id: {user_id}")
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    
    current_post = await collection.find_one({"_id": post_id, "user_id": user_id})
    if not current_post:
        return None

    update_fields: Dict[str, Any] = {}
    update_dict = update_data.model_dump(exclude_unset=True)

    if "caption" in update_dict:
        update_fields["caption"] = update_dict["caption"]
    if "scheduled_at_str" in update_dict:
        try:
            # --- THIS IS THE FIX ---
            # Apply the same timezone-aware parsing here
            update_fields["scheduled_at"] = datetime.fromisoformat(update_dict["scheduled_at_str"].replace('Z', '+00:00'))
        except ValueError:
            raise ValueError("Invalid scheduled_at format for update. Please use ISO format.")
    if "target_platform" in update_dict:
        update_fields["target_platform"] = update_dict["target_platform"]
    # ... (other fields) ...

    if not update_fields:
        return ScheduledPostInDB(**current_post)

    update_fields["updated_at"] = datetime.now(timezone.utc)
    
    await collection.update_one(
        {"_id": post_id, "user_id": user_id},
        {"$set": update_fields}
    )
    
    updated_post_data = await collection.find_one({"_id": post_id, "user_id": user_id})
    if updated_post_data:
        return ScheduledPostInDB(**updated_post_data)
    
    return None 

# --- (Other functions remain the same as they were already correct) ---
async def get_scheduled_posts_by_user(
    db: AsyncIOMotorDatabase, 
    user_id: ObjectId, 
    skip: int = 0, 
    limit: int = 100
) -> List[ScheduledPostInDB]:
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    cursor = collection.find({"user_id": user_id}).sort([("scheduled_at", 1), ("created_at", -1)]).skip(skip).limit(limit)
    posts_list = await cursor.to_list(length=limit)
    return [ScheduledPostInDB(**post_data) for post_data in posts_list]

async def get_scheduled_post_by_id_for_user(
    db: AsyncIOMotorDatabase, 
    post_id: ObjectId, 
    user_id: ObjectId
) -> Optional[ScheduledPostInDB]:
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    post_data = await collection.find_one({"_id": post_id, "user_id": user_id})
    if post_data:
        return ScheduledPostInDB(**post_data)
    return None

async def delete_scheduled_post(
    db: AsyncIOMotorDatabase, 
    post_id: ObjectId, 
    user_id: ObjectId
) -> bool:
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    delete_result = await collection.delete_one({"_id": post_id, "user_id": user_id})
    return delete_result.deleted_count == 1

async def get_due_posts(db: AsyncIOMotorDatabase) -> List[ScheduledPostInDB]:
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    now_utc = datetime.now(timezone.utc)
    due_posts_cursor = collection.find({
        "status": "scheduled",
        "scheduled_at": {"$lte": now_utc}
    })
    due_posts = await due_posts_cursor.to_list(length=None)
    logger.info(f"Found {len(due_posts)} due posts to process.")
    return [ScheduledPostInDB(**post) for post in due_posts]

async def update_post_status(db: AsyncIOMotorDatabase, post_id: ObjectId, new_status: str, error_message: Optional[str] = None) -> bool:
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    update_fields = {
        "status": new_status,
        "updated_at": datetime.now(timezone.utc)
    }
    if error_message:
        update_fields["error_message"] = error_message
    result = await collection.update_one(
        {"_id": post_id},
        {"$set": update_fields}
    )
    return result.modified_count == 1
