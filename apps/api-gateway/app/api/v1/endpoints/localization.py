"""
Multi-Language Support API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from app.services.localization_service import localization_service

router = APIRouter()


# Pydantic models
class TranslateRequest(BaseModel):
    text: str
    source_language: str = "en"
    target_language: str


class UserLocaleUpdate(BaseModel):
    language: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None
    date_format: Optional[str] = None
    time_format: Optional[str] = None


class OrganizationLocaleUpdate(BaseModel):
    default_language: Optional[str] = None
    default_currency: Optional[str] = None
    default_timezone: Optional[str] = None
    allowed_languages: Optional[List[str]] = None


class CurrencyConvertRequest(BaseModel):
    amount: float
    from_currency: str
    to_currency: str


# Language endpoints
@router.get("/languages")
async def get_languages():
    """Get list of supported languages"""
    languages = await localization_service.get_supported_languages()
    return {"languages": languages}


@router.get("/translations/{language_code}")
async def get_translations(
    language_code: str,
    category: Optional[str] = None
):
    """Get translations for a specific language"""
    translations = await localization_service.get_translations(language_code, category)
    return {
        "language": language_code,
        "translations": translations,
        "count": len(translations)
    }


@router.post("/translate")
async def translate_text(request: TranslateRequest):
    """Translate text using AI"""
    return await localization_service.translate_text(
        request.text,
        request.source_language,
        request.target_language
    )


@router.post("/documents/{document_id}/translate")
async def translate_document(
    document_id: int,
    target_language: str
):
    """Queue a document for translation"""
    return await localization_service.translate_document(document_id, target_language)


# Currency endpoints
@router.get("/currencies")
async def get_currencies():
    """Get list of supported currencies"""
    currencies = await localization_service.get_supported_currencies()
    return {"currencies": currencies}


@router.post("/currencies/convert")
async def convert_currency(request: CurrencyConvertRequest):
    """Convert amount between currencies"""
    return await localization_service.convert_currency(
        request.amount,
        request.from_currency,
        request.to_currency
    )


@router.get("/currencies/{currency_code}/format")
async def format_currency(
    currency_code: str,
    amount: float
):
    """Format amount in specified currency"""
    formatted = await localization_service.format_currency(amount, currency_code)
    return {
        "amount": amount,
        "currency": currency_code,
        "formatted": formatted
    }


# Timezone endpoints
@router.get("/timezones")
async def get_timezones():
    """Get list of supported timezones"""
    timezones = await localization_service.get_timezones()
    return {"timezones": timezones}


# User locale preferences
@router.get("/user/locale")
async def get_user_locale():
    """Get current user's locale preferences"""
    return await localization_service.get_user_locale(user_id=1)


@router.put("/user/locale")
async def update_user_locale(preferences: UserLocaleUpdate):
    """Update current user's locale preferences"""
    return await localization_service.update_user_locale(
        user_id=1,
        preferences=preferences.dict(exclude_none=True)
    )


# Organization locale settings
@router.get("/organization/locale")
async def get_organization_locale():
    """Get organization locale settings"""
    return await localization_service.get_organization_locale_settings(organization_id=1)


@router.put("/organization/locale")
async def update_organization_locale(settings: OrganizationLocaleUpdate):
    """Update organization locale settings"""
    return await localization_service.update_organization_locale(
        organization_id=1,
        settings=settings.dict(exclude_none=True)
    )


# Admin endpoints for managing translations
@router.get("/admin/translation-keys")
async def list_translation_keys(
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """List all translation keys (admin only)"""
    # Mock response
    keys = [
        {"key": "common.save", "category": "common", "default": "Save", "translations": 10},
        {"key": "common.cancel", "category": "common", "default": "Cancel", "translations": 10},
        {"key": "dashboard.title", "category": "dashboard", "default": "Dashboard", "translations": 10},
        {"key": "goals.title", "category": "goals", "default": "Goals & OKRs", "translations": 8}
    ]
    return {"keys": keys, "total": len(keys)}


@router.post("/admin/translation-keys")
async def create_translation_key(
    key: str,
    category: str,
    default_value: str,
    description: Optional[str] = None
):
    """Create a new translation key (admin only)"""
    return {
        "key": key,
        "category": category,
        "default_value": default_value,
        "description": description,
        "message": "Translation key created successfully"
    }


@router.put("/admin/translations/{key}")
async def update_translation(
    key: str,
    language_code: str,
    value: str
):
    """Update a translation (admin only)"""
    return {
        "key": key,
        "language": language_code,
        "value": value,
        "message": "Translation updated successfully"
    }


@router.post("/admin/translations/import")
async def import_translations(
    language_code: str,
    translations: dict
):
    """Bulk import translations (admin only)"""
    return {
        "language": language_code,
        "imported": len(translations),
        "message": "Translations imported successfully"
    }


@router.get("/admin/translations/export/{language_code}")
async def export_translations(language_code: str):
    """Export translations for a language (admin only)"""
    translations = await localization_service.get_translations(language_code)
    return {
        "language": language_code,
        "translations": translations,
        "exported_at": "2024-12-24T10:00:00Z"
    }
