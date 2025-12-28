"""Input sanitization utilities for security."""
import re
import html
from typing import Any, Dict, List, Union


def sanitize_html(text: str) -> str:
    """
    Sanitize HTML content to prevent XSS attacks.
    
    Escapes HTML special characters and removes script tags.
    """
    if not text:
        return text
    
    # First, remove any script tags and their content
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove event handlers
    text = re.sub(r'\s*on\w+\s*=\s*["\'][^"\']*["\']', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*on\w+\s*=\s*\S+', '', text, flags=re.IGNORECASE)
    
    # Escape HTML entities
    text = html.escape(text)
    
    return text


def sanitize_input(value: Any) -> Any:
    """
    Recursively sanitize input values.
    
    Handles strings, lists, and dictionaries.
    """
    if isinstance(value, str):
        return sanitize_html(value)
    elif isinstance(value, list):
        return [sanitize_input(item) for item in value]
    elif isinstance(value, dict):
        return {key: sanitize_input(val) for key, val in value.items()}
    return value


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password_strength(password: str) -> Dict[str, Any]:
    """
    Validate password strength.
    
    Returns a dict with validation result and feedback.
    """
    issues = []
    
    if len(password) < 8:
        issues.append("Password must be at least 8 characters long")
    
    if not re.search(r'[A-Z]', password):
        issues.append("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        issues.append("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        issues.append("Password must contain at least one digit")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        issues.append("Password must contain at least one special character")
    
    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "strength": "strong" if len(issues) == 0 else "weak" if len(issues) > 2 else "medium"
    }


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks.
    """
    # Remove path separators
    filename = filename.replace('/', '').replace('\\', '')
    
    # Remove null bytes
    filename = filename.replace('\x00', '')
    
    # Remove leading/trailing dots and spaces
    filename = filename.strip('. ')
    
    # Replace multiple dots with single dot
    filename = re.sub(r'\.+', '.', filename)
    
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:255-len(ext)-1] + '.' + ext if ext else name[:255]
    
    return filename


def strip_dangerous_tags(html_content: str) -> str:
    """
    Remove dangerous HTML tags while preserving safe formatting.
    
    Allows: p, br, b, i, u, strong, em, ul, ol, li, a (with sanitized href)
    """
    # List of allowed tags
    allowed_tags = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'span', 'div']
    
    # Remove script, style, iframe, object, embed tags completely
    dangerous_tags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button']
    for tag in dangerous_tags:
        html_content = re.sub(f'<{tag}[^>]*>.*?</{tag}>', '', html_content, flags=re.IGNORECASE | re.DOTALL)
        html_content = re.sub(f'<{tag}[^>]*/>', '', html_content, flags=re.IGNORECASE)
    
    # Remove event handlers from remaining tags
    html_content = re.sub(r'\s*on\w+\s*=\s*["\'][^"\']*["\']', '', html_content, flags=re.IGNORECASE)
    
    # Sanitize href attributes (only allow http, https, mailto)
    def sanitize_href(match):
        href = match.group(1)
        if href.startswith(('http://', 'https://', 'mailto:')):
            return f'href="{html.escape(href)}"'
        return 'href="#"'
    
    html_content = re.sub(r'href\s*=\s*["\']([^"\']*)["\']', sanitize_href, html_content, flags=re.IGNORECASE)
    
    return html_content
