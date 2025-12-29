"""
Stripe Payment Integration Service for NovaVerse
Handles subscriptions, payments, and billing management
"""

import stripe
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.user import Subscription, Organization


# Initialize Stripe with secret key
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Service class for Stripe payment operations"""
    
    # Plan configurations
    PLANS = {
        "explorer": {
            "name": "Explorer",
            "monthly_price": 49,
            "yearly_price": 470,  # 2 months free
            "features": [
                "Nova Pulse Dashboard",
                "Basic AI Insights",
                "5 Team Members",
                "Email Support",
                "1 Data Source"
            ]
        },
        "voyager": {
            "name": "Voyager",
            "monthly_price": 149,
            "yearly_price": 1430,  # 2 months free
            "features": [
                "All Explorer features",
                "Nova Mind Strategic AI",
                "Nova Shield Governance",
                "25 Team Members",
                "Priority Support",
                "10 Data Sources",
                "Custom Reports"
            ]
        },
        "enterprise": {
            "name": "Enterprise",
            "monthly_price": 499,
            "yearly_price": 4790,  # 2 months free
            "features": [
                "All Voyager features",
                "Nova Forge Process Optimization",
                "Unlimited Team Members",
                "Dedicated Account Manager",
                "Unlimited Data Sources",
                "White-Label Options",
                "API Access",
                "SSO/SAML",
                "Custom Integrations"
            ]
        }
    }
    
    @staticmethod
    async def create_customer(
        email: str,
        name: str,
        organization_name: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> stripe.Customer:
        """Create a new Stripe customer"""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={
                    "organization": organization_name,
                    **(metadata or {})
                }
            )
            return customer
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create Stripe customer: {str(e)}")
    
    @staticmethod
    async def create_checkout_session(
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        mode: str = "subscription",
        metadata: Optional[Dict[str, Any]] = None
    ) -> stripe.checkout.Session:
        """Create a Stripe Checkout Session for subscription"""
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[{
                    "price": price_id,
                    "quantity": 1
                }],
                mode=mode,
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata or {},
                subscription_data={
                    "metadata": metadata or {}
                } if mode == "subscription" else None
            )
            return session
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create checkout session: {str(e)}")
    
    @staticmethod
    async def create_billing_portal_session(
        customer_id: str,
        return_url: str
    ) -> stripe.billing_portal.Session:
        """Create a Stripe Billing Portal session for customer self-service"""
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            return session
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create billing portal session: {str(e)}")
    
    @staticmethod
    async def get_subscription(subscription_id: str) -> stripe.Subscription:
        """Retrieve a Stripe subscription"""
        try:
            return stripe.Subscription.retrieve(subscription_id)
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve subscription: {str(e)}")
    
    @staticmethod
    async def cancel_subscription(
        subscription_id: str,
        at_period_end: bool = True
    ) -> stripe.Subscription:
        """Cancel a Stripe subscription"""
        try:
            if at_period_end:
                return stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True
                )
            else:
                return stripe.Subscription.delete(subscription_id)
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to cancel subscription: {str(e)}")
    
    @staticmethod
    async def update_subscription(
        subscription_id: str,
        new_price_id: str
    ) -> stripe.Subscription:
        """Update/upgrade a subscription to a new plan"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return stripe.Subscription.modify(
                subscription_id,
                items=[{
                    "id": subscription["items"]["data"][0]["id"],
                    "price": new_price_id
                }],
                proration_behavior="create_prorations"
            )
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to update subscription: {str(e)}")
    
    @staticmethod
    async def get_invoices(
        customer_id: str,
        limit: int = 10
    ) -> list:
        """Get customer invoices"""
        try:
            invoices = stripe.Invoice.list(
                customer=customer_id,
                limit=limit
            )
            return invoices.data
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve invoices: {str(e)}")
    
    @staticmethod
    async def get_payment_methods(customer_id: str) -> list:
        """Get customer payment methods"""
        try:
            payment_methods = stripe.PaymentMethod.list(
                customer=customer_id,
                type="card"
            )
            return payment_methods.data
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve payment methods: {str(e)}")
    
    @staticmethod
    def construct_webhook_event(
        payload: bytes,
        sig_header: str
    ) -> stripe.Event:
        """Construct and verify a webhook event"""
        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except stripe.error.SignatureVerificationError as e:
            raise Exception(f"Invalid webhook signature: {str(e)}")
    
    @classmethod
    async def handle_webhook_event(
        cls,
        event: stripe.Event,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Handle Stripe webhook events"""
        event_type = event["type"]
        data = event["data"]["object"]
        
        handlers = {
            "checkout.session.completed": cls._handle_checkout_completed,
            "customer.subscription.created": cls._handle_subscription_created,
            "customer.subscription.updated": cls._handle_subscription_updated,
            "customer.subscription.deleted": cls._handle_subscription_deleted,
            "invoice.paid": cls._handle_invoice_paid,
            "invoice.payment_failed": cls._handle_payment_failed,
        }
        
        handler = handlers.get(event_type)
        if handler:
            return await handler(data, db)
        
        return {"status": "ignored", "event_type": event_type}
    
    @staticmethod
    async def _handle_checkout_completed(
        data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Handle successful checkout completion"""
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")
        metadata = data.get("metadata", {})
        organization_id = metadata.get("organization_id")
        
        if organization_id and subscription_id:
            # Update subscription in database
            result = await db.execute(
                select(Subscription).where(
                    Subscription.organization_id == organization_id
                )
            )
            subscription = result.scalar_one_or_none()
            
            if subscription:
                subscription.stripe_customer_id = customer_id
                subscription.stripe_subscription_id = subscription_id
                subscription.status = "active"
                await db.commit()
        
        return {"status": "success", "action": "checkout_completed"}
    
    @staticmethod
    async def _handle_subscription_created(
        data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Handle new subscription creation"""
        return {"status": "success", "action": "subscription_created"}
    
    @staticmethod
    async def _handle_subscription_updated(
        data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Handle subscription updates (plan changes, renewals)"""
        subscription_id = data.get("id")
        status = data.get("status")
        current_period_end = data.get("current_period_end")
        
        result = await db.execute(
            select(Subscription).where(
                Subscription.stripe_subscription_id == subscription_id
            )
        )
        subscription = result.scalar_one_or_none()
        
        if subscription:
            subscription.status = status
            if current_period_end:
                subscription.current_period_end = datetime.fromtimestamp(current_period_end)
            await db.commit()
        
        return {"status": "success", "action": "subscription_updated"}
    
    @staticmethod
    async def _handle_subscription_deleted(
        data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Handle subscription cancellation"""
        subscription_id = data.get("id")
        
        result = await db.execute(
            select(Subscription).where(
                Subscription.stripe_subscription_id == subscription_id
            )
        )
        subscription = result.scalar_one_or_none()
        
        if subscription:
            subscription.status = "canceled"
            subscription.plan_id = "free"
            await db.commit()
        
        return {"status": "success", "action": "subscription_deleted"}
    
    @staticmethod
    async def _handle_invoice_paid(
        data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Handle successful invoice payment"""
        return {"status": "success", "action": "invoice_paid"}
    
    @staticmethod
    async def _handle_payment_failed(
        data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Handle failed payment"""
        subscription_id = data.get("subscription")
        
        if subscription_id:
            result = await db.execute(
                select(Subscription).where(
                    Subscription.stripe_subscription_id == subscription_id
                )
            )
            subscription = result.scalar_one_or_none()
            
            if subscription:
                subscription.status = "past_due"
                await db.commit()
        
        return {"status": "success", "action": "payment_failed_handled"}


# Export singleton instance
stripe_service = StripeService()
