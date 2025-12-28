"""HubSpot integration service for CRM and marketing data."""
import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List


class HubSpotService:
    """Service for fetching data from HubSpot API."""
    
    BASE_URL = "https://api.hubapi.com"
    
    def __init__(self, api_key: str):
        """
        Initialize HubSpot service.
        
        Args:
            api_key: HubSpot private app access token
        """
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def test_connection(self) -> bool:
        """Test if the API key is valid."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/crm/v3/objects/contacts",
                    headers=self.headers,
                    params={"limit": 1},
                    timeout=10.0
                )
                return response.status_code == 200
        except Exception:
            return False
    
    async def get_contacts_count(self) -> int:
        """Get total number of contacts."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/crm/v3/objects/contacts",
                headers=self.headers,
                params={"limit": 1},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data.get("total", 0)
    
    async def get_contacts_metrics(self) -> Dict[str, Any]:
        """Get contact metrics."""
        async with httpx.AsyncClient() as client:
            # Get recent contacts (last 30 days)
            thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
            
            response = await client.post(
                f"{self.BASE_URL}/crm/v3/objects/contacts/search",
                headers=self.headers,
                json={
                    "filterGroups": [{
                        "filters": [{
                            "propertyName": "createdate",
                            "operator": "GTE",
                            "value": thirty_days_ago
                        }]
                    }],
                    "limit": 1
                },
                timeout=30.0
            )
            response.raise_for_status()
            new_contacts = response.json().get("total", 0)
            
            # Get total contacts
            total_response = await client.get(
                f"{self.BASE_URL}/crm/v3/objects/contacts",
                headers=self.headers,
                params={"limit": 1},
                timeout=30.0
            )
            total_response.raise_for_status()
            total_contacts = total_response.json().get("total", 0)
            
            return {
                "total_contacts": total_contacts,
                "new_contacts_30d": new_contacts,
                "growth_rate": round((new_contacts / max(total_contacts - new_contacts, 1)) * 100, 2)
            }
    
    async def get_deals_metrics(self) -> Dict[str, Any]:
        """Get deals/pipeline metrics."""
        async with httpx.AsyncClient() as client:
            # Get all deals
            response = await client.get(
                f"{self.BASE_URL}/crm/v3/objects/deals",
                headers=self.headers,
                params={
                    "limit": 100,
                    "properties": "amount,dealstage,closedate,createdate"
                },
                timeout=30.0
            )
            response.raise_for_status()
            deals_data = response.json()
            
            deals = deals_data.get("results", [])
            
            # Calculate metrics
            total_pipeline_value = sum(
                float(deal.get("properties", {}).get("amount", 0) or 0)
                for deal in deals
            )
            
            # Get won deals (last 30 days)
            thirty_days_ago = datetime.now() - timedelta(days=30)
            won_deals = [
                deal for deal in deals
                if deal.get("properties", {}).get("dealstage") == "closedwon"
            ]
            
            won_value = sum(
                float(deal.get("properties", {}).get("amount", 0) or 0)
                for deal in won_deals
            )
            
            return {
                "total_deals": len(deals),
                "total_pipeline_value": total_pipeline_value,
                "won_deals": len(won_deals),
                "won_value": won_value,
                "avg_deal_size": round(total_pipeline_value / max(len(deals), 1), 2)
            }
    
    async def get_companies_metrics(self) -> Dict[str, Any]:
        """Get company metrics."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/crm/v3/objects/companies",
                headers=self.headers,
                params={"limit": 1},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "total_companies": data.get("total", 0)
            }
    
    async def get_deal_stages(self) -> List[Dict[str, Any]]:
        """Get deals grouped by stage."""
        async with httpx.AsyncClient() as client:
            # Get pipeline stages
            response = await client.get(
                f"{self.BASE_URL}/crm/v3/pipelines/deals",
                headers=self.headers,
                timeout=30.0
            )
            response.raise_for_status()
            pipelines = response.json().get("results", [])
            
            stages = {}
            if pipelines:
                for stage in pipelines[0].get("stages", []):
                    stages[stage["id"]] = {
                        "name": stage["label"],
                        "count": 0,
                        "value": 0
                    }
            
            # Get deals and count by stage
            deals_response = await client.get(
                f"{self.BASE_URL}/crm/v3/objects/deals",
                headers=self.headers,
                params={
                    "limit": 100,
                    "properties": "amount,dealstage"
                },
                timeout=30.0
            )
            deals_response.raise_for_status()
            deals = deals_response.json().get("results", [])
            
            for deal in deals:
                stage_id = deal.get("properties", {}).get("dealstage")
                if stage_id in stages:
                    stages[stage_id]["count"] += 1
                    stages[stage_id]["value"] += float(
                        deal.get("properties", {}).get("amount", 0) or 0
                    )
            
            return list(stages.values())
    
    async def get_recent_activities(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent engagement activities."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/crm/v3/objects/contacts",
                headers=self.headers,
                params={
                    "limit": limit,
                    "properties": "firstname,lastname,email,lastmodifieddate",
                    "sorts": "-lastmodifieddate"
                },
                timeout=30.0
            )
            response.raise_for_status()
            contacts = response.json().get("results", [])
            
            activities = []
            for contact in contacts:
                props = contact.get("properties", {})
                activities.append({
                    "type": "contact_updated",
                    "name": f"{props.get('firstname', '')} {props.get('lastname', '')}".strip(),
                    "email": props.get("email"),
                    "date": props.get("lastmodifieddate")
                })
            
            return activities
    
    async def get_all_metrics(self) -> Dict[str, Any]:
        """Get all HubSpot metrics combined."""
        contacts = await self.get_contacts_metrics()
        deals = await self.get_deals_metrics()
        companies = await self.get_companies_metrics()
        stages = await self.get_deal_stages()
        
        return {
            "contacts": contacts,
            "deals": deals,
            "companies": companies,
            "deal_stages": stages,
            "fetched_at": datetime.now().isoformat()
        }
