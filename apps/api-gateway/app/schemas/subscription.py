"""
Subscription Schemas for AI CEO Platform
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class SubscriptionTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class BillingInterval(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"


# Plan schemas
class PlanFeatures(BaseModel):
    users: int
    data_sources: int
    scenarios: int
    competitors: int
    ai_queries: int


class PlanInfo(BaseModel):
    name: str
    price_monthly: float
    price_yearly: float
    features: List[str]
    limits: PlanFeatures


class PlansResponse(BaseModel):
    plans: Dict[str, PlanInfo]


# Checkout schemas
class CreateCheckoutRequest(BaseModel):
    plan: SubscriptionTier
    billing_interval: BillingInterval = BillingInterval.MONTHLY
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CheckoutResponse(BaseModel):
    session_id: str
    checkout_url: str


# Portal schemas
class PortalRequest(BaseModel):
    return_url: Optional[str] = None


class PortalResponse(BaseModel):
    portal_url: str


# Subscription schemas
class SubscriptionInfo(BaseModel):
    id: str
    tier: SubscriptionTier
    status: str
    billing_interval: BillingInterval
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    trial_end: Optional[datetime]
    cancel_at_period_end: bool = False
    
    # Limits
    max_users: int
    max_data_sources: int
    max_scenarios: int
    max_competitors: int
    max_ai_queries: int


class SubscriptionUsage(BaseModel):
    users: int
    data_sources: int
    scenarios: int
    competitors: int
    ai_queries_this_month: int
    
    # Limits
    max_users: int
    max_data_sources: int
    max_scenarios: int
    max_competitors: int
    max_ai_queries: int


class UpdateSubscriptionRequest(BaseModel):
    plan: SubscriptionTier
    billing_interval: BillingInterval = BillingInterval.MONTHLY


class CancelSubscriptionRequest(BaseModel):
    cancel_at_period_end: bool = True
    reason: Optional[str] = None


# Payment history schemas
class PaymentRecord(BaseModel):
    id: str
    amount: float
    currency: str
    status: str
    description: Optional[str]
    invoice_url: Optional[str]
    created_at: datetime


class PaymentHistoryResponse(BaseModel):
    payments: List[PaymentRecord]
    total_count: int


# Webhook schemas
class WebhookEvent(BaseModel):
    type: str
    data: Dict[str, Any]
