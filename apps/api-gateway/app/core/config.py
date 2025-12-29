from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "NovaVerse API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    
    # Database - PostgreSQL
    DATABASE_URL: str = "postgresql+asyncpg://novaverse_user:novaverse_secure_pwd_2024@localhost:5432/novaverse"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # Stripe Payment Integration
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # Stripe Price IDs for subscription plans
    STRIPE_PRICE_EXPLORER_MONTHLY: str = "price_explorer_monthly"
    STRIPE_PRICE_EXPLORER_YEARLY: str = "price_explorer_yearly"
    STRIPE_PRICE_VOYAGER_MONTHLY: str = "price_voyager_monthly"
    STRIPE_PRICE_VOYAGER_YEARLY: str = "price_voyager_yearly"
    STRIPE_PRICE_ENTERPRISE_MONTHLY: str = "price_enterprise_monthly"
    STRIPE_PRICE_ENTERPRISE_YEARLY: str = "price_enterprise_yearly"
    
    # Frontend URL for redirects
    FRONTEND_URL: str = "http://localhost:5173"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000", 
        "http://localhost:5173", 
        "https://5173-iwpqsmhpv3qjebkhn44ig-a6c76780.us2.manus.computer"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
