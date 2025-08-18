# D:\socialadify\backend\app\api\history\router.py
from fastapi import APIRouter, Depends
from typing import List, Union
from app.core.security import get_current_active_user
from app.schemas.user import UserInDB
from app.db.session import get_database
import logging

# Import CRUD functions and Public Schemas for both types
from app.crud import caption as caption_crud
from app.crud import generated_post as post_crud
from app.api.captions.schemas import CaptionPublic
from app.api.post_generator.schemas import GeneratedPostPublic

router = APIRouter()
CurrentUserDependency = Depends(get_current_active_user)
DbDependency = Depends(get_database)
logger = logging.getLogger(__name__)

# Define a new response type that can be either a Caption or a Post
HistoryItem = Union[CaptionPublic, GeneratedPostPublic]

@router.get("/", response_model=List[HistoryItem])
async def get_unified_history(
    current_user: UserInDB = CurrentUserDependency,
    db = DbDependency
):
    """
    Fetches and combines a user's saved captions and generated visual posts,
    sorted by creation date to create a unified history timeline.
    """
    user_id = current_user.id
    
    # 1. Fetch all saved captions
    captions_in_db = await caption_crud.get_captions_by_user_id(db=db, user_id=user_id, limit=1000)
    
    # 2. Fetch all saved visual posts
    posts_in_db = await post_crud.get_generated_posts_by_user_id(db=db, user_id=user_id)
    
    # 3. Add a literal 'item_type' to captions for the frontend
    typed_captions = []
    for caption in captions_in_db:
        caption_dict = caption.model_dump()
        
        # *** THIS IS THE FIX ***
        # Manually convert ObjectId fields to strings before validation.
        caption_dict["id"] = str(caption_dict["id"])
        caption_dict["user_id"] = str(caption_dict["user_id"])
        
        caption_dict["item_type"] = "caption"
        typed_captions.append(CaptionPublic.model_validate(caption_dict))
        
    # 4. Combine the two lists
    combined_history = typed_captions + posts_in_db
    
    # 5. Sort the combined list by 'created_at' date, newest first
    combined_history.sort(key=lambda item: item.created_at, reverse=True)
    
    return combined_history
