# D:\socialadify\backend\app\db\session.py

import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv
import certifi # <--- ENSURE THIS IMPORT IS PRESENT
from pathlib import Path # For robust .env path finding

# Construct path to .env in the backend root directory
backend_root = Path(__file__).resolve().parent.parent.parent 
dotenv_path = backend_root / ".env"

if dotenv_path.exists():
    load_dotenv(dotenv_path=dotenv_path)
    # print(f"DEBUG: session.py loaded .env from: {dotenv_path}") # Optional debug
else:
    print(f"WARNING: .env file not found at {dotenv_path} by session.py. Relying on system environment variables or .env loaded elsewhere.")

# --- Database Configuration ---
DATABASE_URL = os.getenv("DATABASE_URL") 

# Try to parse DB_NAME from DATABASE_URL, otherwise use a default
# This logic is important for making sure the correct database is targeted.
if DATABASE_URL:
    try:
        path_part = DATABASE_URL.split("/")[-1]
        db_name_from_url = path_part.split("?")[0]
        
        if db_name_from_url and db_name_from_url != DATABASE_URL and not db_name_from_url.startswith("mongodb+srv:"):
            DB_NAME = db_name_from_url
        else:
            # If parsing didn't yield a clear DB name (e.g. URL is just server part or parsing failed)
            # Fallback to an environment variable or a hardcoded default.
            DB_NAME = os.getenv("MONGODB_DB_NAME", "socialadify_db") 
            # print(f"DEBUG: DB_NAME from URL was inconclusive, using MONGODB_DB_NAME env or default: {DB_NAME}")
    except Exception as e:
        DB_NAME = os.getenv("MONGODB_DB_NAME", "socialadify_db")
        # print(f"DEBUG: Error parsing DB_NAME from URL ({e}), using MONGODB_DB_NAME env or default: {DB_NAME}")
else:
    DB_NAME = os.getenv("MONGODB_DB_NAME", "socialadify_db") 
    print("WARNING: DATABASE_URL not set in environment. Using default DB_NAME in session.py and connection will likely fail.")


# --- Global Database Client and Database Instance ---
client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None

async def connect_to_mongo():
    """
    Establishes the connection to MongoDB when the application starts.
    Initializes the global 'client' and 'db' variables.
    Uses certifi for SSL certificate verification with MongoDB Atlas.
    """
    global client, db
    if not DATABASE_URL:
        print("CRITICAL ERROR: DATABASE_URL is not set. Cannot connect to MongoDB.")
        return

    print(f"Attempting to connect to MongoDB (using DB: '{DB_NAME}')")
    try:
        # --- Use certifi's CA bundle for TLS/SSL ---
        ca = certifi.where() # Get path to certifi's CA bundle
        print(f"DEBUG: Using certifi CA bundle at: {ca}") # Debug print

        client = AsyncIOMotorClient(
            DATABASE_URL,
            tlsCAFile=ca  # <--- THIS IS THE CRITICAL LINE FOR CERTIFI
        )
        
        await client.admin.command('ping') 
        db = client[DB_NAME] 
        print(f"Successfully connected to MongoDB. Using database: '{DB_NAME}'")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        import traceback # For more detailed error in development
        print(traceback.format_exc()) # Print full traceback
        client = None
        db = None


async def close_mongo_connection():
    """
    Closes the MongoDB connection when the application shuts down.
    """
    global client
    if client:
        print("Closing MongoDB connection...")
        client.close()
        print("MongoDB connection closed.")

async def get_database() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency to get the database instance.
    Ensures that 'db' is initialized.
    """
    if db is None:
        print("WARNING: get_database() called but 'db' instance is None. This might indicate a connection issue at startup or DATABASE_URL not set.")
        if db is None: 
             raise Exception("Database not initialized. Ensure connect_to_mongo() is successfully called at application startup via lifespan manager and DATABASE_URL is correctly set.")
    return db

