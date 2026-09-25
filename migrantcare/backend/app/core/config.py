import os

class Settings:
    PROJECT_NAME: str = "MigrantCare API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "migrantcare-super-secret-production-grade-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for smooth hackathon demo
    
    # SQLite default with smooth swappability to PostgreSQL via env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./migrantcare.db")
    
    # Upload storage directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
