# D:\socialadify\backend\app\core\config.py

import os
from dotenv import load_dotenv
from pathlib import Path
import logging

# --- Project Directory Setup ---
PROJECT_DIR = Path(__file__).resolve().parent.parent.parent 
ENV_PATH = PROJECT_DIR / ".env"

# --- Load Environment Variables ---
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
    print(f"Loaded .env file from: {ENV_PATH}")
else:
    print(f"WARNING: .env file not found at {ENV_PATH}. Relying on system environment variables.")

# --- Core Application Settings ---
# --- Define a class to hold all configuration settings ---
class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")
    SECRET_KEY = os.getenv("SECRET_KEY", "your_default_fallback_secret_key_if_not_in_env_but_please_set_it")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    
    # Expiration minutes
    ACCESS_TOKEN_EXPIRE_MINUTES_STR = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")

    try:
        ACCESS_TOKEN_EXPIRE_MINUTES = int(ACCESS_TOKEN_EXPIRE_MINUTES_STR)
    except ValueError:
        print(f"WARNING: Invalid ACCESS_TOKEN_EXPIRE_MINUTES value '{ACCESS_TOKEN_EXPIRE_MINUTES_STR}'. Using default 60.")
        ACCESS_TOKEN_EXPIRE_MINUTES = 60

    # Host URLs
    CLIENT_HOST = os.getenv("FRONTEND_URL", "http://localhost:3000")
    SERVER_HOST = os.getenv("SERVER_HOST", "http://localhost:8000")

    # Meta (Facebook/Instagram) settings
    META_APP_ID = os.getenv("META_APP_ID", "")
    META_APP_SECRET = os.getenv("META_APP_SECRET", "")
    META_CALLBACK_URL = os.getenv("META_CALLBACK_URL", f"{CLIENT_HOST}/auth/meta/callback")

    # Google OAuth credentials
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# --- Create an instance of the Settings class ---
settings = Settings()

# --- Basic Checks & Warnings ---
if not settings.DATABASE_URL:
    logging.warning("⚠️ CRITICAL WARNING: DATABASE_URL not found in environment variables or .env file.")
if settings.SECRET_KEY == "your_default_fallback_secret_key_if_not_in_env_but_please_set_it":
    logging.warning("⚠️ CRITICAL WARNING: SECRET_KEY is using a default fallback. Please set a strong, unique SECRET_KEY in your .env file.")
if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
    logging.warning("⚠️ CRITICAL WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found. Google OAuth will not work.")

# --- Confirmation Logging ---
logging.info(f"Config loaded: DATABASE_URL (first 15 chars): {settings.DATABASE_URL[:15] if settings.DATABASE_URL else 'Not Set'}")
logging.info(f"Config loaded: Client Host URL for links: {settings.CLIENT_HOST}")
logging.info(f"Config loaded: Server Host URL for links: {settings.SERVER_HOST}")
logging.info(f"Config loaded: Google Client ID is {'Set' if settings.GOOGLE_CLIENT_ID else 'Not Set'}")