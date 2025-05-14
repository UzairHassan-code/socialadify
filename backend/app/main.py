# D:\socialadify\backend\app\main.py

from fastapi import FastAPI
from app.api.insights.router import router as insights_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "[http://127.0.0.1:3000](http://127.0.0.1:3000)", # This allows requests from your frontend when accessed via 127.0.0.1
    # any other origins for deployed versions
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(insights_router, prefix="/insights", tags=["Insights"])
@app.get("/")
def read_root():
    return {"message": "SocialAdify Backend is running"}