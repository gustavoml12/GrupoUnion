from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1 import auth, members, onboarding, upload, onboarding_videos, quiz, meetings, notifications, profile, visits, collective_meetings
import os

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="API do Ecosistema Union - Networking empresarial qualificado",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(members.router, prefix="/api/v1")
app.include_router(onboarding.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")
app.include_router(onboarding_videos.router, prefix="/api/v1")
app.include_router(quiz.router, prefix="/api/v1")
app.include_router(meetings.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(visits.router, prefix="/api/v1")
app.include_router(collective_meetings.router, prefix="/api/v1")

# Health check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
    }

# Root endpoint
@app.get("/", tags=["Root"])
def root():
    """Root endpoint"""
    return {
        "message": "Bem-vindo ao Ecosistema Union API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0",
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    print(f"🚀 {settings.APP_NAME} started!")
    print(f"📝 Environment: {settings.ENVIRONMENT}")
    print(f"📚 Docs: http://localhost:8000/docs")
    print(f"🔐 Auth endpoints: /api/v1/auth/*")
    print(f"👥 Members endpoints: /api/v1/members/*")
    print(f"💰 Onboarding endpoints: /api/v1/onboarding/*")
    print(f"📤 Upload endpoints: /api/v1/upload/*")
    print(f"🎥 Onboarding Videos endpoints: /api/v1/onboarding-videos/*")
    print(f"📁 Uploads directory: {UPLOAD_DIR}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    print(f"👋 {settings.APP_NAME} shutting down...")
