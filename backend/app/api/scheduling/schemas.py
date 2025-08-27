# D:\socialadify\backend\app\api\scheduling\schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.user import PyObjectId # Assuming PyObjectId is accessible here

class ScheduledPostBase(BaseModel):
    caption: str
    target_platform: Optional[str] = None
    # --- NEW FIELDS FOR AUTOMATION ---
    auto_post: bool = False
    auto_boost: bool = False
    boost_budget: Optional[float] = None
    boost_duration_days: Optional[int] = None

class ScheduledPostCreate(ScheduledPostBase):
    scheduled_at_str: str

class ScheduledPostUpdate(BaseModel):
    caption: Optional[str] = None
    scheduled_at_str: Optional[str] = None
    target_platform: Optional[str] = None
    # --- NEW FIELDS FOR UPDATING AUTOMATION ---
    auto_post: Optional[bool] = None
    auto_boost: Optional[bool] = None
    boost_budget: Optional[float] = None
    boost_duration_days: Optional[int] = None

class ScheduledPostInDB(ScheduledPostBase):
    id: PyObjectId = Field(alias="_id")
    user_id: PyObjectId
    image_url: str
    scheduled_at: datetime
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat(),
            PyObjectId: str,
        }

class ScheduledPostPublic(ScheduledPostInDB):
    id: str
    user_id: str
