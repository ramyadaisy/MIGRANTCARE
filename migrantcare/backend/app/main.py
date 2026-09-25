from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
from app.api import auth, worker, doctor, consent, records, facilities, analytics, ai_assistant

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Seed realistic demo data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="A Portable Digital Health Passport for Migrant Workers — REST API Gateway",
    lifespan=lifespan
)

# Configure CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(worker.router, prefix=settings.API_V1_STR)
app.include_router(doctor.router, prefix=settings.API_V1_STR)
app.include_router(consent.router, prefix=settings.API_V1_STR)
app.include_router(records.router, prefix=settings.API_V1_STR)
app.include_router(facilities.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(ai_assistant.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "product": "MigrantCare",
        "tagline": "A Portable Digital Health Passport for Migrant Workers",
        "status": "online",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "MigrantCare Healthcare Engine"}
