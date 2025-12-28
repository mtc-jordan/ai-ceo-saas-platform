"""Stripe integration service for payment and revenue data."""
import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from decimal import Decimal


class StripeService:
    """Service for fetching data from Stripe API."""
    
    BASE_URL = "https://api.stripe.com/v1"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
        }
    
    async def test_connection(self) -> bool:
        """Test if the API key is valid."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/balance",
                    headers=self.headers,
                    timeout=10.0
                )
                return response.status_code == 200
        except Exception:
            return False
    
    async def get_balance(self) -> Dict[str, Any]:
        """Get current Stripe balance."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/balance",
                headers=self.headers,
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    
    async def get_revenue_metrics(
        self, 
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get revenue metrics from Stripe."""
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()
        
        async with httpx.AsyncClient() as client:
            # Get charges (payments)
            params = {
                "created[gte]": int(start_date.timestamp()),
                "created[lte]": int(end_date.timestamp()),
                "limit": 100
            }
            
            response = await client.get(
                f"{self.BASE_URL}/charges",
                headers=self.headers,
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            charges_data = response.json()
            
            # Calculate metrics
            total_revenue = sum(
                charge["amount"] for charge in charges_data.get("data", [])
                if charge["status"] == "succeeded"
            ) / 100  # Convert from cents
            
            successful_charges = len([
                c for c in charges_data.get("data", [])
                if c["status"] == "succeeded"
            ])
            
            failed_charges = len([
                c for c in charges_data.get("data", [])
                if c["status"] == "failed"
            ])
            
            return {
                "total_revenue": total_revenue,
                "successful_payments": successful_charges,
                "failed_payments": failed_charges,
                "currency": "USD",
                "period_start": start_date.isoformat(),
                "period_end": end_date.isoformat()
            }
    
    async def get_subscription_metrics(self) -> Dict[str, Any]:
        """Get subscription metrics."""
        async with httpx.AsyncClient() as client:
            # Get active subscriptions
            response = await client.get(
                f"{self.BASE_URL}/subscriptions",
                headers=self.headers,
                params={"status": "active", "limit": 100},
                timeout=30.0
            )
            response.raise_for_status()
            active_subs = response.json()
            
            # Get canceled subscriptions (last 30 days)
            thirty_days_ago = datetime.now() - timedelta(days=30)
            response = await client.get(
                f"{self.BASE_URL}/subscriptions",
                headers=self.headers,
                params={
                    "status": "canceled",
                    "created[gte]": int(thirty_days_ago.timestamp()),
                    "limit": 100
                },
                timeout=30.0
            )
            response.raise_for_status()
            canceled_subs = response.json()
            
            # Calculate MRR
            mrr = sum(
                sub["items"]["data"][0]["price"]["unit_amount"] / 100
                for sub in active_subs.get("data", [])
                if sub["items"]["data"]
            )
            
            return {
                "active_subscriptions": len(active_subs.get("data", [])),
                "canceled_subscriptions": len(canceled_subs.get("data", [])),
                "mrr": mrr,
                "currency": "USD"
            }
    
    async def get_customer_metrics(self) -> Dict[str, Any]:
        """Get customer metrics."""
        async with httpx.AsyncClient() as client:
            # Get total customers
            response = await client.get(
                f"{self.BASE_URL}/customers",
                headers=self.headers,
                params={"limit": 1},
                timeout=30.0
            )
            response.raise_for_status()
            
            # Get new customers (last 30 days)
            thirty_days_ago = datetime.now() - timedelta(days=30)
            response = await client.get(
                f"{self.BASE_URL}/customers",
                headers=self.headers,
                params={
                    "created[gte]": int(thirty_days_ago.timestamp()),
                    "limit": 100
                },
                timeout=30.0
            )
            response.raise_for_status()
            new_customers = response.json()
            
            return {
                "new_customers_30d": len(new_customers.get("data", [])),
            }
    
    async def get_all_metrics(self) -> Dict[str, Any]:
        """Get all Stripe metrics combined."""
        revenue = await self.get_revenue_metrics()
        subscriptions = await self.get_subscription_metrics()
        customers = await self.get_customer_metrics()
        
        return {
            "revenue": revenue,
            "subscriptions": subscriptions,
            "customers": customers,
            "fetched_at": datetime.now().isoformat()
        }
