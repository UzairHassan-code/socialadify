# D:/socialadify/backend/app/api/ads/schemas.py

from pydantic import BaseModel, Field, HttpUrl, ConfigDict, BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime
from bson import ObjectId

# --- ObjectId Helper Class ---
# This is the Pydantic v2 compatible class
def validate_object_id(v):
    if not ObjectId.is_valid(v):
        raise ValueError("Invalid ObjectId")
    return v

PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]

# --- Base Schemas ---

class GoogleAudienceSchema(BaseModel):
    locations: List[str] = Field(default=[], example=["New York", "California"])
    age_min: Optional[int] = Field(default=None, example=18)
    age_max: Optional[int] = Field(default=None, example=65)
    genders: List[str] = Field(default=[], example=["Male", "Female"])
    interests: List[str] = Field(default=[], example=["Technology", "Gaming"])

class AdCreativeBase(BaseModel):
    campaign_name: str = Field(..., example="Fall Sale 2025")
    ad_goal: str = Field(..., example="TRAFFIC") # e.g., "TRAFFIC", "AWARENESS", "LEADS"
    headline: str = Field(..., example="Massive Discounts on All-New Tech!")
    body_text: str = Field(..., example="Click to shop the best deals of the season.")
    # --- THIS IS THE FIX ---
    # Changed from HttpUrl to str to allow relative paths
    image_url: Optional[str] = Field(default=None, example="/static/ad_creative_images/image.png") 
    platform: str = Field(..., example="GOOGLE")
    audience: GoogleAudienceSchema = Field(...)

# --- API Schemas ---

class AdCreativePayload(AdCreativeBase):
    pass

class AdCreativeUpdate(BaseModel):
    campaign_name: Optional[str] = None
    ad_goal: Optional[str] = None
    headline: Optional[str] = None
    body_text: Optional[str] = None
    # --- THIS IS THE FIX ---
    # Changed from HttpUrl to str
    image_url: Optional[str] = None 
    audience: Optional[GoogleAudienceSchema] = None

# --- Database Model (for internal use) ---
class AdCreativeInDB(AdCreativeBase):
    model_config = ConfigDict(arbitrary_types_allowed=True, json_encoders={ObjectId: str})
    
    id: PyObjectId = Field(alias="_id")
    user_id: PyObjectId # Changed from str to PyObjectId to fix the bug
    status: str = Field(default="DRAFT", example="DRAFT") # DRAFT, PUBLISHED, FAILED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    error_message: Optional[str] = None # For publishing errors

# --- Public Response Model (for API) ---
class AdCreativePublic(AdCreativeBase):
    model_config = ConfigDict(arbitrary_types_allowed=True, json_encoders={ObjectId: str})

    id: str = Field(..., description="The unique ID of the ad creative.")
    user_id: str = Field(..., description="The ID of the user who owns this ad.")
    status: str = Field(..., example="DRAFT")
    created_at: datetime
    error_message: Optional[str] = None

# --- AI Suggestion Schemas ---
class AIPlatformSuggestionRequest(BaseModel):
    ad_goal: str
    audience: GoogleAudienceSchema
    product_description: str = Field(..., min_length=10)

class AIPlatformSuggestionResponse(BaseModel):
    recommended_platform: str # "GOOGLE" or "META"
    recommendation: str # The justification text
