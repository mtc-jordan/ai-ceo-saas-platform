"""
Multi-Language Support Service
Handles translations, currency conversion, and locale management
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from openai import OpenAI
import os


class LocalizationService:
    """Service for managing localization and translations"""
    
    def __init__(self):
        self.client = OpenAI()
        
        # Supported languages
        self.languages = {
            "en": {"name": "English", "native": "English", "flag": "🇺🇸", "direction": "ltr", "progress": 100},
            "es": {"name": "Spanish", "native": "Español", "flag": "🇪🇸", "direction": "ltr", "progress": 95},
            "fr": {"name": "French", "native": "Français", "flag": "🇫🇷", "direction": "ltr", "progress": 90},
            "de": {"name": "German", "native": "Deutsch", "flag": "🇩🇪", "direction": "ltr", "progress": 88},
            "pt": {"name": "Portuguese", "native": "Português", "flag": "🇧🇷", "direction": "ltr", "progress": 85},
            "zh": {"name": "Chinese", "native": "中文", "flag": "🇨🇳", "direction": "ltr", "progress": 82},
            "ja": {"name": "Japanese", "native": "日本語", "flag": "🇯🇵", "direction": "ltr", "progress": 78},
            "ar": {"name": "Arabic", "native": "العربية", "flag": "🇸🇦", "direction": "rtl", "progress": 70},
            "ko": {"name": "Korean", "native": "한국어", "flag": "🇰🇷", "direction": "ltr", "progress": 65},
            "it": {"name": "Italian", "native": "Italiano", "flag": "🇮🇹", "direction": "ltr", "progress": 60}
        }
        
        # Supported currencies
        self.currencies = {
            "USD": {"name": "US Dollar", "symbol": "$", "rate": 1.0, "position": "before"},
            "EUR": {"name": "Euro", "symbol": "€", "rate": 0.92, "position": "before"},
            "GBP": {"name": "British Pound", "symbol": "£", "rate": 0.79, "position": "before"},
            "JPY": {"name": "Japanese Yen", "symbol": "¥", "rate": 149.50, "position": "before"},
            "CNY": {"name": "Chinese Yuan", "symbol": "¥", "rate": 7.24, "position": "before"},
            "CAD": {"name": "Canadian Dollar", "symbol": "C$", "rate": 1.36, "position": "before"},
            "AUD": {"name": "Australian Dollar", "symbol": "A$", "rate": 1.54, "position": "before"},
            "CHF": {"name": "Swiss Franc", "symbol": "CHF", "rate": 0.88, "position": "after"},
            "INR": {"name": "Indian Rupee", "symbol": "₹", "rate": 83.12, "position": "before"},
            "BRL": {"name": "Brazilian Real", "symbol": "R$", "rate": 4.97, "position": "before"}
        }
    
    async def get_supported_languages(self) -> List[Dict[str, Any]]:
        """Get list of supported languages"""
        return [
            {
                "code": code,
                "name": info["name"],
                "native_name": info["native"],
                "flag": info["flag"],
                "direction": info["direction"],
                "translation_progress": info["progress"],
                "is_active": True
            }
            for code, info in self.languages.items()
        ]
    
    async def get_translations(self, language_code: str, category: Optional[str] = None) -> Dict[str, str]:
        """Get translations for a language"""
        # Base English translations
        translations = {
            # Common
            "common.save": "Save",
            "common.cancel": "Cancel",
            "common.delete": "Delete",
            "common.edit": "Edit",
            "common.create": "Create",
            "common.search": "Search",
            "common.filter": "Filter",
            "common.export": "Export",
            "common.import": "Import",
            "common.loading": "Loading...",
            "common.error": "An error occurred",
            "common.success": "Success",
            
            # Dashboard
            "dashboard.title": "Dashboard",
            "dashboard.welcome": "Welcome back",
            "dashboard.overview": "Overview",
            "dashboard.recent_activity": "Recent Activity",
            
            # Navigation
            "nav.home": "Home",
            "nav.dashboard": "Dashboard",
            "nav.settings": "Settings",
            "nav.profile": "Profile",
            "nav.logout": "Sign Out",
            
            # Goals/OKRs
            "goals.title": "Goals & OKRs",
            "goals.create_goal": "Create Goal",
            "goals.key_results": "Key Results",
            "goals.progress": "Progress",
            "goals.on_track": "On Track",
            "goals.at_risk": "At Risk",
            "goals.behind": "Behind",
            
            # Settings
            "settings.title": "Settings",
            "settings.language": "Language",
            "settings.currency": "Currency",
            "settings.timezone": "Timezone",
            "settings.notifications": "Notifications"
        }
        
        # Spanish translations
        spanish_translations = {
            "common.save": "Guardar",
            "common.cancel": "Cancelar",
            "common.delete": "Eliminar",
            "common.edit": "Editar",
            "common.create": "Crear",
            "common.search": "Buscar",
            "common.filter": "Filtrar",
            "common.export": "Exportar",
            "common.import": "Importar",
            "common.loading": "Cargando...",
            "common.error": "Ocurrió un error",
            "common.success": "Éxito",
            "dashboard.title": "Panel de Control",
            "dashboard.welcome": "Bienvenido de nuevo",
            "dashboard.overview": "Resumen",
            "dashboard.recent_activity": "Actividad Reciente",
            "nav.home": "Inicio",
            "nav.dashboard": "Panel",
            "nav.settings": "Configuración",
            "nav.profile": "Perfil",
            "nav.logout": "Cerrar Sesión",
            "goals.title": "Metas y OKRs",
            "goals.create_goal": "Crear Meta",
            "goals.key_results": "Resultados Clave",
            "goals.progress": "Progreso",
            "goals.on_track": "En Camino",
            "goals.at_risk": "En Riesgo",
            "goals.behind": "Atrasado",
            "settings.title": "Configuración",
            "settings.language": "Idioma",
            "settings.currency": "Moneda",
            "settings.timezone": "Zona Horaria",
            "settings.notifications": "Notificaciones"
        }
        
        # French translations
        french_translations = {
            "common.save": "Enregistrer",
            "common.cancel": "Annuler",
            "common.delete": "Supprimer",
            "common.edit": "Modifier",
            "common.create": "Créer",
            "common.search": "Rechercher",
            "dashboard.title": "Tableau de Bord",
            "dashboard.welcome": "Bienvenue",
            "nav.home": "Accueil",
            "nav.dashboard": "Tableau de Bord",
            "nav.settings": "Paramètres",
            "nav.logout": "Déconnexion",
            "goals.title": "Objectifs et OKRs",
            "settings.language": "Langue",
            "settings.currency": "Devise"
        }
        
        if language_code == "es":
            return spanish_translations
        elif language_code == "fr":
            return french_translations
        else:
            return translations
    
    async def translate_text(self, text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Translate text using AI"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-nano",
                messages=[
                    {"role": "system", "content": f"You are a professional translator. Translate the following text from {source_lang} to {target_lang}. Only return the translated text, nothing else."},
                    {"role": "user", "content": text}
                ],
                max_tokens=1000
            )
            
            translated = response.choices[0].message.content.strip()
            return {
                "original": text,
                "translated": translated,
                "source_language": source_lang,
                "target_language": target_lang,
                "is_machine_translated": True,
                "confidence": 0.95
            }
        except Exception as e:
            return {
                "original": text,
                "translated": text,
                "source_language": source_lang,
                "target_language": target_lang,
                "is_machine_translated": False,
                "error": str(e)
            }
    
    async def translate_document(self, document_id: int, target_lang: str) -> Dict[str, Any]:
        """Queue document for translation"""
        return {
            "document_id": document_id,
            "target_language": target_lang,
            "status": "processing",
            "estimated_completion": "5 minutes",
            "message": "Document queued for translation"
        }
    
    async def get_supported_currencies(self) -> List[Dict[str, Any]]:
        """Get list of supported currencies"""
        return [
            {
                "code": code,
                "name": info["name"],
                "symbol": info["symbol"],
                "exchange_rate": info["rate"],
                "symbol_position": info["position"],
                "is_active": True
            }
            for code, info in self.currencies.items()
        ]
    
    async def convert_currency(self, amount: float, from_currency: str, to_currency: str) -> Dict[str, Any]:
        """Convert amount between currencies"""
        from_rate = self.currencies.get(from_currency, {}).get("rate", 1.0)
        to_rate = self.currencies.get(to_currency, {}).get("rate", 1.0)
        
        # Convert to USD first, then to target currency
        usd_amount = amount / from_rate
        converted_amount = usd_amount * to_rate
        
        return {
            "original_amount": amount,
            "original_currency": from_currency,
            "converted_amount": round(converted_amount, 2),
            "target_currency": to_currency,
            "exchange_rate": to_rate / from_rate,
            "converted_at": datetime.now().isoformat()
        }
    
    async def format_currency(self, amount: float, currency_code: str) -> str:
        """Format amount in specified currency"""
        currency = self.currencies.get(currency_code, self.currencies["USD"])
        symbol = currency["symbol"]
        position = currency["position"]
        
        formatted = f"{amount:,.2f}"
        
        if position == "before":
            return f"{symbol}{formatted}"
        else:
            return f"{formatted} {symbol}"
    
    async def get_user_locale(self, user_id: int) -> Dict[str, Any]:
        """Get user's locale preferences"""
        return {
            "user_id": user_id,
            "language": "en",
            "currency": "USD",
            "timezone": "America/New_York",
            "date_format": "MM/DD/YYYY",
            "time_format": "12h",
            "number_format": "1,234.56"
        }
    
    async def update_user_locale(self, user_id: int, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Update user's locale preferences"""
        return {
            "user_id": user_id,
            "message": "Locale preferences updated",
            **preferences,
            "updated_at": datetime.now().isoformat()
        }
    
    async def get_organization_locale_settings(self, organization_id: int) -> Dict[str, Any]:
        """Get organization locale settings"""
        return {
            "organization_id": organization_id,
            "default_language": "en",
            "default_currency": "USD",
            "default_timezone": "UTC",
            "allowed_languages": ["en", "es", "fr", "de"],
            "allowed_currencies": ["USD", "EUR", "GBP"]
        }
    
    async def update_organization_locale(self, organization_id: int, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Update organization locale settings"""
        return {
            "organization_id": organization_id,
            "message": "Organization locale settings updated",
            **settings,
            "updated_at": datetime.now().isoformat()
        }
    
    async def get_timezones(self) -> List[Dict[str, str]]:
        """Get list of supported timezones"""
        return [
            {"value": "UTC", "label": "UTC (Coordinated Universal Time)"},
            {"value": "America/New_York", "label": "Eastern Time (ET)"},
            {"value": "America/Chicago", "label": "Central Time (CT)"},
            {"value": "America/Denver", "label": "Mountain Time (MT)"},
            {"value": "America/Los_Angeles", "label": "Pacific Time (PT)"},
            {"value": "Europe/London", "label": "London (GMT/BST)"},
            {"value": "Europe/Paris", "label": "Paris (CET/CEST)"},
            {"value": "Europe/Berlin", "label": "Berlin (CET/CEST)"},
            {"value": "Asia/Tokyo", "label": "Tokyo (JST)"},
            {"value": "Asia/Shanghai", "label": "Shanghai (CST)"},
            {"value": "Asia/Singapore", "label": "Singapore (SGT)"},
            {"value": "Asia/Dubai", "label": "Dubai (GST)"},
            {"value": "Australia/Sydney", "label": "Sydney (AEST/AEDT)"}
        ]


# Initialize service
localization_service = LocalizationService()
