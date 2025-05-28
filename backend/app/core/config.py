# D:\socialadify\backend\app\core\config.py
import os
from dotenv import load_dotenv
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent.parent 
ENV_PATH = PROJECT_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
    print(f"Loaded .env file from: {ENV_PATH}")
else:
    print(f"WARNING: .env file not found at {ENV_PATH}. Relying on system environment variables.")

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "your_default_fallback_secret_key_if_not_in_env_but_please_set_it")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES_STR = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(ACCESS_TOKEN_EXPIRE_MINUTES_STR)
except ValueError:
    print(f"WARNING: Invalid ACCESS_TOKEN_EXPIRE_MINUTES value '{ACCESS_TOKEN_EXPIRE_MINUTES_STR}'. Using default 60.")
    ACCESS_TOKEN_EXPIRE_MINUTES = 60

# FRONTEND_URL is defined here and loaded from .env or defaults
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000") 

# --- Basic Checks & Warnings ---
if not DATABASE_URL:
    print("⚠️ CRITICAL WARNING: DATABASE_URL not found in environment variables or .env file.")
if SECRET_KEY == "your_default_fallback_secret_key_if_not_in_env_but_please_set_it":
    print("⚠️ CRITICAL WARNING: SECRET_KEY is using a default fallback. Please set a strong, unique SECRET_KEY in your .env file.")

print(f"Config loaded: DATABASE_URL (first 15 chars): {DATABASE_URL[:15] if DATABASE_URL else 'Not Set'}")
print(f"Config loaded: Frontend URL for links: {FRONTEND_URL}") # Log to confirm it's loaded
