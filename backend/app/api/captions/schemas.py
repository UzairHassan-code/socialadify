# D:\socialadify\backend\app\api\captions\schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.user import PyObjectId # Re-use PyObjectId for user_id if storing as ObjectId
from bson import ObjectId


class CaptionPreferences(BaseModel):
    category: str
    tone: str
    include_hashtags: bool
    include_emojis: bool
    image_description: Optional[str] = None

class GeneratedCaptionResponse(BaseModel):
    ad_id: Optional[str] = None 
    captions: List[str] 
    image_description_used: Optional[str] = None 

class ErrorResponse(BaseModel):
    detail: str

# --- Schemas for Storing and Retrieving Captions ---

class CaptionBase(BaseModel):
    caption_text: str = Field(..., min_length=1)
    preferences_category: Optional[str] = None
    preferences_tone: Optional[str] = None
    preferences_include_hashtags: Optional[bool] = None
    preferences_include_emojis: Optional[bool] = None
    original_image_description: Optional[str] = None 
    source_image_filename: Optional[str] = None 
    is_edited: bool = False
    source: str = Field(default="ai_generated", description="e.g., 'ai_generated', 'user_edited', 'user_created'")

class CaptionCreate(CaptionBase): # Ensure this class definition is present and correct
    pass

class CaptionUpdate(BaseModel): 
    caption_text: str = Field(..., min_length=1)

class CaptionInDBBase(CaptionBase):
    id: PyObjectId = Field(alias="_id")
    user_id: PyObjectId 
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = { 
        "populate_by_name": True, 
        "arbitrary_types_allowed": True, 
        "json_encoders": {ObjectId: str} 
    }

class CaptionInDB(CaptionInDBBase):
    pass

class CaptionPublic(CaptionInDBBase):
    id: str
    user_id: str
    
class CaptionSaveRequest(BaseModel):
    caption_text: str = Field(..., min_length=1)
    category: Optional[str] = None
    tone: Optional[str] = None
    include_hashtags: Optional[bool] = None
    include_emojis: Optional[bool] = None
    image_description_used: Optional[str] = None 
    source_image_filename: Optional[str] = None 
    is_edited: bool = False 
