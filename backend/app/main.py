from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import time
import os
import logging
from app.api import endpoints
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

@app.on_event("startup")
async def startup_event():
    if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
        logger.error("STARTUP ERROR: GEMINI_API_KEY is not configured in the environment. AI features will fail.")
    else:
        logger.info("Startup Check: GEMINI_API_KEY is present.")
start_time = time.time()

# Set up CORS dynamically
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("VITE_API_URL", ""),
]
origins = [origin for origin in origins if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix=settings.API_V1_STR)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": "An unexpected error occurred. Please try again later."},
    )

@app.get("/api/health")
def health_check():
    gemini_status = "ok" if settings.GEMINI_API_KEY else "missing"
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": time.time(),
        "uptime": time.time() - start_time,
        "environment": os.getenv("ENVIRONMENT", "production"),
        "gemini_status": gemini_status
    }

@app.get("/")
def root():
    return {"message": "Welcome to ArenaMind AI API"}
