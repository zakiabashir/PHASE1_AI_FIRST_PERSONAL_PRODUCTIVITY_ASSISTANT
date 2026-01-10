"""
FastAPI application entry point for Phase II Web Interface
"""

import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.settings import _load_env_file
import os

# Load environment variables
_load_env_file()

# Get CORS origins
CORS_ORIGINS = os.getenv("CORS_ORIGINS", '["http://localhost:5173", "http://localhost:3000"]')
try:
    cors_origins = json.loads(CORS_ORIGINS)
except:
    cors_origins = ["http://localhost:5173", "http://localhost:3000"]

# Create FastAPI app
app = FastAPI(
    title="AI Productivity Assistant API",
    description="Backend API for AI-powered task management",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from src.backend.api.routes import auth, tasks, ai
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(ai.router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "AI Productivity Assistant API",
        "version": "2.0.0",
        "docs": "/docs"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Startup event - initialize database
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup."""
    try:
        # Check if DATABASE_URL is set
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            import logging
            logging.warning("DATABASE_URL not set - skipping database initialization")
            return

        from src.backend.core.database import init_db
        init_db()
        import logging
        logging.info("Database initialized successfully")
    except Exception as e:
        import logging
        logging.error(f"Failed to initialize database: {e}")
        # Don't fail startup - let the app start anyway


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
