# D:\socialadify\backend\main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles 
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path 
import os # Import os for path joining if needed, though pathlib is preferred

# Imports from your 'app' package
from app.api.auth.auth_router import router as auth_router
from app.api.insights.router import router as insights_router
from app.api.captions.router import router as captions_router
from app.api.scheduling.router import router as scheduling_router 
from app.db.session import connect_to_mongo, close_mongo_connection
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Define path for static files ---
# This assumes main.py is in D:\socialadify\backend\
MAIN_PY_DIR = Path(__file__).resolve().parent 
STATIC_FILES_DIR = MAIN_PY_DIR / "static"    
PROFILE_PICS_DIR = STATIC_FILES_DIR / "profile_pics" 
SCHEDULED_POST_IMAGES_DIR = STATIC_FILES_DIR / "scheduled_post_images"

# Ensure static directories exist BEFORE FastAPI app initialization
STATIC_FILES_DIR.mkdir(parents=True, exist_ok=True)
PROFILE_PICS_DIR.mkdir(parents=True, exist_ok=True)
SCHEDULED_POST_IMAGES_DIR.mkdir(parents=True, exist_ok=True) 
logger.info(f"Static files root directory confirmed at: {STATIC_FILES_DIR.resolve()}")
logger.info(f"Profile pictures subdirectory confirmed at: {PROFILE_PICS_DIR.resolve()}")
logger.info(f"Scheduled post images subdirectory confirmed at: {SCHEDULED_POST_IMAGES_DIR.resolve()}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup: Initializing resources...")
    await connect_to_mongo()
    yield
    logger.info("Application shutdown: Cleaning up resources...")
    await close_mongo_connection()

app = FastAPI(
    title="SocialAdify API",
    description="API for Social Media Ad Management and AI Content Generation Platform",
    version="0.4.1", # Incremented version
    lifespan=lifespan
)

# --- Mount static files directory ---
# Mount the entire STATIC_FILES_DIR at the URL prefix /static
# This means a file at backend/static/some_subdir/image.jpg 
# will be accessible at http://localhost:8000/static/some_subdir/image.jpg
# D:\socialadify\backend\static\scheduled_post_images
try:
    absolute_static_path = str(STATIC_FILES_DIR.resolve())
    if not Path(absolute_static_path).is_dir():
        logger.error(f"CRITICAL: The resolved static files directory does not exist or is not a directory: {absolute_static_path}")
    else:
        app.mount("/static", StaticFiles(directory=absolute_static_path, html=False, check_dir=True), name="static_files_mount") # Added check_dir, html=False
        logger.info(f"Successfully mounted static files from: {absolute_static_path} at URL path /static")
except Exception as e:
    logger.error(f"CRITICAL: Failed to mount static files directory: {e}", exc_info=True)


origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
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
app.include_router(captions_router, prefix="/captions", tags=["AI Caption Generation"])
app.include_router(scheduling_router, prefix="/schedule", tags=["Post Scheduling"]) 

@app.get("/")
async def read_root():
    return {"message": "Welcome to the SocialAdify Backend API!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
