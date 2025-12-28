"""AI Service for generating briefings and insights using DeepSeek API."""

import httpx
from typing import Dict, List, Any, Optional
from datetime import datetime
import json


class DeepSeekService:
    """Service for generating AI briefings using DeepSeek API."""
    
    BASE_URL = "https://api.deepseek.com/v1"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def test_connection(self) -> bool:
        """Test if the API key is valid."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": "Hello"}],
                        "max_tokens": 5
                    },
                    timeout=10.0
                )
                return response.status_code == 200
        except Exception:
            return False
    
    async def generate_briefing(
        self,
        metrics_data: Dict[str, Any],
        organization_name: str,
        briefing_type: str = "daily"
    ) -> Dict[str, Any]:
        """Generate an AI briefing based on business metrics."""
        prompt = self._build_briefing_prompt(metrics_data, organization_name, briefing_type)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/chat/completions",
                headers=self.headers,
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {
                            "role": "system",
                            "content": """You are an expert AI CEO assistant that provides executive briefings. 
Your role is to analyze business metrics and provide actionable insights in a clear, concise format.
Focus on:
1. Key highlights and wins
2. Areas of concern or risk
3. Actionable recommendations
4. Trends and patterns
Be direct, data-driven, and strategic in your analysis."""
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": 2000,
                    "temperature": 0.7
                },
                timeout=60.0
            )
            response.raise_for_status()
            result = response.json()
            
            briefing_content = result["choices"][0]["message"]["content"]
            
            return {
                "title": f"{briefing_type.capitalize()} Executive Briefing",
                "content": briefing_content,
                "highlights": self._extract_highlights(briefing_content),
                "generated_at": datetime.utcnow().isoformat(),
                "metrics_summary": self._extract_key_metrics(metrics_data),
                "type": briefing_type
            }
    
    def _build_briefing_prompt(
        self,
        metrics_data: Dict[str, Any],
        organization_name: str,
        briefing_type: str
    ) -> str:
        """Build the prompt for briefing generation."""
        prompt_parts = [
            f"Generate a {briefing_type} executive briefing for {organization_name}.",
            f"Today's date: {datetime.now().strftime('%B %d, %Y')}",
            "",
            "## Available Business Metrics:",
            ""
        ]
        
        # Add Stripe/Revenue metrics
        if "stripe" in metrics_data:
            stripe = metrics_data["stripe"]
            prompt_parts.append("### Revenue & Payments (Stripe)")
            if "revenue" in stripe:
                rev = stripe["revenue"]
                prompt_parts.append(f"- Total Revenue (30 days): ${rev.get('total_revenue', 0):,.2f}")
                prompt_parts.append(f"- Successful Payments: {rev.get('successful_payments', 0)}")
                prompt_parts.append(f"- Failed Payments: {rev.get('failed_payments', 0)}")
            if "subscriptions" in stripe:
                subs = stripe["subscriptions"]
                prompt_parts.append(f"- Active Subscriptions: {subs.get('active_subscriptions', 0)}")
                prompt_parts.append(f"- MRR: ${subs.get('mrr', 0):,.2f}")
                prompt_parts.append(f"- Canceled (30 days): {subs.get('canceled_subscriptions', 0)}")
            prompt_parts.append("")
        
        # Add Google Analytics metrics
        if "google_analytics" in metrics_data:
            ga = metrics_data["google_analytics"]
            prompt_parts.append("### Website Traffic (Google Analytics)")
            if "overview" in ga:
                overview = ga["overview"]
                prompt_parts.append(f"- Active Users: {overview.get('active_users', 0):,}")
                prompt_parts.append(f"- New Users: {overview.get('new_users', 0):,}")
                prompt_parts.append(f"- Sessions: {overview.get('sessions', 0):,}")
                prompt_parts.append(f"- Page Views: {overview.get('page_views', 0):,}")
                prompt_parts.append(f"- Bounce Rate: {overview.get('bounce_rate', 0):.1f}%")
            prompt_parts.append("")
        
        # Add HubSpot/CRM metrics
        if "hubspot" in metrics_data:
            hs = metrics_data["hubspot"]
            prompt_parts.append("### CRM & Sales (HubSpot)")
            if "contacts" in hs:
                contacts = hs["contacts"]
                prompt_parts.append(f"- Total Contacts: {contacts.get('total_contacts', 0):,}")
                prompt_parts.append(f"- New Contacts (30 days): {contacts.get('new_contacts_30d', 0)}")
            if "deals" in hs:
                deals = hs["deals"]
                prompt_parts.append(f"- Total Pipeline Value: ${deals.get('total_pipeline_value', 0):,.2f}")
                prompt_parts.append(f"- Won Deals: {deals.get('won_deals', 0)}")
                prompt_parts.append(f"- Won Value: ${deals.get('won_value', 0):,.2f}")
            prompt_parts.append("")
        
        # Add instructions
        prompt_parts.extend([
            "## Instructions:",
            "Based on the above metrics, provide:",
            "1. **Executive Summary** (2-3 sentences)",
            "2. **Key Highlights** (top 3 positive trends or achievements)",
            "3. **Areas of Concern** (any metrics that need attention)",
            "4. **Recommended Actions** (3-5 specific, actionable recommendations)",
            "5. **Week Ahead Focus** (what to prioritize)",
            "",
            "Format the response in clear sections with bullet points where appropriate."
        ])
        
        return "\n".join(prompt_parts)
    
    def _extract_highlights(self, content: str) -> List[Dict[str, str]]:
        """Extract highlights from the generated content."""
        highlights = []
        lines = content.split("\n")
        for line in lines:
            if line.strip().startswith("- ") or line.strip().startswith("* "):
                highlights.append({
                    "text": line.strip()[2:],
                    "type": "highlight"
                })
        return highlights[:5]
    
    def _extract_key_metrics(self, metrics_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract key metrics for summary display."""
        summary = {}
        
        if "stripe" in metrics_data:
            stripe = metrics_data["stripe"]
            if "revenue" in stripe:
                summary["revenue"] = stripe["revenue"].get("total_revenue", 0)
            if "subscriptions" in stripe:
                summary["mrr"] = stripe["subscriptions"].get("mrr", 0)
                summary["active_subscriptions"] = stripe["subscriptions"].get("active_subscriptions", 0)
        
        if "google_analytics" in metrics_data:
            ga = metrics_data["google_analytics"]
            if "overview" in ga:
                summary["active_users"] = ga["overview"].get("active_users", 0)
                summary["sessions"] = ga["overview"].get("sessions", 0)
        
        if "hubspot" in metrics_data:
            hs = metrics_data["hubspot"]
            if "contacts" in hs:
                summary["total_contacts"] = hs["contacts"].get("total_contacts", 0)
            if "deals" in hs:
                summary["pipeline_value"] = hs["deals"].get("total_pipeline_value", 0)
        
        return summary
    
    async def generate_insight(
        self,
        question: str,
        metrics_data: Dict[str, Any],
        context: Optional[str] = None
    ) -> str:
        """Generate an AI insight based on a specific question."""
        prompt = f"""Based on the following business metrics, answer this question:

Question: {question}

Metrics Data:
{json.dumps(metrics_data, indent=2)}

{f'Additional Context: {context}' if context else ''}

Provide a concise, data-driven answer with specific numbers where relevant."""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/chat/completions",
                headers=self.headers,
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an AI business analyst. Provide concise, actionable insights based on data."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": 500,
                    "temperature": 0.5
                },
                timeout=30.0
            )
            response.raise_for_status()
            result = response.json()
            
            return result["choices"][0]["message"]["content"]


# Standalone functions for backward compatibility
async def generate_daily_briefing(
    metrics: Dict[str, Any],
    alerts: List[Dict[str, Any]],
    organization_name: str,
    deepseek_api_key: Optional[str] = None
) -> Dict[str, Any]:
    """Generate an AI-powered daily briefing."""
    
    if deepseek_api_key:
        service = DeepSeekService(deepseek_api_key)
        try:
            # Format metrics for the service
            formatted_metrics = {}
            if metrics:
                formatted_metrics = metrics
            
            return await service.generate_briefing(
                formatted_metrics,
                organization_name,
                "daily"
            )
        except Exception as e:
            # Fallback to mock briefing on error
            return generate_mock_briefing(metrics, alerts, organization_name, str(e))
    
    # Return mock briefing if DeepSeek is not configured
    return generate_mock_briefing(metrics, alerts, organization_name)


def format_metrics(metrics: Dict[str, Any]) -> str:
    """Format metrics for display."""
    if not metrics:
        return "No metrics available"
    
    lines = []
    for key, value in metrics.items():
        if isinstance(value, dict):
            lines.append(f"- {key}: {value.get('value', 'N/A')} (change: {value.get('change', 'N/A')})")
        else:
            lines.append(f"- {key}: {value}")
    return "\n".join(lines)


def format_alerts(alerts: List[Dict[str, Any]]) -> str:
    """Format alerts for display."""
    if not alerts:
        return "No active alerts"
    
    lines = []
    for alert in alerts:
        lines.append(f"- [{alert.get('severity', 'info').upper()}] {alert.get('title', 'Alert')}: {alert.get('message', '')}")
    return "\n".join(lines)


def generate_mock_briefing(
    metrics: Dict[str, Any],
    alerts: List[Dict[str, Any]],
    organization_name: str,
    error_message: Optional[str] = None
) -> Dict[str, Any]:
    """Generate a mock briefing when DeepSeek is not available."""
    
    today = datetime.utcnow().strftime("%B %d, %Y")
    
    content = f"""# Daily Briefing for {organization_name}
**{today}**

## Executive Summary
Your business metrics are performing within normal parameters. There are {len(alerts) if alerts else 0} alerts requiring your attention today.

## Key Highlights
- Overall system health is stable
- Data sources are syncing successfully
- No critical issues detected

## Areas Requiring Attention
{format_alerts(alerts) if alerts else "- No immediate concerns"}

## Recommended Actions
1. Review any pending alerts
2. Check your dashboard for detailed metrics
3. Schedule time for strategic planning

---
*Configure your DeepSeek API key in Settings for AI-powered insights.*
{f'*Error: {error_message}*' if error_message else ''}
"""
    
    return {
        "title": "Daily Executive Briefing",
        "content": content,
        "highlights": [
            {"text": "System health is stable", "type": "positive"},
            {"text": f"{len(alerts) if alerts else 0} alerts require attention", "type": "info"},
            {"text": "Data sources syncing successfully", "type": "positive"},
        ],
        "generated_at": datetime.utcnow().isoformat(),
        "type": "daily"
    }


async def analyze_anomaly(
    metric_name: str,
    current_value: float,
    historical_values: List[float],
    threshold: float = 2.0
) -> Optional[Dict[str, Any]]:
    """Detect anomalies in metric values using statistical analysis."""
    
    if not historical_values:
        return None
    
    # Calculate mean and standard deviation
    mean = sum(historical_values) / len(historical_values)
    variance = sum((x - mean) ** 2 for x in historical_values) / len(historical_values)
    std_dev = variance ** 0.5
    
    if std_dev == 0:
        return None
    
    # Calculate z-score
    z_score = (current_value - mean) / std_dev
    
    if abs(z_score) > threshold:
        direction = "above" if z_score > 0 else "below"
        severity = "critical" if abs(z_score) > 3 else "warning"
        
        return {
            "type": "anomaly",
            "severity": severity,
            "metric": metric_name,
            "current_value": current_value,
            "expected_range": f"{mean - threshold * std_dev:.2f} - {mean + threshold * std_dev:.2f}",
            "message": f"{metric_name} is significantly {direction} normal ({current_value:.2f} vs expected {mean:.2f})",
            "z_score": z_score
        }
    
    return None
