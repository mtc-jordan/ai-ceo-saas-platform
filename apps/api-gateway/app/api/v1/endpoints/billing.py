"""\nBilling API Endpoints for NovaVerse Platform\nHandles subscription management, payments, and billing operations\nIntegrated with Stripe for payment processing\n"""
from fastapi import APIRouter, HTTPException, Depends, Request, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import stripe
import os

router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_placeholder")

# NovaVerse Plan configuration
PLANS = {
    "explorer": {
        "name": "Explorer",
        "monthly_price": 49,
        "yearly_price": 470,  # 2 months free
        "stripe_monthly_price_id": "price_explorer_monthly",
        "stripe_yearly_price_id": "price_explorer_yearly",
        "features": ["Nova Pulse Dashboard", "Basic AI Insights", "5 Team Members", "Email Support", "1 Data Source"],
        "limits": {"users": 5, "ai_queries": 50, "storage_gb": 5}
    },
    "voyager": {
        "name": "Voyager",
        "monthly_price": 149,
        "yearly_price": 1430,  # 2 months free
        "stripe_monthly_price_id": "price_voyager_monthly",
        "stripe_yearly_price_id": "price_voyager_yearly",
        "features": ["All Explorer features", "Nova Mind Strategic AI", "Nova Shield Governance", "25 Team Members", "Priority Support", "10 Data Sources", "Custom Reports"],
        "limits": {"users": 25, "ai_queries": -1, "storage_gb": 50}
    },
    "enterprise": {
        "name": "Enterprise",
        "monthly_price": 499,
        "yearly_price": 4790,  # 2 months free
        "stripe_monthly_price_id": "price_enterprise_monthly",
        "stripe_yearly_price_id": "price_enterprise_yearly",
        "features": ["All Voyager features", "Nova Forge Process Optimization", "Unlimited Team Members", "Dedicated Account Manager", "Unlimited Data Sources", "White-Label Options", "API Access", "SSO/SAML", "Custom Integrations"],
        "limits": {"users": -1, "ai_queries": -1, "storage_gb": -1}
    }
}


# Request/Response Models
class CreateCheckoutRequest(BaseModel):
    plan: str
    billing_interval: str = "monthly"  # monthly or yearly
    success_url: str
    cancel_url: str


class CreateCustomerRequest(BaseModel):
    email: str
    name: str
    organization_id: str


class UpdateSubscriptionRequest(BaseModel):
    new_plan: Optional[str] = None
    new_billing_interval: Optional[str] = None


class CancelSubscriptionRequest(BaseModel):
    immediately: bool = False
    feedback: Optional[str] = None


class ApplyCouponRequest(BaseModel):
    coupon_code: str


class AddPaymentMethodRequest(BaseModel):
    payment_method_id: str
    set_default: bool = True


# Mock data for demo purposes
MOCK_SUBSCRIPTION = {
    "id": "sub_demo123",
    "status": "active",
    "plan": "voyager",
    "billing_interval": "monthly",
    "current_period_start": "2024-12-01",
    "current_period_end": "2025-01-01",
    "cancel_at_period_end": False,
    "trial_end": None,
    "amount": 299,
    "currency": "usd"
}

MOCK_INVOICES = [
    {"id": "inv_001", "amount": 299, "status": "paid", "date": "2024-12-01", "pdf_url": "#"},
    {"id": "inv_002", "amount": 299, "status": "paid", "date": "2024-11-01", "pdf_url": "#"},
    {"id": "inv_003", "amount": 299, "status": "paid", "date": "2024-10-01", "pdf_url": "#"},
]

MOCK_PAYMENT_METHODS = [
    {"id": "pm_001", "type": "card", "brand": "visa", "last4": "4242", "exp_month": 12, "exp_year": 2025, "is_default": True},
    {"id": "pm_002", "type": "card", "brand": "mastercard", "last4": "5555", "exp_month": 6, "exp_year": 2026, "is_default": False},
]


# API Endpoints
@router.get("/plans")
async def get_plans():
    """Get all available subscription plans"""
    return {
        "success": True,
        "plans": PLANS
    }


@router.get("/plans/{plan_id}")
async def get_plan(plan_id: str):
    """Get a specific plan by ID"""
    if plan_id not in PLANS:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {
        "success": True,
        "plan": {
            "id": plan_id,
            **PLANS[plan_id]
        }
    }


@router.post("/customers")
async def create_customer(request: CreateCustomerRequest):
    """Create a new Stripe customer"""
    try:
        # In production, this would create a real Stripe customer
        # customer = stripe.Customer.create(
        #     email=request.email,
        #     name=request.name,
        #     metadata={"organization_id": request.organization_id}
        # )
        return {
            "success": True,
            "customer_id": f"cus_demo_{request.organization_id}",
            "message": "Customer created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/checkout")
async def create_checkout_session(request: CreateCheckoutRequest):
    """Create a Stripe Checkout session"""
    if request.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = PLANS[request.plan]
    price_id = (
        plan["stripe_monthly_price_id"]
        if request.billing_interval == "monthly"
        else plan["stripe_yearly_price_id"]
    )
    
    try:
        # In production, this would create a real Stripe checkout session
        # session = stripe.checkout.Session.create(
        #     payment_method_types=["card"],
        #     line_items=[{"price": price_id, "quantity": 1}],
        #     mode="subscription",
        #     success_url=request.success_url,
        #     cancel_url=request.cancel_url,
        #     subscription_data={"trial_period_days": 14}
        # )
        return {
            "success": True,
            "session_id": "cs_demo_session",
            "checkout_url": f"{request.success_url}?session_id=cs_demo_session",
            "message": "Checkout session created"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/subscription")
async def get_subscription():
    """Get current subscription details"""
    return {
        "success": True,
        "subscription": MOCK_SUBSCRIPTION
    }


@router.put("/subscription")
async def update_subscription(request: UpdateSubscriptionRequest):
    """Update subscription plan or billing interval"""
    if request.new_plan and request.new_plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    updated_subscription = {**MOCK_SUBSCRIPTION}
    if request.new_plan:
        updated_subscription["plan"] = request.new_plan
        updated_subscription["amount"] = PLANS[request.new_plan]["monthly_price"]
    if request.new_billing_interval:
        updated_subscription["billing_interval"] = request.new_billing_interval
    
    return {
        "success": True,
        "subscription": updated_subscription,
        "message": "Subscription updated successfully"
    }


@router.post("/subscription/cancel")
async def cancel_subscription(request: CancelSubscriptionRequest):
    """Cancel subscription"""
    return {
        "success": True,
        "subscription": {
            **MOCK_SUBSCRIPTION,
            "cancel_at_period_end": not request.immediately,
            "status": "canceled" if request.immediately else "active"
        },
        "message": "Subscription cancellation scheduled" if not request.immediately else "Subscription canceled immediately"
    }


@router.post("/subscription/reactivate")
async def reactivate_subscription():
    """Reactivate a cancelled subscription"""
    return {
        "success": True,
        "subscription": {
            **MOCK_SUBSCRIPTION,
            "cancel_at_period_end": False
        },
        "message": "Subscription reactivated successfully"
    }


@router.get("/portal")
async def get_billing_portal(return_url: str):
    """Get Stripe Billing Portal URL"""
    try:
        # In production, this would create a real billing portal session
        # session = stripe.billing_portal.Session.create(
        #     customer=customer_id,
        #     return_url=return_url
        # )
        return {
            "success": True,
            "portal_url": f"https://billing.stripe.com/demo?return_url={return_url}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/invoices")
async def get_invoices(limit: int = 10):
    """Get customer invoices"""
    return {
        "success": True,
        "invoices": MOCK_INVOICES[:limit]
    }


@router.get("/invoices/upcoming")
async def get_upcoming_invoice():
    """Get upcoming invoice"""
    return {
        "success": True,
        "invoice": {
            "amount": 299,
            "currency": "usd",
            "due_date": "2025-01-01",
            "items": [
                {"description": "Professional Plan - Monthly", "amount": 299}
            ]
        }
    }


@router.get("/payment-methods")
async def get_payment_methods():
    """Get customer payment methods"""
    return {
        "success": True,
        "payment_methods": MOCK_PAYMENT_METHODS
    }


@router.post("/payment-methods")
async def add_payment_method(request: AddPaymentMethodRequest):
    """Add a new payment method"""
    new_method = {
        "id": request.payment_method_id,
        "type": "card",
        "brand": "visa",
        "last4": "1234",
        "exp_month": 12,
        "exp_year": 2027,
        "is_default": request.set_default
    }
    return {
        "success": True,
        "payment_method": new_method,
        "message": "Payment method added successfully"
    }


@router.delete("/payment-methods/{payment_method_id}")
async def remove_payment_method(payment_method_id: str):
    """Remove a payment method"""
    return {
        "success": True,
        "message": "Payment method removed successfully"
    }


@router.post("/payment-methods/{payment_method_id}/default")
async def set_default_payment_method(payment_method_id: str):
    """Set a payment method as default"""
    return {
        "success": True,
        "message": "Default payment method updated"
    }


@router.post("/coupon/apply")
async def apply_coupon(request: ApplyCouponRequest):
    """Apply a coupon to subscription"""
    # Validate coupon
    valid_coupons = {
        "SAVE20": {"percent_off": 20, "duration": "once"},
        "ANNUAL50": {"percent_off": 50, "duration": "once"},
        "STARTUP": {"percent_off": 30, "duration": "repeating", "duration_months": 3}
    }
    
    if request.coupon_code not in valid_coupons:
        raise HTTPException(status_code=400, detail="Invalid coupon code")
    
    coupon = valid_coupons[request.coupon_code]
    return {
        "success": True,
        "coupon": {
            "code": request.coupon_code,
            **coupon
        },
        "message": f"Coupon applied: {coupon['percent_off']}% off"
    }


@router.get("/usage")
async def get_usage():
    """Get current usage statistics"""
    return {
        "success": True,
        "usage": {
            "users": {"current": 12, "limit": 50, "percentage": 24},
            "ai_queries": {"current": 847, "limit": -1, "percentage": 0},
            "storage_gb": {"current": 23.5, "limit": 100, "percentage": 23.5},
            "api_calls": {"current": 15420, "limit": -1, "percentage": 0}
        },
        "period": {
            "start": "2024-12-01",
            "end": "2025-01-01"
        }
    }


@router.get("/revenue/metrics")
async def get_revenue_metrics():
    """Get revenue metrics (admin only)"""
    return {
        "success": True,
        "metrics": {
            "mrr": 154847.25,
            "arr": 1858167.00,
            "total_revenue": 1847293.50,
            "active_subscriptions": 1247,
            "trial_users": 342,
            "churn_rate": 2.3,
            "conversion_rate": 24.5,
            "arpu": 124.50,
            "ltv": 2847.00
        }
    }


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature")
):
    """Handle Stripe webhook events"""
    payload = await request.body()
    
    try:
        # In production, verify the webhook signature
        # event = stripe.Webhook.construct_event(
        #     payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        # )
        
        # For demo, parse the payload directly
        import json
        event = json.loads(payload)
        event_type = event.get("type", "unknown")
        
        # Handle different event types
        handlers = {
            "checkout.session.completed": handle_checkout_completed,
            "customer.subscription.created": handle_subscription_created,
            "customer.subscription.updated": handle_subscription_updated,
            "customer.subscription.deleted": handle_subscription_deleted,
            "invoice.paid": handle_invoice_paid,
            "invoice.payment_failed": handle_payment_failed,
            "customer.subscription.trial_will_end": handle_trial_ending,
        }
        
        handler = handlers.get(event_type)
        if handler:
            await handler(event.get("data", {}).get("object", {}))
        
        return {"success": True, "event_type": event_type}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Webhook event handlers
async def handle_checkout_completed(data):
    """Handle successful checkout"""
    print(f"Checkout completed: {data.get('id')}")

async def handle_subscription_created(data):
    """Handle new subscription"""
    print(f"Subscription created: {data.get('id')}")

async def handle_subscription_updated(data):
    """Handle subscription update"""
    print(f"Subscription updated: {data.get('id')}")

async def handle_subscription_deleted(data):
    """Handle subscription cancellation"""
    print(f"Subscription deleted: {data.get('id')}")

async def handle_invoice_paid(data):
    """Handle successful payment"""
    print(f"Invoice paid: {data.get('id')}")

async def handle_payment_failed(data):
    """Handle failed payment"""
    print(f"Payment failed: {data.get('id')}")

async def handle_trial_ending(data):
    """Handle trial ending notification"""
    print(f"Trial ending: {data.get('id')}")
