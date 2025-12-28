"""
Multi-Language Support Database Models
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Language(Base):
    """Supported languages"""
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, index=True)
    
    # Language details
    code = Column(String(10), unique=True, nullable=False)  # e.g., "en", "es", "fr", "zh"
    name = Column(String(100), nullable=False)  # e.g., "English", "Spanish"
    native_name = Column(String(100), nullable=False)  # e.g., "English", "Español"
    
    # Display settings
    direction = Column(String(3), default="ltr")  # ltr or rtl
    flag_emoji = Column(String(10), nullable=True)  # 🇺🇸, 🇪🇸, etc.
    
    # Status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    translation_progress = Column(Integer, default=0)  # Percentage complete
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class TranslationKey(Base):
    """Translation keys for interface strings"""
    __tablename__ = "translation_keys"

    id = Column(Integer, primary_key=True, index=True)
    
    # Key identification
    key = Column(String(255), unique=True, nullable=False)  # e.g., "dashboard.title"
    category = Column(String(100), nullable=False)  # e.g., "dashboard", "settings", "common"
    
    # Default value (English)
    default_value = Column(Text, nullable=False)
    
    # Context for translators
    description = Column(Text, nullable=True)
    max_length = Column(Integer, nullable=True)  # Character limit
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    translations = relationship("Translation", back_populates="key", cascade="all, delete-orphan")


class Translation(Base):
    """Translations for each key in each language"""
    __tablename__ = "translations"

    id = Column(Integer, primary_key=True, index=True)
    key_id = Column(Integer, ForeignKey("translation_keys.id"), nullable=False)
    language_code = Column(String(10), ForeignKey("languages.code"), nullable=False)
    
    # Translation
    value = Column(Text, nullable=False)
    
    # Status
    is_approved = Column(Boolean, default=False)
    is_machine_translated = Column(Boolean, default=False)
    
    # Metadata
    translated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    key = relationship("TranslationKey", back_populates="translations")


class Currency(Base):
    """Supported currencies"""
    __tablename__ = "currencies"

    id = Column(Integer, primary_key=True, index=True)
    
    # Currency details
    code = Column(String(3), unique=True, nullable=False)  # ISO 4217 code: USD, EUR, GBP
    name = Column(String(100), nullable=False)
    symbol = Column(String(10), nullable=False)  # $, €, £
    
    # Formatting
    decimal_places = Column(Integer, default=2)
    decimal_separator = Column(String(1), default=".")
    thousands_separator = Column(String(1), default=",")
    symbol_position = Column(String(10), default="before")  # before or after
    
    # Exchange rate (relative to USD)
    exchange_rate = Column(Float, default=1.0)
    exchange_rate_updated_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class UserLocalePreference(Base):
    """User locale preferences"""
    __tablename__ = "user_locale_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Preferences
    language_code = Column(String(10), ForeignKey("languages.code"), default="en")
    currency_code = Column(String(3), ForeignKey("currencies.code"), default="USD")
    timezone = Column(String(50), default="UTC")
    date_format = Column(String(20), default="MM/DD/YYYY")
    time_format = Column(String(10), default="12h")  # 12h or 24h
    number_format = Column(String(20), default="1,234.56")
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class OrganizationLocaleSettings(Base):
    """Organization-level locale settings"""
    __tablename__ = "organization_locale_settings"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), unique=True, nullable=False)
    
    # Default settings for organization
    default_language = Column(String(10), ForeignKey("languages.code"), default="en")
    default_currency = Column(String(3), ForeignKey("currencies.code"), default="USD")
    default_timezone = Column(String(50), default="UTC")
    
    # Allowed languages for this organization
    allowed_languages = Column(JSON, default=["en"])
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class DocumentTranslation(Base):
    """Translations for user documents"""
    __tablename__ = "document_translations"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    
    # Source and target
    source_language = Column(String(10), nullable=False)
    target_language = Column(String(10), nullable=False)
    
    # Translation
    translated_content = Column(Text, nullable=True)
    translated_file_path = Column(String(500), nullable=True)
    
    # Status
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    
    # Metadata
    is_machine_translated = Column(Boolean, default=True)
    confidence_score = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
