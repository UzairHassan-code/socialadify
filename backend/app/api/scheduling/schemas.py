# D:\socialadify\backend\app\api\scheduling\schemas.py
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime
from app.schemas.user import PyObjectId # Re-use PyObjectId for user_id if storing as ObjectId
from bson import ObjectId

class ScheduledPostBase(BaseModel):
    caption: str = Field(..., min_length=1, max_length=2200) 
    scheduled_at: datetime 
    target_platform: Optional[str] = Field(None, description="e.g., Instagram, Facebook, Twitter. For future use.")

class ScheduledPostCreate(BaseModel): 
    caption: str = Field(..., min_length=1, max_length=2200)
    scheduled_at_str: str 
    target_platform: Optional[str] = None

class ScheduledPostUpdate(BaseModel): 
    caption: Optional[str] = Field(None, min_length=1, max_length=2200)
    scheduled_at_str: Optional[str] = None 
    target_platform: Optional[str] = None

class ScheduledPostInDBBase(ScheduledPostBase):
    id: PyObjectId = Field(alias="_id")
    user_id: PyObjectId 
    image_url: str 
    status: str = Field(default="scheduled")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True, 
        "json_encoders": {ObjectId: str, datetime: lambda dt: dt.isoformat()} 
    }

class ScheduledPostInDB(ScheduledPostInDBBase):
    pass

class ScheduledPostPublic(ScheduledPostInDBBase):
    id: str
    user_id: str

# --- Add ErrorResponse model ---
class ErrorResponse(BaseModel):
    detail: str
