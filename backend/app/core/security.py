# D:\socialadify\backend\app\core\security.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Annotated
import secrets # For generating secure tokens - KEPT FROM PARTNER'S CHANGES

from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer # Ensure this is imported

# Imports configuration variables
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# For database dependency in get_current_active_user - KEPT THIS COMMENT
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.session import get_database
from app.crud import user as user_crud
from app.schemas.user import UserInDB, UserPublic # UserPublic needed for AdminPanel to correctly return user data from DB

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# OAuth2 scheme for token dependency
# The tokenUrl should point to your login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# JWT Token Creation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    current_time_utc = datetime.now(timezone.utc)
    if expires_delta:
        expire = current_time_utc + expires_delta
    else:
        expire = current_time_utc + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": current_time_utc})

    if not SECRET_KEY or not ALGORITHM:
        raise ValueError("JWT settings (SECRET_KEY, ALGORITHM) are not configured.")

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- NEW/UPDATED FUNCTIONS FOR GETTING CURRENT USER ---

def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes an access token.
    Returns the payload if valid, None otherwise.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        # Log the error for debugging purposes - COMBINED COMMENTS
        print(f"JWTError decoding token: {e}") # Use logger in production - KEPT PARTNER'S COMMENT
        return None

# Define Database dependency type for get_current_active_user
DbDependency = Annotated[AsyncIOMotorDatabase, Depends(get_database)]

async def get_current_active_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: DbDependency
) -> UserInDB: # Return UserInDB which contains all necessary fields including hashed_password
    """
    FastAPI dependency to get the current authenticated and active user from a token.
    This function will be used in protected routes.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        print("get_current_active_user: Token decoding failed or token invalid.")
        raise credentials_exception

    email: Optional[str] = payload.get("sub") # 'sub' should be the user's email
    if email is None:
        print("get_current_active_user: Email (sub) not found in token payload.")
        raise credentials_exception

    # Fetch user from DB using the email from the token
    user_in_db = await user_crud.get_user_by_email(db, email=email)

    if user_in_db is None:
        print(f"get_current_active_user: User with email {email} not found in DB.")
        raise credentials_exception

    # Here you could add checks if the user is active, e.g., user_in_db.is_active - KEPT PARTNER'S COMMENT
    # For now, we assume if the user exists, they are active.
    # if not user_in_db.is_active: - KEPT PARTNER'S COMMENT
    #    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user") - KEPT PARTNER'S COMMENT

    print(f"get_current_active_user: User {user_in_db.email} authenticated successfully.")
    return user_in_db # Return the UserInDB model

# NEW: Admin specific dependency - KEPT YOUR CODE FOR ADMIN
async def get_current_active_admin(
    current_user: Annotated[UserInDB, Depends(get_current_active_user)]
) -> UserInDB:
    """
    FastAPI dependency to ensure the current authenticated user is an administrator.
    Raises HTTPException 403 Forbidden if the user is not an admin.
    """
    if not current_user.is_admin:
        print(f"Access denied for user {current_user.email}: Not an admin.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation forbidden: Not enough privileges (admin required)"
        )
    print(f"get_current_active_admin: Admin user {current_user.email} authenticated successfully.")
    return current_user

# NEW: Function for generating password reset tokens (from partner's branch) - KEPT PARTNER'S NEW FUNCTION
def create_password_reset_token(length: int = 32) -> str:
    """Generates a secure, URL-safe random token."""
    return secrets.token_urlsafe(length)
