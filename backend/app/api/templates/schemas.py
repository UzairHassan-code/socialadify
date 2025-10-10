# D:/socialadify/backend/app/api/templates/schemas.py
from pydantic import BaseModel, Field, computed_field
from typing import List, Dict
from bson import ObjectId
from app.schemas.user import PyObjectId

# --- Sub-models for nested data ---
class Position(BaseModel):
    x: int
    y: int

class EditableField(BaseModel):
    key: str
    label: str
    type: str = "text"
    position: Position
    font: str
    font_size: int
    color: str
    max_length: int = 100

# --- Core Template Model for Database ---
class TemplateInDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    description: str
    base_image_path: str
    preview_image_path: str
    editable_fields: List[EditableField]

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# --- Public model for API responses (listing templates) ---
class TemplatePublic(BaseModel):
    # This field will hold the original _id from the database
    mongo_id: PyObjectId = Field(alias="_id")
    name: str
    description: str
    preview_image_path: str
    base_image_path: str
    editable_fields: List[EditableField] 

    # --- THE FIX: Use a computed_field to explicitly create the 'id' string ---
    @computed_field
    @property
    def id(self) -> str:
        return str(self.mongo_id)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, PyObjectId: str}

# --- Schemas for the new generation endpoint ---
class TemplateGenerationRequest(BaseModel):
    """ The user's input for the editable fields """
    field_values: Dict[str, str]

class TemplateGenerationResponse(BaseModel):
    """ The response containing the URL of the final image """
    generated_image_url: str

