"""Production configuration and security settings."""
import os
from typing import List, Optional
from pydantic_settings import BaseSettings


class ProductionSettings(BaseSettings):
    """Production-specific settings."""
    
    # Application
    APP_NAME: str = "AI CEO Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # CORS - Restrict in production
    CORS_ORIGINS: List[str] = [
        "https://yourdomain.com",
        "https://app.yourdomain.com",
    ]
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://user:password@localhost:5432/aiceo"
    )
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    
    # Redis (for caching and rate limiting)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Rate Limiting
    RATE_LIMIT_AUTHENTICATED: int = 100  # requests per minute
    RATE_LIMIT_UNAUTHENTICATED: int = 20
    RATE_LIMIT_LOGIN: int = 5
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Email (for notifications)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    
    # External APIs
    DEEPSEEK_API_KEY: Optional[str] = os.getenv("DEEPSEEK_API_KEY")
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    # File Storage
    S3_BUCKET: Optional[str] = os.getenv("S3_BUCKET")
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    
    # Monitoring
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Security headers for production
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
}


# Production checklist
PRODUCTION_CHECKLIST = """
Production Deployment Checklist:

1. Environment Variables:
   [ ] SECRET_KEY - Generate a strong random key
   [ ] DATABASE_URL - Production database connection
   [ ] REDIS_URL - Redis for caching/rate limiting
   [ ] STRIPE_SECRET_KEY - Stripe API key
   [ ] STRIPE_WEBHOOK_SECRET - Stripe webhook secret
   [ ] DEEPSEEK_API_KEY - AI API key
   [ ] SENTRY_DSN - Error monitoring

2. Security:
   [ ] HTTPS enabled with valid SSL certificate
   [ ] CORS origins restricted to production domains
   [ ] Rate limiting configured
   [ ] Security headers enabled
   [ ] Debug mode disabled

3. Database:
   [ ] Connection pooling configured
   [ ] Migrations applied
   [ ] Backups scheduled
   [ ] Read replicas for scaling (optional)

4. Monitoring:
   [ ] Error tracking (Sentry)
   [ ] Application metrics
   [ ] Log aggregation
   [ ] Uptime monitoring

5. Performance:
   [ ] CDN for static assets
   [ ] Database indexes optimized
   [ ] Caching strategy implemented
   [ ] Load balancer configured

6. Compliance:
   [ ] Privacy policy
   [ ] Terms of service
   [ ] GDPR compliance (if applicable)
   [ ] Data encryption at rest
"""


def get_production_settings() -> ProductionSettings:
    """Get production settings instance."""
    return ProductionSettings()


def print_production_checklist():
    """Print the production checklist."""
    print(PRODUCTION_CHECKLIST)
