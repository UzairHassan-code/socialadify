# D:\socialadify\backend\app\core\security.py
from datetime import datetime, timedelta, timezone
from typing import Optional

from passlib.context import CryptContext
from jose import JWTError, jwt

# Imports configuration variables (ensure config.py defines these)
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Password Hashing
# This line is critical. If passlib or bcrypt has issues, an error might occur here.
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    print("DEBUG: pwd_context created successfully in security.py")
except Exception as e:
    print(f"CRITICAL ERROR: Failed to create CryptContext in security.py: {e}")
    # Depending on how critical this is, you might want to raise the exception
    # to halt application startup if password hashing can't be initialized.
    # raise e 
    pwd_context = None # Set to None so subsequent calls might fail more clearly if not handled

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password."""
    if not pwd_context:
        print("ERROR: pwd_context not initialized in verify_password.")
        # Handle error appropriately, e.g., raise an exception or return False
        raise RuntimeError("Password context not initialized. Cannot verify password.")
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a plain password."""
    if not pwd_context:
        print("ERROR: pwd_context not initialized in get_password_hash.")
        # Handle error appropriately
        raise RuntimeError("Password context not initialized. Cannot hash password.")
    return pwd_context.hash(password)

print("DEBUG: get_password_hash and verify_password defined in security.py")

# JWT Token Creation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a JWT access token.

    Args:
        data: The data to encode in the token (typically includes user identifier like email or ID).
        expires_delta: Optional timedelta for token expiry. If None, uses default from config.

    Returns:
        The encoded JWT access token as a string.
    """
    to_encode = data.copy()
    current_time_utc = datetime.now(timezone.utc)

    if expires_delta:
        expire = current_time_utc + expires_delta
    else:
        # Use ACCESS_TOKEN_EXPIRE_MINUTES from config for default expiry
        expire = current_time_utc + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": current_time_utc}) # Added "iat" (issued at) claim
    
    if not SECRET_KEY or not ALGORITHM:
        print("CRITICAL ERROR: SECRET_KEY or ALGORITHM not configured for create_access_token.")
        raise ValueError("JWT settings (SECRET_KEY, ALGORITHM) are not configured.")
        
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

print("DEBUG: create_access_token defined in security.py")
print("DEBUG: app.core.security module loaded successfully.")

# --- Placeholder for token decoding and current user retrieval ---
# You will likely need functions like these for protected routes:

# from fastapi import Depends, HTTPException, status # Add these imports if using below
# from fastapi.security import OAuth2PasswordBearer # Add this import if using below
# from motor.motor_asyncio import AsyncIOMotorDatabase # Add this import if using below
# from app.db.session import get_database # Adjust if your get_database is elsewhere

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login") # tokenUrl should match your login endpoint

# def decode_access_token(token: str) -> Optional[dict]:
#     """
#     Decodes an access token.
#     Returns the payload if valid, None otherwise.
#     """
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except JWTError as e:
#         print(f"JWTError decoding token: {e}")
#         return None

# async def get_current_active_user(
#     token: str = Depends(oauth2_scheme), 
#     db: AsyncIOMotorDatabase = Depends(get_database) # Assuming get_database is your DB dependency
# ):
#     """
#     FastAPI dependency to get the current authenticated and active user from a token.
#     """
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     payload = decode_access_token(token)
#     if payload is None:
#         raise credentials_exception
    
#     email: str = payload.get("sub")
#     if email is None:
#         raise credentials_exception
    
#     from app.crud import user as user_crud # Import here to avoid circular dependency if user_crud imports security
#     user_in_db = await user_crud.get_user_by_email(db, email=email)
    
#     if user_in_db is None:
#         raise credentials_exception
    
#     # Here you could convert user_in_db (likely UserInDB model) to UserPublic model if needed
#     # from app.schemas.user import UserPublic
#     # return UserPublic.from_user_in_db(user_in_db) # Example
#     return user_in_db # Or return the DB model directly if that's what your endpoints expect
