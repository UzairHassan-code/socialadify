# D:\socialadify\backend\app\db\session.py

import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv
import certifi
from pathlib import Path
import logging # Import logging module for better messages

logger = logging.getLogger(__name__) # Get logger instance

# Construct path to .env in the backend root directory
backend_root = Path(__file__).resolve().parent.parent.parent
dotenv_path = backend_root / ".env"

if dotenv_path.exists():
    load_dotenv(dotenv_path=dotenv_path)
    logger.info(f"Loaded .env file from: {dotenv_path}") # Use logger instead of print
else:
    logger.warning(f"WARNING: .env file not found at {dotenv_path} by session.py. Relying on system environment variables or .env loaded elsewhere.")

# --- Database Configuration ---
DATABASE_URL = os.getenv("DATABASE_URL")

# Try to parse DB_NAME from DATABASE_URL, otherwise use a default
if DATABASE_URL:
    try:
        path_part = DATABASE_URL.split("/")[-1]
        db_name_from_url = path_part.split("?")[0]

        if db_name_from_url and db_name_from_url != DATABASE_URL and not db_name_from_url.startswith("mongodb+srv:"):
            DB_NAME = db_name_from_url
        else:
            DB_NAME = os.getenv("MONGODB_DB_NAME", "db_socialadify") # Ensure this default is correct
            logger.info(f"DB_NAME from URL was inconclusive, using MONGODB_DB_NAME env or default: {DB_NAME}")
    except Exception as e:
        DB_NAME = os.getenv("MONGODB_DB_NAME", "db_socialadify")
        logger.error(f"Error parsing DB_NAME from URL ({e}), using MONGODB_DB_NAME env or default: {DB_NAME}", exc_info=True) # Log full exception
else:
    DB_NAME = os.getenv("MONGODB_DB_NAME", "db_socialadify")
    logger.critical("CRITICAL ERROR: DATABASE_URL not set in environment. Using default DB_NAME in session.py and connection will likely fail.")


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
        logger.critical("CRITICAL ERROR: DATABASE_URL is not set. Cannot connect to MongoDB.")
        return

    logger.info(f"Attempting to connect to MongoDB (parsed DB: '{DB_NAME}')") # Changed print to logger.info
    
    try:
        ca = certifi.where()
        logger.debug(f"Using certifi CA bundle at: {ca}") # Changed to debug level

        client = AsyncIOMotorClient(
            DATABASE_URL,
            tlsCAFile=ca
        )

        await client.admin.command('ping')
        
        # NEW DEBUG PRINT: Verify the database name the client is using
        logger.info(f"Successfully connected to MongoDB. Client attempting to access database: '{DB_NAME}'")
        db = client[DB_NAME]
        logger.info(f"Successfully obtained database instance for: '{DB_NAME}'")
        
    except Exception as e:
        logger.critical(f"Error connecting to MongoDB: {e}", exc_info=True) # Changed to critical and added exc_info
        client = None
        db = None


async def close_mongo_connection():
    """
    Closes the MongoDB connection when the application shuts down.
    """
    global client
    if client:
        logger.info("Closing MongoDB connection...")
        client.close()
        logger.info("MongoDB connection closed.")

async def get_database() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency to get the database instance.
    Ensures that 'db' is initialized.
    """
    if db is None:
        logger.error("get_database() called but 'db' instance is None. This might indicate a connection issue at startup or DATABASE_URL not set.")
        raise Exception("Database not initialized. Ensure connect_to_mongo() is successfully called at application startup via lifespan manager and DATABASE_URL is correctly set.")
    return db
