# D:\socialadify\backend\app\api\scheduling\router.py
from fastapi import (
    APIRouter, Depends, HTTPException, status, 
    UploadFile, File, Form, Query, Path as FastApiPath, BackgroundTasks
)
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Annotated, List, Optional
import os
import shutil
from pathlib import Path
import time
import logging
from bson import ObjectId

from app.schemas.user import UserInDB, PyObjectId
from app.core.security import get_current_active_user
from app.db.session import get_database
from app.api.scheduling.schemas import ( 
    ScheduledPostCreate, ScheduledPostPublic, ScheduledPostUpdate, ErrorResponse,
    ScheduledPostInDB 
)
from app.crud import scheduled_post as scheduler_crud

router = APIRouter()
logger = logging.getLogger(__name__)

_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent.parent
SCHEDULED_POST_IMAGES_DIR = _BACKEND_ROOT / "static" / "scheduled_post_images"
SCHEDULED_POST_IMAGES_DIR.mkdir(parents=True, exist_ok=True)


DbDependency = Annotated[AsyncIOMotorDatabase, Depends(get_database)]
CurrentUserDependency = Annotated[UserInDB, Depends(get_current_active_user)]

def _to_scheduled_post_public(post_db: ScheduledPostInDB) -> ScheduledPostPublic:
    """
    Helper function to convert ScheduledPostInDB instance to ScheduledPostPublic instance.
    This ensures correct field names and type conversions (e.g., ObjectId to str).
    """
    return ScheduledPostPublic(
        id=str(post_db.id),  # Pydantic resolves post_db.id to the value of _id field
        user_id=str(post_db.user_id),
        caption=post_db.caption,
        scheduled_at=post_db.scheduled_at, # Will be datetime, FastAPI handles JSON encoding
        image_url=post_db.image_url,
        status=post_db.status,
        created_at=post_db.created_at, # Will be datetime
        updated_at=post_db.updated_at, # Will be datetime
        target_platform=post_db.target_platform
        # Add any other fields inherited by ScheduledPostPublic from ScheduledPostBase if necessary
    )


@router.post(
    "/", 
    response_model=ScheduledPostPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule a new post"
)
async def create_new_scheduled_post(
    current_user: CurrentUserDependency,
    db: DbDependency,
    caption: str = Form(..., min_length=1, max_length=2200),
    scheduled_at_str: str = Form(...), 
    image_file: UploadFile = File(...), 
    target_platform: Optional[str] = Form(None)
):
    logger.info(f"User {current_user.email} attempting to schedule a new post.")

    if not image_file.content_type or not image_file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    file_extension = Path(image_file.filename).suffix.lower() if image_file.filename else ".jpg"
    allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported image extension: {file_extension}.")
    
    timestamp = int(time.time())
    unique_filename = f"user_{str(current_user.id)}_time_{timestamp}{file_extension}"
    file_path_on_disk = SCHEDULED_POST_IMAGES_DIR / unique_filename
    
    try:
        with open(file_path_on_disk, "wb") as buffer:
            shutil.copyfileobj(image_file.file, buffer)
        logger.info(f"Scheduled post image saved for user {current_user.email} to: {file_path_on_disk}")
    except Exception as e:
        logger.error(f"Failed to save scheduled post image for {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not save image for scheduled post.")
    finally:
        image_file.file.close()

    image_url_path = f"/static/scheduled_post_images/{unique_filename}"

    post_create_data = ScheduledPostCreate(
        caption=caption,
        scheduled_at_str=scheduled_at_str,
        target_platform=target_platform
    )

    try:
        user_object_id = current_user.id
        if not isinstance(user_object_id, ObjectId): user_object_id = ObjectId(str(user_object_id))

        scheduled_post_db = await scheduler_crud.create_scheduled_post(
            db=db, 
            user_id=user_object_id, 
            image_url=image_url_path,
            post_create_data=post_create_data
        )
        return _to_scheduled_post_public(scheduled_post_db)
    except ValueError as ve: 
        logger.warning(f"Validation error creating scheduled post: {ve}")
        if file_path_on_disk.exists():
            try: os.remove(file_path_on_disk)
            except Exception as e_del: logger.error(f"Error deleting orphaned scheduled post image {file_path_on_disk}: {e_del}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        logger.error(f"Failed to schedule post for user {current_user.email}: {e}", exc_info=True)
        if file_path_on_disk.exists():
            try: os.remove(file_path_on_disk)
            except Exception as e_del: logger.error(f"Error deleting orphaned scheduled post image {file_path_on_disk}: {e_del}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not schedule post.")


@router.get("/", response_model=List[ScheduledPostPublic], summary="List user's scheduled posts")
async def list_user_scheduled_posts(
    current_user: CurrentUserDependency,
    db: DbDependency,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    logger.info(f"Fetching scheduled posts for user: {current_user.email}")
    user_object_id = current_user.id
    if not isinstance(user_object_id, ObjectId): user_object_id = ObjectId(str(user_object_id))

    posts_db = await scheduler_crud.get_scheduled_posts_by_user(db, user_id=user_object_id, skip=skip, limit=limit)
    return [_to_scheduled_post_public(post) for post in posts_db]


@router.get("/{post_id}", response_model=ScheduledPostPublic, summary="Get a specific scheduled post")
async def get_specific_scheduled_post(
    post_id: Annotated[str, FastApiPath(description="The ID of the scheduled post to retrieve")],
    current_user: CurrentUserDependency,
    db: DbDependency
):
    logger.info(f"User {current_user.email} fetching scheduled post ID: {post_id}")
    try:
        post_object_id = PyObjectId(post_id)
        user_object_id = current_user.id
        if not isinstance(user_object_id, ObjectId): user_object_id = ObjectId(str(user_object_id))
    except Exception: 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid post ID format.")

    post_db = await scheduler_crud.get_scheduled_post_by_id_for_user(db, post_id=post_object_id, user_id=user_object_id)
    if not post_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheduled post not found or access denied.")
    return _to_scheduled_post_public(post_db)


@router.put("/{post_id}", response_model=ScheduledPostPublic, summary="Update a scheduled post")
async def update_existing_scheduled_post(
    post_id: Annotated[str, FastApiPath(description="The ID of the scheduled post to update")],
    update_payload: ScheduledPostUpdate, 
    current_user: CurrentUserDependency,
    db: DbDependency
):
    logger.info(f"User {current_user.email} attempting to update scheduled post ID: {post_id}")
    try:
        post_object_id = PyObjectId(post_id)
        user_object_id = current_user.id
        if not isinstance(user_object_id, ObjectId): user_object_id = ObjectId(str(user_object_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid post ID format.")

    try:
        updated_post_db = await scheduler_crud.update_scheduled_post(
            db, post_id=post_object_id, user_id=user_object_id, update_data=update_payload
        )
    except ValueError as ve: 
        logger.warning(f"Validation error updating scheduled post {post_id}: {ve}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        logger.error(f"Error updating scheduled post {post_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update scheduled post.")

    if not updated_post_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheduled post not found or access denied for update.")
    return _to_scheduled_post_public(updated_post_db)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a scheduled post")
async def delete_existing_scheduled_post(
    post_id: Annotated[str, FastApiPath(description="The ID of the scheduled post to delete")],
    current_user: CurrentUserDependency,
    db: DbDependency,
    background_tasks: BackgroundTasks 
):
    logger.info(f"User {current_user.email} attempting to delete scheduled post ID: {post_id}")
    try:
        post_object_id = PyObjectId(post_id)
        user_object_id = current_user.id
        if not isinstance(user_object_id, ObjectId): user_object_id = ObjectId(str(user_object_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid post ID format.")

    post_to_delete = await scheduler_crud.get_scheduled_post_by_id_for_user(db, post_id=post_object_id, user_id=user_object_id)
    if not post_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheduled post not found or access denied.")

    image_url_to_delete = post_to_delete.image_url 

    success = await scheduler_crud.delete_scheduled_post(db, post_id=post_object_id, user_id=user_object_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheduled post not found or failed to delete.")

    if image_url_to_delete and image_url_to_delete.startswith("/static/scheduled_post_images/"):
        filename = image_url_to_delete.split("/")[-1]
        file_path_to_delete = SCHEDULED_POST_IMAGES_DIR / filename
        
        def delete_image_file(path_to_delete: Path):
            if path_to_delete.exists():
                try:
                    os.remove(path_to_delete)
                    logger.info(f"Scheduled post image file deleted: {path_to_delete}")
                except Exception as e_del:
                    logger.error(f"Error deleting scheduled post image file {path_to_delete}: {e_del}")
            else:
                logger.warning(f"Scheduled post image file not found for deletion: {path_to_delete}")
        
        background_tasks.add_task(delete_image_file, file_path_to_delete)
    
    return None
