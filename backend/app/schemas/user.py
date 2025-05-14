# D:\socialadify\backend\app\schemas\user.py
from pydantic import BaseModel, EmailStr, Field, BeforeValidator, ConfigDict
from typing import Optional, Annotated, Any
from bson import ObjectId # For MongoDB ObjectId handling

# --- Custom ObjectId Handling for Pydantic v2 ---
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

# Properties to receive via API on user creation
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    firstname: str = Field(..., min_length=1)
    lastname: str = Field(..., min_length=1)
    # age: int = Field(..., gt=0) # REMOVED
    # university_name: str = Field(...) # REMOVED

# Properties to receive via API on user login
class UserLogin(BaseModel):
    email: EmailStr 
    password: str

# Properties stored in DB (includes hashed_password)
class UserInDB(BaseModel):
    id: PyObjectId = Field(alias="_id") 
    firstname: str
    lastname: str
    email: EmailStr
    hashed_password: str
    # age: Optional[int] = None # REMOVED
    # university_name: Optional[str] = None # REMOVED

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

# Properties to return to client (omits hashed_password)
class UserPublic(BaseModel):
    id: str 
    firstname: str
    lastname: str
    email: EmailStr
    # age: Optional[int] = None # REMOVED
    # university_name: Optional[str] = None # REMOVED

    model_config = ConfigDict(
        populate_by_name=True
    )

    @classmethod
    def from_user_in_db(cls, user_in_db: UserInDB) -> "UserPublic":
        return cls(
            id=str(user_in_db.id),
            firstname=user_in_db.firstname,
            lastname=user_in_db.lastname,
            email=user_in_db.email
            # age=user_in_db.age, # REMOVED
            # university_name=user_in_db.university_name # REMOVED
        )

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
