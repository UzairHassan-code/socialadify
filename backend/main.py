# D:\socialadify\backend\app\main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv # Usually handled by config.py or session.py
from contextlib import asynccontextmanager

# Import routers from both features
from app.api.auth.auth_router import router as auth_router
from app.api.insights.router import router as insights_router # Make sure this path is correct

# Import database connection handlers from the auth feature
from app.db.session import connect_to_mongo, close_mongo_connection # Make sure this path is correct

# Lifespan manager for database connection (from auth feature)
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup: Initializing resources...")
    await connect_to_mongo() # Connect to DB on startup
    yield # Application runs here
    print("Application shutdown: Cleaning up resources...")
    await close_mongo_connection() # Disconnect from DB on shutdown

# Initialize FastAPI app with lifespan manager and a general title
app = FastAPI(
    title="SocialAdify API (Merged)",
    description="API for Social Media and Ad Management Platform",
    version="0.1.0",
    lifespan=lifespan # Apply the lifespan manager
)

# CORS Middleware Setup
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

# Include Routers from both features
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(insights_router, prefix="/insights", tags=["Insights & AI Suggestions"])

@app.get("/")
async def read_root():
    return {"message": "Welcome to the SocialAdify Backend (Merged)!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
