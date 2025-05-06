from app.api.insights import router as insights_router
app.include_router(insights_router, prefix="/insights")
