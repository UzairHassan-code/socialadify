# D:\socialadify\backend\app\core\security.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Annotated 
import secrets # For generating secure tokens

from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.session import get_database 
from app.crud import user as user_crud 
from app.schemas.user import UserInDB, UserPublic 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

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

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        print(f"JWTError decoding token: {e}") # Use logger in production
        return None

DbDependency = Annotated[AsyncIOMotorDatabase, Depends(get_database)]

async def get_current_active_user(
    token: Annotated[str, Depends(oauth2_scheme)], 
    db: DbDependency
) -> UserInDB: 
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        print("get_current_active_user: Token decoding failed or token invalid.")
        raise credentials_exception
    
    email: Optional[str] = payload.get("sub") 
    if email is None:
        print("get_current_active_user: Email (sub) not found in token payload.")
        raise credentials_exception
    
    user_in_db = await user_crud.get_user_by_email(db, email=email)
    
    if user_in_db is None:
        print(f"get_current_active_user: User with email {email} not found in DB.")
        raise credentials_exception
    
    # Add is_active check here if you have such a field on your UserInDB model
    # if not user_in_db.is_active:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
        
    print(f"get_current_active_user: User {user_in_db.email} authenticated successfully.")
    return user_in_db

# --- New function for generating password reset tokens ---
def create_password_reset_token(length: int = 32) -> str:
    """Generates a secure, URL-safe random token."""
    return secrets.token_urlsafe(length)

