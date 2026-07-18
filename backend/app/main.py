from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import time
import os
import logging
from collections import defaultdict
from app.api import endpoints
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

# In-memory rate limiting store: { ip: [timestamps] }
rate_limit_store = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 60  # limit to 60 requests per minute

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    # Only rate limit AI and upload endpoints
    path = request.url.path
    if any(p in path for p in ["/companion", "/copilot", "/recommendations", "/upload"]):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean old timestamps
        rate_limit_store[client_ip] = [t for t in rate_limit_store[client_ip] if now - t < RATE_LIMIT_WINDOW]
        
        if len(rate_limit_store[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
            logger.warning(f"Rate limit exceeded for IP: {client_ip} on path {path}")
            return JSONResponse(
                status_code=429,
                content={"error": "Too Many Requests", "detail": "Rate limit exceeded. Please try again in a minute."}
            )
        
        rate_limit_store[client_ip].append(now)
        
    return await call_next(request)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'; sandbox"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
    return response

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
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "x-api-key"],
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
