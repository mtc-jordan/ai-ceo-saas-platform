"""
White-Label Support API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Optional
from pydantic import BaseModel
from app.services.white_label_service import white_label_service

router = APIRouter()


# Pydantic models
class BrandingColors(BaseModel):
    primary: str = "#6366F1"
    secondary: str = "#8B5CF6"
    accent: str = "#F59E0B"
    background: str = "#FFFFFF"
    text: str = "#1F2937"


class BrandingUpdate(BaseModel):
    company_name: Optional[str] = None
    colors: Optional[BrandingColors] = None
    font_family: Optional[str] = None
    heading_font: Optional[str] = None
    login_welcome_text: Optional[str] = None
    footer_text: Optional[str] = None
    show_powered_by: Optional[bool] = None
    custom_css: Optional[str] = None


class DomainCreate(BaseModel):
    domain: str


class PartnerCreate(BaseModel):
    partner_name: str
    contact_email: str
    contact_phone: Optional[str] = None
    partner_type: str = "reseller"
    commission_rate: int = 20


# Branding endpoints
@router.get("/branding")
async def get_branding():
    """Get organization branding settings"""
    return await white_label_service.get_organization_branding(organization_id=1)


@router.put("/branding")
async def update_branding(branding: BrandingUpdate):
    """Update organization branding settings"""
    return await white_label_service.update_branding(
        organization_id=1,
        branding_data=branding.dict(exclude_none=True)
    )


@router.post("/branding/logo")
async def upload_logo(
    file_type: str,  # logo, logo_dark, favicon, email_logo
    file: UploadFile = File(...)
):
    """Upload a logo file"""
    contents = await file.read()
    return await white_label_service.upload_logo(
        organization_id=1,
        file_type=file_type,
        file_data=contents
    )


@router.post("/branding/preview")
async def preview_branding(branding: BrandingUpdate):
    """Generate a preview of branding changes"""
    return await white_label_service.preview_branding(branding.dict(exclude_none=True))


# Custom domain endpoints
@router.get("/domains")
async def list_domains():
    """List custom domains for organization"""
    domains = await white_label_service.get_custom_domains(organization_id=1)
    return {"domains": domains}


@router.post("/domains")
async def add_domain(domain_data: DomainCreate):
    """Add a new custom domain"""
    return await white_label_service.add_custom_domain(
        organization_id=1,
        domain=domain_data.domain
    )


@router.post("/domains/{domain_id}/verify")
async def verify_domain(domain_id: int):
    """Verify domain DNS configuration"""
    return await white_label_service.verify_domain(domain_id)


@router.post("/domains/{domain_id}/ssl")
async def provision_ssl(domain_id: int):
    """Provision SSL certificate for domain"""
    return await white_label_service.provision_ssl(domain_id)


@router.delete("/domains/{domain_id}")
async def delete_domain(domain_id: int):
    """Delete a custom domain"""
    return await white_label_service.delete_domain(domain_id)


# Partner/Reseller endpoints
@router.get("/partner/dashboard")
async def get_partner_dashboard():
    """Get partner dashboard (for resellers)"""
    return await white_label_service.get_partner_dashboard(partner_id=1)


@router.post("/partners")
async def create_partner(partner: PartnerCreate):
    """Create a new reseller partner (admin only)"""
    return await white_label_service.create_partner(partner.dict())


@router.get("/partner/referral-link")
async def get_referral_link():
    """Get partner referral link"""
    return await white_label_service.get_partner_referral_link(partner_id=1)


@router.get("/partner/commissions")
async def get_commissions(
    start_date: str = "2024-01-01",
    end_date: str = "2024-12-31"
):
    """Get commission report for partner"""
    return await white_label_service.get_commission_report(
        partner_id=1,
        start_date=start_date,
        end_date=end_date
    )


# Admin endpoints for managing partners
@router.get("/admin/partners")
async def list_partners():
    """List all partners (admin only)"""
    return {
        "partners": [
            {
                "id": 1,
                "name": "TechPartners Inc",
                "code": "TECHP2024",
                "tier": "gold",
                "organizations": 15,
                "mrr_generated": 4500,
                "status": "active"
            },
            {
                "id": 2,
                "name": "Digital Agency Co",
                "code": "DIGI2024",
                "tier": "silver",
                "organizations": 8,
                "mrr_generated": 2100,
                "status": "active"
            }
        ]
    }


@router.put("/admin/partners/{partner_id}")
async def update_partner(partner_id: int, partner: PartnerCreate):
    """Update partner details (admin only)"""
    return {
        "id": partner_id,
        "message": "Partner updated successfully",
        **partner.dict()
    }


@router.post("/admin/partners/{partner_id}/approve")
async def approve_partner(partner_id: int):
    """Approve a partner application (admin only)"""
    return {
        "id": partner_id,
        "status": "approved",
        "message": "Partner approved successfully"
    }
