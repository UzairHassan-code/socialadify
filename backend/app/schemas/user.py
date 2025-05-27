# D:\socialadify\backend\app\schemas\user.py
# from pydantic import BaseModel, EmailStr, Field, ConfigDict, BeforeValidator, field_validator
# from typing import Optional, Annotated, Any
# from bson import ObjectId
# import re # Import the regular expression module

# # --- Allowed Email Domains ---
# ALLOWED_EMAIL_DOMAINS = {"gmail.com", "yahoo.com", "outlook.com"}

# # --- Custom Email Domain Validator ---
# def validate_email_domain(email: EmailStr) -> EmailStr:
#     if "@" not in email:
#         raise ValueError("Invalid email format: missing '@' symbol.")
#     domain = email.split('@', 1)[1].lower() 
#     if domain not in ALLOWED_EMAIL_DOMAINS:
#         allowed_domains_str = ", ".join(f"@{d}" for d in ALLOWED_EMAIL_DOMAINS)
#         raise ValueError(f"Email domain '@{domain}' is not allowed. Please use one of the following: {allowed_domains_str}.")
#     return email

# # --- Custom Password Validator ---
# def validate_password_complexity(password: str) -> str:
#     if len(password) < 8:
#         raise ValueError("Password must be at least 8 characters long.")
#     if not re.search(r"[A-Z]", password):
#         raise ValueError("Password must contain at least one uppercase letter.")
#     if not re.search(r"[a-z]", password): # Good practice to also ensure lowercase
#         raise ValueError("Password must contain at least one lowercase letter.")
#     if not re.search(r"[0-9]", password): # Good practice to also ensure a digit
#         raise ValueError("Password must contain at least one digit.")
#     if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`]", password): # Common special characters
#         raise ValueError("Password must contain at least one special character (e.g., !@#$%^&*).")
#     return password


# def validate_object_id(v: Any) -> ObjectId:
#     if isinstance(v, ObjectId):
#         return v
#     if ObjectId.is_valid(v): 
#         return ObjectId(v)
#     if isinstance(v, bytes) and len(v) == 12: 
#         return ObjectId(v)
#     raise ValueError(f"Invalid ObjectId: {v}")

# PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]

# class UserBase(BaseModel):
#     firstname: Optional[str] = None
#     lastname: Optional[str] = None
#     profile_picture_url: Optional[str] = None 

# class UserCreate(UserBase):
#     email: EmailStr 
#     password: str = Field(..., min_length=8) # Keep min_length here for initial Pydantic check
#     firstname: str = Field(..., min_length=1) 
#     lastname: str = Field(..., min_length=1)

#     @field_validator('email')
#     @classmethod
#     def check_email_domain_on_create(cls, value: EmailStr) -> EmailStr:
#         return validate_email_domain(value)

#     @field_validator('password')
#     @classmethod
#     def check_password_complexity(cls, value: str) -> str:
#         return validate_password_complexity(value)


# class UserUpdate(BaseModel): 
#     firstname: Optional[str] = Field(None, min_length=1)
#     lastname: Optional[str] = Field(None, min_length=1)
#     new_email: Optional[EmailStr] = Field(None, description="New email address for the user")

#     @field_validator('new_email')
#     @classmethod
#     def check_new_email_domain_on_update(cls, value: Optional[EmailStr]) -> Optional[EmailStr]:
#         if value is None: 
#             return value
#         return validate_email_domain(value)


# class UserInDBBase(UserBase): 
#     email: EmailStr 
#     id: PyObjectId = Field(alias="_id")
    
#     model_config = ConfigDict(
#         populate_by_name=True,
#         arbitrary_types_allowed=True, 
#         json_encoders={ObjectId: str}
#     )

# class UserInDB(UserInDBBase): 
#     hashed_password: str

# class UserPublic(UserBase): 
#     email: EmailStr 
#     id: str 

#     @classmethod
#     def from_user_in_db(cls, user_in_db: UserInDB) -> "UserPublic":
#         return cls(
#             id=str(user_in_db.id),
#             email=user_in_db.email,
#             firstname=user_in_db.firstname,
#             lastname=user_in_db.lastname,
#             profile_picture_url=user_in_db.profile_picture_url 
#         )

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class TokenData(BaseModel):
#     email: Optional[str] = None

from pydantic import BaseModel, EmailStr, Field, ConfigDict, BeforeValidator, field_validator
from typing import Optional, Annotated, Any
from bson import ObjectId
import re # Import the regular expression module

# --- Allowed Email Domains ---
ALLOWED_EMAIL_DOMAINS = {"gmail.com", "yahoo.com", "outlook.com"}

# --- Custom Email Domain Validator ---
def validate_email_domain(email: EmailStr) -> EmailStr:
    if "@" not in email:
        raise ValueError("Invalid email format: missing '@' symbol.")
    domain = email.split('@', 1)[1].lower()
    if domain not in ALLOWED_EMAIL_DOMAINS:
        allowed_domains_str = ", ".join(f"@{d}" for d in ALLOWED_EMAIL_DOMAINS)
        raise ValueError(f"Email domain '@{domain}' is not allowed. Please use one of the following: {allowed_domains_str}.")
    return email

# --- Custom Password Validator ---
def validate_password_complexity(password: str) -> str:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", password): # Good practice to also ensure lowercase
        raise ValueError("Password must contain at least one lowercase letter.")
    if not re.search(r"[0-9]", password): # Good practice to also ensure a digit
        raise ValueError("Password must contain at least one digit.")
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`]", password): # Common special characters
        raise ValueError("Password must contain at least one special character (e.g., !@#$%^&*).")
    return password


def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if ObjectId.is_valid(v):
        return ObjectId(v)
    if isinstance(v, bytes) and len(v) == 12:
        return ObjectId(v)
    raise ValueError(f"Invalid ObjectId: {v}")

PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]

class UserBase(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    profile_picture_url: Optional[str] = None

class UserCreate(UserBase):
    email: EmailStr
    password: str = Field(..., min_length=8) # Keep min_length here for initial Pydantic check
    firstname: str = Field(..., min_length=1)
    lastname: str = Field(..., min_length=1)

    @field_validator('email')
    @classmethod
    def check_email_domain_on_create(cls, value: EmailStr) -> EmailStr:
        return validate_email_domain(value)

    @field_validator('password')
    @classmethod
    def check_password_complexity(cls, value: str) -> str:
        return validate_password_complexity(value)


class UserUpdate(BaseModel):
    firstname: Optional[str] = Field(None, min_length=1)
    lastname: Optional[str] = Field(None, min_length=1)
    new_email: Optional[EmailStr] = Field(None, description="New email address for the user")

    @field_validator('new_email')
    @classmethod
    def check_new_email_domain_on_update(cls, value: Optional[EmailStr]) -> Optional[EmailStr]:
        if value is None:
            return value
        return validate_email_domain(value)


class UserInDBBase(UserBase):
    email: EmailStr
    id: PyObjectId = Field(alias="_id")
    # NEW: Add is_admin field with a default value for existing users
    is_admin: bool = False # Default to False

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class UserInDB(UserInDBBase):
    hashed_password: str

class UserPublic(UserBase):
    email: EmailStr
    id: str
    is_admin: bool = False # Also include in public schema for display/frontend logic

    @classmethod
    def from_user_in_db(cls, user_in_db: UserInDB) -> "UserPublic":
        return cls(
            id=str(user_in_db.id),
            email=user_in_db.email,
            firstname=user_in_db.firstname,
            lastname=user_in_db.lastname,
            profile_picture_url=user_in_db.profile_picture_url,
            is_admin=user_in_db.is_admin # Include admin status
            # is_admin=True 
        )

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

