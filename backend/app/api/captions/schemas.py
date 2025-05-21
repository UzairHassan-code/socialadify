# D:\socialadify\backend\app\api\captions\schemas.py
from pydantic import BaseModel
from typing import List, Optional

class CaptionPreferences(BaseModel):
    category: str
    tone: str
    include_hashtags: bool
    include_emojis: bool
    # Optional field to pass image description if pre-fetched,
    # or if no image, this can be omitted.
    image_description: Optional[str] = None

class GeneratedCaptionResponse(BaseModel):
    ad_id: Optional[str] = None # If applicable, e.g., if linking to an ad
    captions: List[str] # Expecting a list of captions, even if it's just one
    image_description_used: Optional[str] = None # For debugging or info

class ErrorResponse(BaseModel):
    detail: str

