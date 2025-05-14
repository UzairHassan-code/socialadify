# D:\socialadify\backend\app\core\config.py
import os
from dotenv import load_dotenv
from pathlib import Path

# Determine the base directory (backend root) to find the .env file
# This assumes config.py is in app/core/
# So, Path(__file__).resolve() -> D:\socialadify\backend\app\core\config.py
# .parent -> D:\socialadify\backend\app\core\
# .parent.parent -> D:\socialadify\backend\app\
# .parent.parent.parent -> D:\socialadify\backend\
PROJECT_DIR = Path(__file__).resolve().parent.parent.parent 
ENV_PATH = PROJECT_DIR / ".env"

# Load the .env file from the backend root directory
# This ensures it's loaded if not already done by main.py or session.py
# It's safe to call load_dotenv() multiple times; it won't overwrite existing env vars.
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
    print(f"Loaded .env file from: {ENV_PATH}")
else:
    print(f"WARNING: .env file not found at {ENV_PATH}. Relying on system environment variables.")

# --- MongoDB Configuration ---
# DATABASE_URL is read from the .env file.
# The actual database name will be determined by session.py based on this URL.
DATABASE_URL = os.getenv("DATABASE_URL")

# --- JWT Token Settings ---
# Reads SECRET_KEY from .env (matching your .env file)
# Provides a default fallback if not set, though it's critical to set it in .env for security.
SECRET_KEY = os.getenv("SECRET_KEY", "your_default_fallback_secret_key_if_not_in_env_but_please_set_it")
ALGORITHM = os.getenv("ALGORITHM", "HS256") # Default algorithm if not in .env
# Ensure ACCESS_TOKEN_EXPIRE_MINUTES is read as an integer
ACCESS_TOKEN_EXPIRE_MINUTES_STR = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(ACCESS_TOKEN_EXPIRE_MINUTES_STR)
except ValueError:
    print(f"WARNING: Invalid ACCESS_TOKEN_EXPIRE_MINUTES value '{ACCESS_TOKEN_EXPIRE_MINUTES_STR}'. Using default 30.")
    ACCESS_TOKEN_EXPIRE_MINUTES = 30


# --- Optional: First Superuser (if your auth setup supports it) ---
# These would be read from .env if you uncommented them there
# FIRST_SUPERUSER_EMAIL = os.getenv("FIRST_SUPERUSER_EMAIL")
# FIRST_SUPERUSER_PASSWORD = os.getenv("FIRST_SUPERUSER_PASSWORD")


# --- Basic Checks & Warnings ---
if not DATABASE_URL:
    print("⚠️ CRITICAL WARNING: DATABASE_URL not found in environment variables or .env file.")
    # You might want to raise an exception here if the DB is essential for app startup
    # raise ValueError("DATABASE_URL must be set in the environment variables or .env file.")

if SECRET_KEY == "your_default_fallback_secret_key_if_not_in_env_but_please_set_it":
    print("⚠️ CRITICAL WARNING: SECRET_KEY is using a default fallback. Please set a strong, unique SECRET_KEY in your .env file.")
    # raise ValueError("SECRET_KEY must be set in the environment variables or .env file for security.")

# You can add other application-wide settings here as needed
# For example:
# PROJECT_NAME = "SocialAdify"
# API_V1_STR = "/api/v1"

print(f"Config loaded: DATABASE_URL (first 15 chars): {DATABASE_URL[:15] if DATABASE_URL else 'Not Set'}")
print(f"Config loaded: SECRET_KEY (first 5 chars): {SECRET_KEY[:5] if SECRET_KEY else 'Not Set'}...")
print(f"Config loaded: ALGORITHM: {ALGORITHM}")
print(f"Config loaded: ACCESS_TOKEN_EXPIRE_MINUTES: {ACCESS_TOKEN_EXPIRE_MINUTES}")

