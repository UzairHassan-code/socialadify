from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path
import logging
import os

# --- Imports for the scheduler and new routers ---
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.scheduler_service import process_due_posts
from app.api.auth.auth_router import router as auth_router
from app.api.insights.router import router as insights_router
from app.api.captions.router import router as captions_router
from app.api.admin.admin_router import router as admin_router
from app.api.scheduling.router import router as scheduling_router
from app.api.post_generator.router import router as post_generator_router
from app.api.history.router import router as history_router
from app.api.insights import meta_router
from app.api.auth import google_auth_router
from app.api.insights import google_ads_router

from app.db.session import connect_to_mongo, close_mongo_connection
from app.core.config import CLIENT_HOST

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Define paths for static files, including new ones ---
MAIN_PY_DIR = Path(__file__).resolve().parent
STATIC_FILES_DIR = MAIN_PY_DIR / "static"
PROFILE_PICS_DIR = STATIC_FILES_DIR / "profile_pics"
SCHEDULED_POST_IMAGES_DIR = STATIC_FILES_DIR / "scheduled_post_images"

# Ensure all static directories exist
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
    
    # --- Start the background scheduler ---
    logger.info("Starting background scheduler...")
    scheduler = AsyncIOScheduler()
    scheduler.add_job(process_due_posts, 'interval', minutes=1)
    scheduler.start()
    logger.info("Background scheduler started, running every minute.")
    
    yield
    
    logger.info("Application shutdown: Cleaning up resources...")
    scheduler.shutdown()
    logger.info("Background scheduler shut down.")
    await close_mongo_connection()

app = FastAPI(
    title="SocialAdify API",
    description="API for Social Media Ad Management and AI Content Generation Platform",
    version="1.0.0",
    lifespan=lifespan
)

# --- Mount static files directory ---
try:
    absolute_static_path = str(STATIC_FILES_DIR.resolve())
    app.mount("/static", StaticFiles(directory=absolute_static_path), name="static")
    logger.info(f"Successfully mounted static files from: {absolute_static_path} at URL path /static")
except Exception as e:
    logger.error(f"CRITICAL: Failed to mount static files directory: {e}", exc_info=True)


# --- CORS Middleware ---
if CLIENT_HOST:
    origins = [CLIENT_HOST, "http://localhost:3000", "http://127.0.0.1:3000"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(set(origins)),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    logger.warning("CLIENT_HOST not set, CORS will not be configured.")

# --- API Routers ---
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(insights_router, prefix="/insights", tags=["Insights & Ad Analytics"])
app.include_router(captions_router, prefix="/captions", tags=["AI Caption Generation"])
app.include_router(admin_router, prefix="/admin", tags=["Admin Panel"])
app.include_router(scheduling_router, prefix="/scheduler", tags=["Post Scheduling"])
app.include_router(post_generator_router, prefix="/post-generator", tags=["Post Generator"])
app.include_router(history_router, prefix="/history", tags=["History"])
app.include_router(meta_router.router, prefix="/insights/meta", tags=["Meta Insights"])
app.include_router(google_auth_router.router, prefix="/auth", tags=["Authentication"])
app.include_router(google_ads_router.router, prefix="/insights", tags=["Google Ads Insights"])

# --- Root and Health Check Endpoints ---
@app.get("/")
async def read_root():
    return {"message": "Welcome to the SocialAdify Backend API!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}