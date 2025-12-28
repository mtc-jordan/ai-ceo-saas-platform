"""Google Analytics integration service for website traffic data."""
import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import json


class GoogleAnalyticsService:
    """Service for fetching data from Google Analytics 4 API."""
    
    # GA4 Data API endpoint
    BASE_URL = "https://analyticsdata.googleapis.com/v1beta"
    
    def __init__(self, credentials_json: str, property_id: str):
        """
        Initialize GA service.
        
        Args:
            credentials_json: JSON string of service account credentials
            property_id: GA4 property ID (e.g., "properties/123456789")
        """
        self.credentials = json.loads(credentials_json) if isinstance(credentials_json, str) else credentials_json
        self.property_id = property_id
        self._access_token = None
        self._token_expiry = None
    
    async def _get_access_token(self) -> str:
        """Get OAuth2 access token using service account credentials."""
        import jwt
        import time
        
        # Check if we have a valid cached token
        if self._access_token and self._token_expiry and datetime.now() < self._token_expiry:
            return self._access_token
        
        # Create JWT for service account
        now = int(time.time())
        payload = {
            "iss": self.credentials["client_email"],
            "scope": "https://www.googleapis.com/auth/analytics.readonly",
            "aud": "https://oauth2.googleapis.com/token",
            "iat": now,
            "exp": now + 3600
        }
        
        signed_jwt = jwt.encode(
            payload,
            self.credentials["private_key"],
            algorithm="RS256"
        )
        
        # Exchange JWT for access token
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                    "assertion": signed_jwt
                },
                timeout=30.0
            )
            response.raise_for_status()
            token_data = response.json()
            
            self._access_token = token_data["access_token"]
            self._token_expiry = datetime.now() + timedelta(seconds=token_data.get("expires_in", 3600) - 60)
            
            return self._access_token
    
    async def test_connection(self) -> bool:
        """Test if the credentials are valid."""
        try:
            token = await self._get_access_token()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/{self.property_id}/metadata",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10.0
                )
                return response.status_code == 200
        except Exception:
            return False
    
    async def run_report(
        self,
        dimensions: List[str],
        metrics: List[str],
        start_date: str = "30daysAgo",
        end_date: str = "today"
    ) -> Dict[str, Any]:
        """Run a GA4 report."""
        token = await self._get_access_token()
        
        request_body = {
            "dateRanges": [{"startDate": start_date, "endDate": end_date}],
            "dimensions": [{"name": d} for d in dimensions],
            "metrics": [{"name": m} for m in metrics]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/{self.property_id}:runReport",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json=request_body,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def get_traffic_overview(
        self,
        start_date: str = "30daysAgo",
        end_date: str = "today"
    ) -> Dict[str, Any]:
        """Get traffic overview metrics."""
        report = await self.run_report(
            dimensions=[],
            metrics=[
                "activeUsers",
                "newUsers", 
                "sessions",
                "screenPageViews",
                "averageSessionDuration",
                "bounceRate"
            ],
            start_date=start_date,
            end_date=end_date
        )
        
        # Parse the response
        metrics_data = {}
        if report.get("rows"):
            row = report["rows"][0]
            metric_headers = report.get("metricHeaders", [])
            for i, header in enumerate(metric_headers):
                metrics_data[header["name"]] = float(row["metricValues"][i]["value"])
        
        return {
            "active_users": int(metrics_data.get("activeUsers", 0)),
            "new_users": int(metrics_data.get("newUsers", 0)),
            "sessions": int(metrics_data.get("sessions", 0)),
            "page_views": int(metrics_data.get("screenPageViews", 0)),
            "avg_session_duration": round(metrics_data.get("averageSessionDuration", 0), 2),
            "bounce_rate": round(metrics_data.get("bounceRate", 0) * 100, 2),
            "period": {"start": start_date, "end": end_date}
        }
    
    async def get_traffic_by_source(
        self,
        start_date: str = "30daysAgo",
        end_date: str = "today"
    ) -> List[Dict[str, Any]]:
        """Get traffic breakdown by source."""
        report = await self.run_report(
            dimensions=["sessionSource"],
            metrics=["sessions", "activeUsers", "conversions"],
            start_date=start_date,
            end_date=end_date
        )
        
        sources = []
        for row in report.get("rows", []):
            sources.append({
                "source": row["dimensionValues"][0]["value"],
                "sessions": int(row["metricValues"][0]["value"]),
                "users": int(row["metricValues"][1]["value"]),
                "conversions": int(row["metricValues"][2]["value"])
            })
        
        return sorted(sources, key=lambda x: x["sessions"], reverse=True)[:10]
    
    async def get_traffic_by_country(
        self,
        start_date: str = "30daysAgo",
        end_date: str = "today"
    ) -> List[Dict[str, Any]]:
        """Get traffic breakdown by country."""
        report = await self.run_report(
            dimensions=["country"],
            metrics=["sessions", "activeUsers"],
            start_date=start_date,
            end_date=end_date
        )
        
        countries = []
        for row in report.get("rows", []):
            countries.append({
                "country": row["dimensionValues"][0]["value"],
                "sessions": int(row["metricValues"][0]["value"]),
                "users": int(row["metricValues"][1]["value"])
            })
        
        return sorted(countries, key=lambda x: x["sessions"], reverse=True)[:10]
    
    async def get_daily_traffic(
        self,
        start_date: str = "30daysAgo",
        end_date: str = "today"
    ) -> List[Dict[str, Any]]:
        """Get daily traffic data for charts."""
        report = await self.run_report(
            dimensions=["date"],
            metrics=["activeUsers", "sessions", "screenPageViews"],
            start_date=start_date,
            end_date=end_date
        )
        
        daily_data = []
        for row in report.get("rows", []):
            date_str = row["dimensionValues"][0]["value"]
            daily_data.append({
                "date": f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}",
                "users": int(row["metricValues"][0]["value"]),
                "sessions": int(row["metricValues"][1]["value"]),
                "page_views": int(row["metricValues"][2]["value"])
            })
        
        return sorted(daily_data, key=lambda x: x["date"])
    
    async def get_all_metrics(self) -> Dict[str, Any]:
        """Get all GA metrics combined."""
        overview = await self.get_traffic_overview()
        by_source = await self.get_traffic_by_source()
        by_country = await self.get_traffic_by_country()
        daily = await self.get_daily_traffic()
        
        return {
            "overview": overview,
            "by_source": by_source,
            "by_country": by_country,
            "daily": daily,
            "fetched_at": datetime.now().isoformat()
        }
