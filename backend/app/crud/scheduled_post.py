# D:\socialadify\backend\app\crud\scheduled_post.py
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import logging

# Assuming schemas are in app.api.scheduling.schemas
# Adjust the import path if your schemas are located elsewhere relative to this crud file.
from app.api.scheduling.schemas import ScheduledPostCreate, ScheduledPostInDB, ScheduledPostUpdate 

SCHEDULED_POSTS_COLLECTION = "scheduled_posts"
logger = logging.getLogger(__name__)

async def create_scheduled_post(
    db: AsyncIOMotorDatabase, 
    user_id: ObjectId, 
    image_url: str, # The path/URL where the image is stored
    post_create_data: ScheduledPostCreate # Contains caption, scheduled_at_str, etc.
) -> ScheduledPostInDB:
    """
    Saves a new scheduled post to the database for a specific user.
    """
    logger.info(f"Attempting to schedule post for user_id: {user_id}")
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    
    try:
        # Convert scheduled_at_str to datetime object
        # The frontend should send ISO format string e.g. "2023-10-27T14:30:00"
        scheduled_at_dt = datetime.fromisoformat(post_create_data.scheduled_at_str)
    except ValueError:
        logger.error(f"Invalid datetime format for scheduled_at_str: {post_create_data.scheduled_at_str}")
        raise ValueError("Invalid scheduled_at format. Please use ISO format (YYYY-MM-DDTHH:MM:SS).")

    post_doc = {
        "user_id": user_id,
        "image_url": image_url,
        "caption": post_create_data.caption,
        "scheduled_at": scheduled_at_dt,
        "target_platform": post_create_data.target_platform,
        "status": "scheduled", # Default status
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
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
    """
    Retrieves scheduled posts for a specific user, with pagination, ordered by scheduled_at.
    """
    logger.info(f"Fetching scheduled posts for user_id: {user_id}, skip: {skip}, limit: {limit}")
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    # Order by scheduled_at, soonest first, then by created_at if times are the same
    cursor = collection.find({"user_id": user_id}).sort([("scheduled_at", 1), ("created_at", -1)]).skip(skip).limit(limit)
    posts_list = await cursor.to_list(length=limit)
    
    logger.info(f"Found {len(posts_list)} scheduled posts for user_id: {user_id}")
    return [ScheduledPostInDB(**post_data) for post_data in posts_list]

async def get_scheduled_post_by_id_for_user(
    db: AsyncIOMotorDatabase, 
    post_id: ObjectId, 
    user_id: ObjectId
) -> Optional[ScheduledPostInDB]:
    """
    Retrieves a single scheduled post by its ID, ensuring it belongs to the user.
    """
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
    """
    Updates an existing scheduled post (e.g., caption, scheduled time).
    Does not handle image re-upload here; that would be a more complex operation.
    """
    logger.info(f"Attempting to update scheduled post_id: {post_id} for user_id: {user_id}")
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    
    current_post = await collection.find_one({"_id": post_id, "user_id": user_id})
    if not current_post:
        logger.warning(f"Scheduled post not found or user mismatch for update: post_id {post_id}")
        return None

    update_fields: Dict[str, Any] = {}
    if update_data.caption is not None:
        update_fields["caption"] = update_data.caption
    if update_data.scheduled_at_str is not None:
        try:
            update_fields["scheduled_at"] = datetime.fromisoformat(update_data.scheduled_at_str)
        except ValueError:
            logger.error(f"Invalid datetime format for scheduled_at_str on update: {update_data.scheduled_at_str}")
            raise ValueError("Invalid scheduled_at format for update. Please use ISO format.")
    if update_data.target_platform is not None: # Allow clearing it by passing null/None if schema allows
        update_fields["target_platform"] = update_data.target_platform
    
    if not update_fields:
        logger.info(f"No fields to update for scheduled post_id: {post_id}")
        return ScheduledPostInDB(**current_post) # Return current if no actual changes

    update_fields["updated_at"] = datetime.utcnow()
    # Optionally, if status can be changed (e.g., from draft to scheduled)
    # if update_data.status is not None:
    #     update_fields["status"] = update_data.status

    update_result = await collection.update_one(
        {"_id": post_id, "user_id": user_id},
        {"$set": update_fields}
    )
    
    if update_result.modified_count == 0 and update_result.matched_count == 0:
         logger.warning(f"Scheduled post not found or user mismatch for update (after initial check): post_id {post_id}")
         return None # Should not happen if current_post was found

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
    """
    Deletes a scheduled post by its ID, ensuring it belongs to the user.
    Returns True if deletion was successful, False otherwise.
    """
    logger.info(f"Attempting to delete scheduled post_id: {post_id} for user_id: {user_id}")
    collection: AsyncIOMotorCollection = db[SCHEDULED_POSTS_COLLECTION]
    
    # TODO: Before deleting from DB, delete the associated image file from static storage.
    # post_to_delete = await collection.find_one({"_id": post_id, "user_id": user_id})
    # if post_to_delete and post_to_delete.get("image_url"):
    #     image_filename = post_to_delete["image_url"].split("/")[-1]
    #     # Construct full path to image using SCHEDULED_POST_IMAGES_DIR from config/main.py
    #     # from app.main import SCHEDULED_POST_IMAGES_DIR # (or get from config)
    #     # image_file_path = SCHEDULED_POST_IMAGES_DIR / image_filename
    #     # if image_file_path.exists():
    #     #     try: os.remove(image_file_path); logger.info(f"Deleted image file: {image_file_path}")
    #     #     except Exception as e_del: logger.error(f"Error deleting image file {image_file_path}: {e_del}")

    delete_result = await collection.delete_one({"_id": post_id, "user_id": user_id})
    
    if delete_result.deleted_count == 1:
        logger.info(f"Scheduled post deleted successfully: post_id {post_id}")
        return True
    
    logger.warning(f"Scheduled post not found or user mismatch for deletion: post_id {post_id}, user_id {user_id}")
    return False
