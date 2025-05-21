# D:\socialadify\backend\app\schemas\user.py
from pydantic import BaseModel, EmailStr, Field, ConfigDict, BeforeValidator
from typing import Optional, Annotated, Any
from bson import ObjectId

# --- Custom ObjectId Handling ---
def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if ObjectId.is_valid(v): # Handles string representation
        return ObjectId(v)
    if isinstance(v, bytes) and len(v) == 12: # Handles raw BSON ObjectId bytes
        return ObjectId(v)
    raise ValueError(f"Invalid ObjectId: {v}")

PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]

# --- User Schemas ---

class UserBase(BaseModel):
    email: EmailStr
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    # profile_picture_url was removed

class UserCreate(UserBase):
    password: str
    # Ensure firstname and lastname are required for creation if desired
    firstname: str = Field(..., min_length=1) 
    lastname: str = Field(..., min_length=1)

class UserUpdate(BaseModel): # Schema for update payload
    firstname: Optional[str] = Field(None, min_length=1)
    lastname: Optional[str] = Field(None, min_length=1)
    # profile_picture_url was removed

class UserInDBBase(UserBase):
    id: PyObjectId = Field(alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True, # Important for ObjectId
        json_encoders={ObjectId: str}
    )

class UserInDB(UserInDBBase):
    hashed_password: str
    # profile_picture_url was inherited and removed from UserBase

class UserPublic(UserBase): # Inherits email, firstname, lastname from UserBase
    id: str # For public representation, ID is a string

    @classmethod
    def from_user_in_db(cls, user_in_db: UserInDB) -> "UserPublic":
        return cls(
            id=str(user_in_db.id),
            email=user_in_db.email,
            firstname=user_in_db.firstname,
            lastname=user_in_db.lastname
            # profile_picture_url was removed
        )

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
# Ensure the file ends cleanly here, with no extra spaces or lines below.
