# # D:\socialadify\backend\main.py
# from fastapi import FastAPI
# from fastapi.staticfiles import StaticFiles 
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager
# from pathlib import Path 

# # Imports from your 'app' package
# from app.api.auth.auth_router import router as auth_router
# from app.api.insights.router import router as insights_router
# from app.api.captions.router import router as captions_router
# from app.db.session import connect_to_mongo, close_mongo_connection
# import logging

# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # --- Define path for static files ---
# # main.py is in D:\socialadify\backend\
# # Path(__file__).resolve().parent will be D:\socialadify\backend\
# MAIN_PY_DIR = Path(__file__).resolve().parent 
# STATIC_FILES_DIR = MAIN_PY_DIR / "static"    # Resolves to D:\socialadify\backend\static
# PROFILE_PICS_DIR = STATIC_FILES_DIR / "profile_pics" 

# # Ensure static directories exist BEFORE FastAPI app initialization
# STATIC_FILES_DIR.mkdir(parents=True, exist_ok=True)
# PROFILE_PICS_DIR.mkdir(parents=True, exist_ok=True)
# logger.info(f"Ensured static files directory exists: {STATIC_FILES_DIR.resolve()}")
# logger.info(f"Ensured profile pictures directory exists: {PROFILE_PICS_DIR.resolve()}")

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     logger.info("Application startup: Initializing resources...")
#     await connect_to_mongo()
#     yield
#     logger.info("Application shutdown: Cleaning up resources...")
#     await close_mongo_connection()

# app = FastAPI(
#     title="SocialAdify API",
#     description="API for Social Media Ad Management and AI Content Generation Platform",
#     version="0.3.4", # Incremented version
#     lifespan=lifespan
# )

# # --- Mount static files directory ---
# # Mount the entire STATIC_FILES_DIR at /static
# # This means a file at backend/static/profile_pics/image.jpg will be accessible at /static/profile_pics/image.jpg
# absolute_static_path = str(STATIC_FILES_DIR.resolve())
# app.mount("/static", StaticFiles(directory=absolute_static_path), name="static")
# logger.info(f"Mounted general static files from: {absolute_static_path} at /static path")


# origins = [
#     "http://localhost:3000", 
#     "http://127.0.0.1:3000",
# ]
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
# app.include_router(insights_router, prefix="/insights", tags=["Insights & Ad Analytics"])
# app.include_router(captions_router, prefix="/captions", tags=["AI Caption Generation"])

# @app.get("/")
# async def read_root():
#     return {"message": "Welcome to the SocialAdify Backend API!"}

# @app.get("/health")
# async def health_check():
#     return {"status": "healthy"}

# # To run this (from D:\socialadify\backend\ directory, assuming your venv is active):
# # uvicorn main:app --reload --port 8000
# D:\socialadify\backend\main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path
import logging

# Imports from your 'app' package
from app.api.auth.auth_router import router as auth_router
from app.api.insights.router import router as insights_router
from app.api.captions.router import router as captions_router
from app.api.admin.admin_router import router as admin_router # NEW: Import admin router
from app.db.session import connect_to_mongo, close_mongo_connection

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Define path for static files ---
MAIN_PY_DIR = Path(__file__).resolve().parent
STATIC_FILES_DIR = MAIN_PY_DIR / "static"
PROFILE_PICS_DIR = STATIC_FILES_DIR / "profile_pics"

# Ensure static directories exist BEFORE FastAPI app initialization
STATIC_FILES_DIR.mkdir(parents=True, exist_ok=True)
PROFILE_PICS_DIR.mkdir(parents=True, exist_ok=True)
logger.info(f"Ensured static files directory exists: {STATIC_FILES_DIR.resolve()}")
logger.info(f"Ensured profile pictures directory exists: {PROFILE_PICS_DIR.resolve()}")

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
    version="0.3.5", # Incremented version
    lifespan=lifespan
)

# --- Mount static files directory ---
absolute_static_path = str(STATIC_FILES_DIR.resolve())
app.mount("/static", StaticFiles(directory=absolute_static_path), name="static")
logger.info(f"Mounted general static files from: {absolute_static_path} at /static path")

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
app.include_router(admin_router, prefix="/admin", tags=["Admin Panel"]) # NEW: Include admin router

@app.get("/")
async def read_root():
    return {"message": "Welcome to the SocialAdify Backend API!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# To run this (from D:\socialadify\backend\ directory, assuming your venv is active):
# uvicorn main:app --reload --port 8000
