# D:\socialadify\backend\app\api\auth\auth_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm 
from motor.motor_asyncio import AsyncIOMotorDatabase # Uncommented
from typing import Annotated 

# --- Imports ---
from app.schemas.user import UserCreate, UserPublic, Token # UserLogin is not directly used here, form_data handles it
from app.crud import user as user_service 
from app.core.security import create_access_token 
from app.db.session import get_database # Uncommented

router = APIRouter()

# Define the database dependency type
DbDependency = Annotated[AsyncIOMotorDatabase, Depends(get_database)] # Uncommented

@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def signup_user(
    user_in: UserCreate, 
    db: DbDependency # Uncommented
):
    """
    Handles user registration.
    - Checks if email already exists via user_service.
    - Creates the user in the database.
    - Returns the public user information.
    """
    # user_service.create_user will raise HTTPException if email exists
    # Ensure create_user function exists in app.crud.user and uses the db correctly
    created_user = await user_service.create_user(db=db, user_create=user_in) # Uncommented
    # Ensure the returned object matches UserPublic structure.
    # The create_user service already returns UserPublic.
    return created_user # Uncommented

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
    db: DbDependency # Uncommented
):
    """
    Handles user login using OAuth2 password flow.
    - Authenticates user based on email (username field of form) and password.
    - Creates and returns a JWT access token upon success.
    """
    # Authenticate the user using the email from the form's username field
    # Ensure authenticate_user exists in app.crud.user
    user = await user_service.authenticate_user( # Uncommented
        db=db, email=form_data.username, password=form_data.password
    )
    if not user: # Uncommented
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Create the access token using the user's email as the subject
    # Ensure create_access_token exists in app.core.security
    access_token = create_access_token(data={"sub": user.email}) # Uncommented
    return {"access_token": access_token, "token_type": "bearer"} # Uncommented

# Example "/users/me" endpoint (you can add this later)
# from app.core.security import get_current_active_user # Needs to be defined in security.py
# from app.schemas.user import UserPublic # Already imported

# CurrentUserDependency = Annotated[UserPublic, Depends(get_current_active_user)]

# @router.get("/users/me", response_model=UserPublic)
# async def read_users_me(
#     current_user: CurrentUserDependency 
# ):
#     """
#     Fetch the currently authenticated user.
#     """
#     return current_user
