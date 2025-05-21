# D:\socialadify\backend\app\main.py
from fastapi import FastAPI # Ensure no leading space on this line
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
# Removed: from fastapi.staticfiles import StaticFiles
# Removed: from pathlib import Path

from app.api.auth.auth_router import router as auth_router
from app.api.insights.router import router as insights_router
from app.api.captions.router import router as captions_router # New import
from app.db.session import connect_to_mongo, close_mongo_connection
import logging # Added for logging configuration

# Removed: BASE_DIR and STATIC_DIR definitions

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup: Initializing resources...")
    # Removed: STATIC_DIR.mkdir(parents=True, exist_ok=True)
    await connect_to_mongo()
    yield
    logger.info("Application shutdown: Cleaning up resources...")
    await close_mongo_connection()

app = FastAPI(
    title="SocialAdify API", # Simplified title
    description="API for Social Media Ad Management and AI Content Generation Platform",
    version="0.2.0", # Incremented version
    lifespan=lifespan
)

# Removed: app.mount("/static", ...)

origins = [
    "http://localhost:3000", # Standard Next.js dev port
    "http://127.0.0.1:3000",
    # Add other origins if needed (e.g., deployed frontend URL)
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(insights_router, prefix="/insights", tags=["Insights & Ad Analytics"])
app.include_router(captions_router, prefix="/captions", tags=["AI Caption Generation"]) # New router included

@app.get("/")
async def read_root():
    return {"message": "Welcome to the SocialAdify Backend API!"} # Updated message

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
# Ensure the file ends cleanly here, typically with a newline character.
# No extra spaces or misaligned indentation below this line.

