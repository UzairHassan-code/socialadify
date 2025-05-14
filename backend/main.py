# D:\socialadify\backend\main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager # Import for lifespan

# Import routers
from app.api.auth.auth_router import router as auth_router
# from app.api.insights.router import router as insights_router # Uncomment when merging

# Import database connection handlers
from app.db.session import connect_to_mongo, close_mongo_connection

# Load environment variables from .env file (can be called here or in config/session)
# If session.py already loads it, this might be redundant but harmless.
load_dotenv() 

# Lifespan manager for database connection
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup: Initializing resources...")
    await connect_to_mongo() # Connect to DB on startup
    yield # Application runs here
    print("Application shutdown: Cleaning up resources...")
    await close_mongo_connection() # Disconnect from DB on shutdown

# Initialize FastAPI app with lifespan manager
app = FastAPI(title="SocialAdify API - Auth Branch", lifespan=lifespan)

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

# Include Routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
# app.include_router(insights_router, prefix="/insights", tags=["Insights"]) # Uncomment when merging

# Basic root endpoint
@app.get("/")
def read_root():
    return {"message": "SocialAdify Backend (Auth Branch) is running"}

