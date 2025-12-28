"""
Subscription API Endpoints for AI CEO Platform
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import os

from app.db.session import get_db
from app.core.security import get_current_user
from app.services.stripe_service import (
    StripeService, 
    SUBSCRIPTION_PLANS,
    handle_checkout_completed,
    handle_subscription_updated,
    handle_subscription_deleted,
    handle_invoice_payment_failed
)
from app.schemas.subscription import (
    PlansResponse,
    CreateCheckoutRequest,
    CheckoutResponse,
    PortalRequest,
    PortalResponse,
    SubscriptionInfo,
    SubscriptionUsage,
    UpdateSubscriptionRequest,
    CancelSubscriptionRequest,
    PaymentHistoryResponse,
    SubscriptionTier,
    BillingInterval
)

router = APIRouter()


@router.get("/plans", response_model=Dict[str, Any])
async def get_subscription_plans():
    """Get all available subscription plans"""
    return {
        "plans": SUBSCRIPTION_PLANS,
        "currency": "usd",
        "trial_days": 14
    }


@router.get("/current", response_model=SubscriptionInfo)
async def get_current_subscription(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current organization's subscription"""
    org_id = current_user.get("organization_id")
    
    # For demo, return a mock subscription
    # In production, fetch from database
    return SubscriptionInfo(
        id="sub_demo",
        tier=SubscriptionTier.FREE,
        status="active",
        billing_interval=BillingInterval.MONTHLY,
        current_period_start=None,
        current_period_end=None,
        trial_end=None,
        cancel_at_period_end=False,
        max_users=1,
        max_data_sources=5,
        max_scenarios=3,
        max_competitors=5,
        max_ai_queries=50
    )


@router.get("/usage", response_model=SubscriptionUsage)
async def get_subscription_usage(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current usage against subscription limits"""
    org_id = current_user.get("organization_id")
    
    # For demo, return mock usage
    # In production, calculate from database
    return SubscriptionUsage(
        users=1,
        data_sources=2,
        scenarios=1,
        competitors=3,
        ai_queries_this_month=15,
        max_users=1,
        max_data_sources=5,
        max_scenarios=3,
        max_competitors=5,
        max_ai_queries=50
    )


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CreateCheckoutRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe Checkout session for subscription"""
    org_id = current_user.get("organization_id")
    user_email = current_user.get("email")
    
    stripe_service = StripeService(db)
    
    # Get plan details
    plan = SUBSCRIPTION_PLANS.get(request.plan.value)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    if request.plan == SubscriptionTier.FREE:
        raise HTTPException(status_code=400, detail="Cannot checkout for free plan")
    
    # Get price ID based on billing interval
    price_key = f"stripe_price_{request.billing_interval.value}"
    price_id = plan.get(price_key)
    
    if not price_id:
        # For demo, return a mock checkout URL
        return CheckoutResponse(
            session_id="cs_demo_session",
            checkout_url=f"/pricing?plan={request.plan.value}&interval={request.billing_interval.value}&demo=true"
        )
    
    # Create or get Stripe customer
    # In production, store customer ID in database
    customer_id = await stripe_service.create_customer(
        email=user_email,
        name=current_user.get("full_name", ""),
        organization_id=str(org_id)
    )
    
    if not customer_id:
        raise HTTPException(status_code=500, detail="Failed to create customer")
    
    # Create checkout session
    base_url = request.success_url or os.getenv("FRONTEND_URL", "http://localhost:5173")
    session = await stripe_service.create_checkout_session(
        customer_id=customer_id,
        price_id=price_id,
        success_url=f"{base_url}/settings?checkout=success",
        cancel_url=f"{base_url}/pricing?checkout=canceled"
    )
    
    if not session:
        raise HTTPException(status_code=500, detail="Failed to create checkout session")
    
    return CheckoutResponse(
        session_id=session["session_id"],
        checkout_url=session["url"]
    )


@router.post("/portal", response_model=PortalResponse)
async def create_portal_session(
    request: PortalRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe Customer Portal session"""
    org_id = current_user.get("organization_id")
    
    # For demo, return a mock portal URL
    # In production, get customer ID from database and create real portal session
    return PortalResponse(
        portal_url="/settings?portal=demo"
    )


@router.post("/update")
async def update_subscription(
    request: UpdateSubscriptionRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update subscription to a different plan"""
    org_id = current_user.get("organization_id")
    
    # For demo, return success
    # In production, update via Stripe API
    return {
        "success": True,
        "message": f"Subscription updated to {request.plan.value} ({request.billing_interval.value})"
    }


@router.post("/cancel")
async def cancel_subscription(
    request: CancelSubscriptionRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel subscription"""
    org_id = current_user.get("organization_id")
    
    # For demo, return success
    # In production, cancel via Stripe API
    return {
        "success": True,
        "message": "Subscription will be canceled at the end of the billing period" if request.cancel_at_period_end else "Subscription canceled immediately"
    }


@router.get("/history", response_model=PaymentHistoryResponse)
async def get_payment_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment history for the organization"""
    org_id = current_user.get("organization_id")
    
    # For demo, return empty history
    # In production, fetch from database
    return PaymentHistoryResponse(
        payments=[],
        total_count=0
    )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events"""
    payload = await request.body()
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    if not webhook_secret:
        # For demo, just acknowledge
        return {"received": True}
    
    event = StripeService.construct_webhook_event(
        payload, stripe_signature, webhook_secret
    )
    
    if not event:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    
    # Handle different event types
    event_type = event.type
    event_data = event.data.object
    
    if event_type == "checkout.session.completed":
        await handle_checkout_completed(event_data, db)
    elif event_type == "customer.subscription.updated":
        await handle_subscription_updated(event_data, db)
    elif event_type == "customer.subscription.deleted":
        await handle_subscription_deleted(event_data, db)
    elif event_type == "invoice.payment_failed":
        await handle_invoice_payment_failed(event_data, db)
    
    return {"received": True}
