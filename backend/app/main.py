# D:\socialadify\backend\app\main.py
from fastapi import FastAPI # Ensure no leading space on this line
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
# Removed: from fastapi.staticfiles import StaticFiles
# Removed: from pathlib import Path

from app.api.auth.auth_router import router as auth_router
from app.api.insights.router import router as insights_router
from app.db.session import connect_to_mongo, close_mongo_connection

# Removed: BASE_DIR and STATIC_DIR definitions

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup: Initializing resources...")
    # Removed: STATIC_DIR.mkdir(parents=True, exist_ok=True)
    await connect_to_mongo()
    yield
    print("Application shutdown: Cleaning up resources...")
    await close_mongo_connection()

app = FastAPI(
    title="SocialAdify API (Merged)",
    description="API for Social Media and Ad Management Platform",
    version="0.1.0",
    lifespan=lifespan
)

# Removed: app.mount("/static", ...)

origins = [ "http://localhost:3000", "http://127.0.0.1:3000" ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(insights_router, prefix="/insights", tags=["Insights & AI Suggestions"])

@app.get("/")
async def read_root():
    return {"message": "Welcome to the SocialAdify Backend (Merged)!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
# Ensure the file ends cleanly here, typically with a newline character.
# No extra spaces or misaligned indentation below this line.
