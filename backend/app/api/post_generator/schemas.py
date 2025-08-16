# D:\socialadify\backend\app\api\post_generator\schemas.py
from pydantic import BaseModel
from typing import List

class PostGenerationRequest(BaseModel):
    """Defines the structure of the user's answers from the frontend."""
    product_name: str
    target_audience: str
    key_features: List[str]
    tone: str
    platform: str
    call_to_action: str
    aspect_ratio: str # *** THIS LINE IS NEW ***

class PostGenerationResponse(BaseModel):
    """Defines the structure of the response we send back to the frontend."""
    image_data_url: str
    prompt_used: str
