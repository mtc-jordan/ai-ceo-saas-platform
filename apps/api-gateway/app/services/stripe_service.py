"""
Stripe Payment Service for AI CEO Platform
Handles subscriptions, checkout, and customer portal
"""
import stripe
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.core.config import settings

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY if hasattr(settings, 'STRIPE_SECRET_KEY') else None

# Subscription Plans
SUBSCRIPTION_PLANS = {
    "free": {
        "name": "Free",
        "price_monthly": 0,
        "price_yearly": 0,
        "features": [
            "1 User",
            "Basic Dashboard",
            "5 Data Sources",
            "Daily Briefings",
            "Email Support"
        ],
        "limits": {
            "users": 1,
            "data_sources": 5,
            "scenarios": 3,
            "competitors": 5,
            "ai_queries": 50
        }
    },
    "pro": {
        "name": "Pro",
        "price_monthly": 99,
        "price_yearly": 990,
        "stripe_price_monthly": "price_pro_monthly",  # Replace with actual Stripe price ID
        "stripe_price_yearly": "price_pro_yearly",
        "features": [
            "5 Users",
            "Full Pulse AI Dashboard",
            "Unlimited Data Sources",
            "Real-time Briefings",
            "Athena Strategic Planning",
            "Scenario Analysis",
            "Competitor Tracking",
            "Priority Support"
        ],
        "limits": {
            "users": 5,
            "data_sources": -1,  # Unlimited
            "scenarios": 20,
            "competitors": 50,
            "ai_queries": 500
        }
    },
    "enterprise": {
        "name": "Enterprise",
        "price_monthly": 499,
        "price_yearly": 4990,
        "stripe_price_monthly": "price_enterprise_monthly",
        "stripe_price_yearly": "price_enterprise_yearly",
        "features": [
            "Unlimited Users",
            "Full Platform Access",
            "Pulse AI + Athena + GovernAI",
            "Custom Integrations",
            "Board Intelligence",
            "ESG Reporting",
            "Investment Analysis",
            "Dedicated Account Manager",
            "SLA Guarantee",
            "Custom AI Training"
        ],
        "limits": {
            "users": -1,
            "data_sources": -1,
            "scenarios": -1,
            "competitors": -1,
            "ai_queries": -1
        }
    }
}


class StripeService:
    """Service for handling Stripe payments and subscriptions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    @staticmethod
    def get_plans() -> Dict[str, Any]:
        """Get all available subscription plans"""
        return SUBSCRIPTION_PLANS
    
    @staticmethod
    def get_plan(plan_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific plan by ID"""
        return SUBSCRIPTION_PLANS.get(plan_id)
    
    async def create_customer(
        self,
        email: str,
        name: str,
        organization_id: str,
        metadata: Optional[Dict] = None
    ) -> Optional[str]:
        """Create a Stripe customer"""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={
                    "organization_id": organization_id,
                    **(metadata or {})
                }
            )
            return customer.id
        except stripe.error.StripeError as e:
            print(f"Stripe error creating customer: {e}")
            return None
    
    async def create_checkout_session(
        self,
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        trial_days: int = 14
    ) -> Optional[Dict[str, Any]]:
        """Create a Stripe Checkout session for subscription"""
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[{
                    "price": price_id,
                    "quantity": 1
                }],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                subscription_data={
                    "trial_period_days": trial_days
                } if trial_days > 0 else {},
                allow_promotion_codes=True
            )
            return {
                "session_id": session.id,
                "url": session.url
            }
        except stripe.error.StripeError as e:
            print(f"Stripe error creating checkout session: {e}")
            return None
    
    async def create_portal_session(
        self,
        customer_id: str,
        return_url: str
    ) -> Optional[str]:
        """Create a Stripe Customer Portal session"""
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            return session.url
        except stripe.error.StripeError as e:
            print(f"Stripe error creating portal session: {e}")
            return None
    
    async def get_subscription(
        self,
        subscription_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get subscription details"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return {
                "id": subscription.id,
                "status": subscription.status,
                "current_period_start": datetime.fromtimestamp(subscription.current_period_start),
                "current_period_end": datetime.fromtimestamp(subscription.current_period_end),
                "cancel_at_period_end": subscription.cancel_at_period_end,
                "plan": subscription.items.data[0].price.id if subscription.items.data else None
            }
        except stripe.error.StripeError as e:
            print(f"Stripe error getting subscription: {e}")
            return None
    
    async def cancel_subscription(
        self,
        subscription_id: str,
        at_period_end: bool = True
    ) -> bool:
        """Cancel a subscription"""
        try:
            if at_period_end:
                stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True
                )
            else:
                stripe.Subscription.delete(subscription_id)
            return True
        except stripe.error.StripeError as e:
            print(f"Stripe error canceling subscription: {e}")
            return False
    
    async def update_subscription(
        self,
        subscription_id: str,
        new_price_id: str
    ) -> bool:
        """Update subscription to a new plan"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            stripe.Subscription.modify(
                subscription_id,
                items=[{
                    "id": subscription.items.data[0].id,
                    "price": new_price_id
                }],
                proration_behavior="create_prorations"
            )
            return True
        except stripe.error.StripeError as e:
            print(f"Stripe error updating subscription: {e}")
            return False
    
    @staticmethod
    def construct_webhook_event(
        payload: bytes,
        sig_header: str,
        webhook_secret: str
    ) -> Optional[stripe.Event]:
        """Construct and verify a webhook event"""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            return event
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            print(f"Webhook error: {e}")
            return None


# Webhook event handlers
async def handle_checkout_completed(session: Dict[str, Any], db: Session):
    """Handle successful checkout completion"""
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")
    
    # Update organization subscription in database
    # This would update the organization's subscription status
    print(f"Checkout completed for customer {customer_id}, subscription {subscription_id}")


async def handle_subscription_updated(subscription: Dict[str, Any], db: Session):
    """Handle subscription updates"""
    subscription_id = subscription.get("id")
    status = subscription.get("status")
    
    # Update subscription status in database
    print(f"Subscription {subscription_id} updated to status {status}")


async def handle_subscription_deleted(subscription: Dict[str, Any], db: Session):
    """Handle subscription cancellation"""
    subscription_id = subscription.get("id")
    
    # Update organization to free plan
    print(f"Subscription {subscription_id} deleted")


async def handle_invoice_payment_failed(invoice: Dict[str, Any], db: Session):
    """Handle failed invoice payment"""
    customer_id = invoice.get("customer")
    
    # Send notification about failed payment
    print(f"Payment failed for customer {customer_id}")
