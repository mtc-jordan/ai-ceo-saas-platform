"""
White-Label Support Database Models
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class OrganizationBranding(Base):
    """Custom branding settings for each organization"""
    __tablename__ = "organization_branding"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), unique=True, nullable=False)
    
    # Brand Identity
    company_name = Column(String(255), nullable=True)
    logo_url = Column(String(500), nullable=True)
    logo_dark_url = Column(String(500), nullable=True)  # For dark mode
    favicon_url = Column(String(500), nullable=True)
    
    # Colors
    primary_color = Column(String(7), default="#6366F1")  # Hex color
    secondary_color = Column(String(7), default="#8B5CF6")
    accent_color = Column(String(7), default="#F59E0B")
    background_color = Column(String(7), default="#FFFFFF")
    text_color = Column(String(7), default="#1F2937")
    
    # Typography
    font_family = Column(String(100), default="Inter")
    heading_font = Column(String(100), nullable=True)
    
    # Custom CSS
    custom_css = Column(Text, nullable=True)
    
    # Login page customization
    login_background_url = Column(String(500), nullable=True)
    login_welcome_text = Column(String(255), nullable=True)
    
    # Footer
    footer_text = Column(String(500), nullable=True)
    show_powered_by = Column(Boolean, default=True)
    
    # Email branding
    email_logo_url = Column(String(500), nullable=True)
    email_footer_text = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class CustomDomain(Base):
    """Custom domain configuration for organizations"""
    __tablename__ = "custom_domains"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Domain settings
    domain = Column(String(255), unique=True, nullable=False)
    subdomain = Column(String(100), nullable=True)  # For subdomain-based white-label
    
    # SSL/TLS
    ssl_enabled = Column(Boolean, default=False)
    ssl_certificate = Column(Text, nullable=True)
    ssl_private_key = Column(Text, nullable=True)
    ssl_expiry = Column(DateTime, nullable=True)
    
    # DNS verification
    dns_verified = Column(Boolean, default=False)
    dns_verification_token = Column(String(100), nullable=True)
    dns_verified_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=False)
    is_primary = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ResellerPartner(Base):
    """Reseller/Partner program configuration"""
    __tablename__ = "reseller_partners"

    id = Column(Integer, primary_key=True, index=True)
    
    # Partner details
    partner_name = Column(String(255), nullable=False)
    partner_code = Column(String(50), unique=True, nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=True)
    
    # Partner type
    partner_type = Column(String(50), default="reseller")  # reseller, affiliate, agency
    tier = Column(String(50), default="silver")  # bronze, silver, gold, platinum
    
    # Commission settings
    commission_rate = Column(Integer, default=20)  # Percentage
    commission_type = Column(String(50), default="recurring")  # one_time, recurring
    
    # Limits
    max_organizations = Column(Integer, nullable=True)
    max_users_per_org = Column(Integer, nullable=True)
    
    # Branding
    can_white_label = Column(Boolean, default=False)
    can_custom_domain = Column(Boolean, default=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PartnerOrganization(Base):
    """Link between partners and their client organizations"""
    __tablename__ = "partner_organizations"

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("reseller_partners.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Relationship details
    referral_code = Column(String(50), nullable=True)
    commission_override = Column(Integer, nullable=True)  # Override partner's default rate
    
    # Billing
    billing_type = Column(String(50), default="direct")  # direct, partner_billed
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())


class PartnerCommission(Base):
    """Track partner commissions"""
    __tablename__ = "partner_commissions"

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("reseller_partners.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Commission details
    amount = Column(Integer, nullable=False)  # In cents
    currency = Column(String(3), default="USD")
    commission_rate = Column(Integer, nullable=False)
    
    # Source
    source_type = Column(String(50), nullable=False)  # subscription, addon, one_time
    source_id = Column(String(100), nullable=True)  # e.g., Stripe invoice ID
    
    # Status
    status = Column(String(50), default="pending")  # pending, approved, paid, cancelled
    paid_at = Column(DateTime, nullable=True)
    
    # Period
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
