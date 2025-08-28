# D:/socialadify/backend/app/crud/scheduled_post.py

from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
import logging

from app.api.scheduling.schemas import ScheduledPostCreate, ScheduledPostInDB, ScheduledPostUpdate 

SCHEDULED_POSTS_COLLECTION = "scheduled_posts"
logger = logging.getLogger(__name__)

# --- (The existing create_scheduled_post, get_scheduled_posts_by_user, etc., functions remain the same) ---
async def create_scheduled_post(
    db: AsyncIOMotorDatabase, 
    user_id: ObjectId, 
    image_url: str,
    post_create_data: ScheduledPostCreate
) -> ScheduledPostInDB:
    """
    Saves a new scheduled post to the database for a specific user,
    including new automation and boosting settings.
    """
    logger.info(f"Attempting to schedule post for user_id: {user_id}")
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    
    try:
        scheduled_at_dt = datetime.fromisoformat(post_create_data.scheduled_at_str)
    except ValueError:
        logger.error(f"Invalid datetime format: {post_create_data.scheduled_at_str}")
        raise ValueError("Invalid scheduled_at format. Please use ISO format (YYYY-MM-DDTHH:MM:SS).")

    post_doc = {
        "user_id": user_id,
        "image_url": image_url,
        "caption": post_create_data.caption,
        "scheduled_at": scheduled_at_dt,
        "target_platform": post_create_data.target_platform,
        "status": "scheduled",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "auto_post": post_create_data.auto_post,
        "auto_boost": post_create_data.auto_boost,
        "boost_budget": post_create_data.boost_budget,
        "boost_duration_days": post_create_data.boost_duration_days,
    }
    
    result = await collection.insert_one(post_doc)
    created_post_data = await collection.find_one({"_id": result.inserted_id})
    
    if not created_post_data:
        logger.error(f"Could not retrieve scheduled post for user_id {user_id} after insertion.")
        raise Exception("Failed to schedule post: Could not retrieve after insertion.")
        
    logger.info(f"Post scheduled successfully with id: {created_post_data['_id']} for user_id: {user_id}")
    return ScheduledPostInDB(**created_post_data)

async def get_scheduled_posts_by_user(
    db: AsyncIOMotorDatabase, 
    user_id: ObjectId, 
    skip: int = 0, 
    limit: int = 100
) -> List[ScheduledPostInDB]:
    logger.info(f"Fetching scheduled posts for user_id: {user_id}, skip: {skip}, limit: {limit}")
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    cursor = collection.find({"user_id": user_id}).sort([("scheduled_at", 1), ("created_at", -1)]).skip(skip).limit(limit)
    posts_list = await cursor.to_list(length=limit)
    
    logger.info(f"Found {len(posts_list)} scheduled posts for user_id: {user_id}")
    return [ScheduledPostInDB(**post_data) for post_data in posts_list]

async def get_scheduled_post_by_id_for_user(
    db: AsyncIOMotorDatabase, 
    post_id: ObjectId, 
    user_id: ObjectId
) -> Optional[ScheduledPostInDB]:
    logger.info(f"Fetching scheduled post by id: {post_id} for user_id: {user_id}")
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    post_data = await collection.find_one({"_id": post_id, "user_id": user_id})
    if post_data:
        return ScheduledPostInDB(**post_data)
    logger.warning(f"Scheduled post not found or user mismatch: post_id {post_id}, user_id {user_id}")
    return None

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
        logger.warning(f"Scheduled post not found or user mismatch for update: post_id {post_id}")
        return None

    update_fields: Dict[str, Any] = {}
    # Use model_dump to handle optional fields cleanly
    update_dict = update_data.model_dump(exclude_unset=True)

    if "caption" in update_dict:
        update_fields["caption"] = update_dict["caption"]
    if "scheduled_at_str" in update_dict:
        try:
            update_fields["scheduled_at"] = datetime.fromisoformat(update_dict["scheduled_at_str"])
        except ValueError:
            logger.error(f"Invalid datetime format for scheduled_at_str on update: {update_dict['scheduled_at_str']}")
            raise ValueError("Invalid scheduled_at format for update. Please use ISO format.")
    if "target_platform" in update_dict:
        update_fields["target_platform"] = update_dict["target_platform"]
    if "auto_post" in update_dict:
        update_fields["auto_post"] = update_dict["auto_post"]
    if "auto_boost" in update_dict:
        update_fields["auto_boost"] = update_dict["auto_boost"]
    if "boost_budget" in update_dict:
        update_fields["boost_budget"] = update_dict["boost_budget"]
    if "boost_duration_days" in update_dict:
        update_fields["boost_duration_days"] = update_dict["boost_duration_days"]

    if not update_fields:
        logger.info(f"No fields to update for scheduled post_id: {post_id}")
        return ScheduledPostInDB(**current_post)

    update_fields["updated_at"] = datetime.utcnow()
    
    update_result = await collection.update_one(
        {"_id": post_id, "user_id": user_id},
        {"$set": update_fields}
    )
    
    if update_result.modified_count == 0 and update_result.matched_count == 0:
         logger.warning(f"Scheduled post not found or user mismatch for update (after initial check): post_id {post_id}")
         return None

    updated_post_data = await collection.find_one({"_id": post_id, "user_id": user_id})
    if updated_post_data:
        logger.info(f"Scheduled post updated successfully for post_id: {post_id}")
        return ScheduledPostInDB(**updated_post_data)
    
    logger.error(f"Failed to retrieve scheduled post after update for post_id: {post_id}")
    return None 

async def delete_scheduled_post(
    db: AsyncIOMotorDatabase, 
    post_id: ObjectId, 
    user_id: ObjectId
) -> bool:
    logger.info(f"Attempting to delete scheduled post_id: {post_id} for user_id: {user_id}")
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    delete_result = await collection.delete_one({"_id": post_id, "user_id": user_id})
    
    if delete_result.deleted_count == 1:
        logger.info(f"Scheduled post deleted successfully: post_id {post_id}")
        return True
    
    logger.warning(f"Scheduled post not found or user mismatch for deletion: post_id {post_id}, user_id {user_id}")
    return False

# --- NEW FUNCTIONS FOR THE BACKGROUND JOB ---

async def get_due_posts(db: AsyncIOMotorDatabase) -> List[ScheduledPostInDB]:
    """
    Retrieves all posts that are scheduled to be posted and have not yet been processed.
    """
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    now_utc = datetime.now(timezone.utc)
    
    # Find posts where status is 'scheduled' and the scheduled_at time is in the past
    due_posts_cursor = collection.find({
        "status": "scheduled",
        "scheduled_at": {"$lte": now_utc}
    })
    
    due_posts = await due_posts_cursor.to_list(length=None) # Get all due posts
    logger.info(f"Found {len(due_posts)} due posts to process.")
    return [ScheduledPostInDB(**post) for post in due_posts]

async def update_post_status(db: AsyncIOMotorDatabase, post_id: ObjectId, new_status: str, error_message: Optional[str] = None) -> bool:
    """
    Updates the status of a scheduled post (e.g., to 'processing', 'completed', 'failed').
    """
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
    
    if result.modified_count == 1:
        logger.info(f"Updated status of post {post_id} to '{new_status}'.")
        return True
    
    logger.warning(f"Failed to update status for post {post_id}.")
    return False
