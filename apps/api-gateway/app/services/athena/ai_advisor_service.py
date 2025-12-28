"""AI Advisor Service for Strategic Recommendations using DeepSeek API."""
import httpx
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.settings import OrganizationSettings
from app.models.athena import (
    StrategicRecommendation, AlertPriority,
    Scenario, Competitor, MarketIntelligence
)


class AIAdvisorService:
    """Service for generating AI-powered strategic recommendations."""
    
    DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def _get_deepseek_key(self, org_id: UUID) -> Optional[str]:
        """Get DeepSeek API key from organization settings."""
        result = await self.db.execute(
            select(OrganizationSettings).where(
                OrganizationSettings.organization_id == org_id
            )
        )
        settings = result.scalar_one_or_none()
        return settings.deepseek_api_key if settings and settings.deepseek_enabled else None
    
    async def _call_deepseek(
        self,
        api_key: str,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7
    ) -> Optional[str]:
        """Call DeepSeek API for AI completion."""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.DEEPSEEK_API_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": temperature,
                        "max_tokens": 2000
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    print(f"DeepSeek API error: {response.status_code} - {response.text}")
                    return None
        except Exception as e:
            print(f"DeepSeek API call failed: {e}")
            return None
    
    async def generate_scenario_analysis(
        self,
        org_id: UUID,
        scenario: Scenario,
        variables: List[Dict],
        outcomes: List[Dict]
    ) -> Dict[str, Any]:
        """Generate AI analysis for a scenario."""
        api_key = await self._get_deepseek_key(org_id)
        if not api_key:
            return {
                "analysis": None,
                "recommendations": [],
                "error": "DeepSeek API key not configured"
            }
        
        system_prompt = """You are an expert business strategist and financial analyst. 
        Analyze the given business scenario and provide actionable insights.
        Be specific, data-driven, and practical in your recommendations."""
        
        user_prompt = f"""Analyze this business scenario:

Scenario: {scenario.name}
Description: {scenario.description or 'N/A'}
Type: {scenario.scenario_type}
Time Horizon: {scenario.time_horizon_months} months

Base Assumptions:
{scenario.base_assumptions}

Modified Variables:
{variables}

Projected Outcomes:
{outcomes}

Please provide:
1. A brief analysis of the scenario's viability (2-3 sentences)
2. Key risks to consider
3. 3-5 specific action recommendations with priority levels

Format your response as:
ANALYSIS: [your analysis]
RISKS: [bullet points]
RECOMMENDATIONS:
- [HIGH] recommendation 1
- [MEDIUM] recommendation 2
- [LOW] recommendation 3
"""
        
        response = await self._call_deepseek(api_key, system_prompt, user_prompt)
        
        if not response:
            return {
                "analysis": None,
                "recommendations": [],
                "error": "Failed to get AI response"
            }
        
        # Parse the response
        analysis = ""
        recommendations = []
        
        lines = response.split("\n")
        current_section = None
        
        for line in lines:
            line = line.strip()
            if line.startswith("ANALYSIS:"):
                current_section = "analysis"
                analysis = line.replace("ANALYSIS:", "").strip()
            elif line.startswith("RISKS:"):
                current_section = "risks"
            elif line.startswith("RECOMMENDATIONS:"):
                current_section = "recommendations"
            elif current_section == "analysis" and line:
                analysis += " " + line
            elif current_section == "recommendations" and line.startswith("-"):
                rec_text = line[1:].strip()
                priority = "medium"
                if "[HIGH]" in rec_text:
                    priority = "high"
                    rec_text = rec_text.replace("[HIGH]", "").strip()
                elif "[LOW]" in rec_text:
                    priority = "low"
                    rec_text = rec_text.replace("[LOW]", "").strip()
                elif "[MEDIUM]" in rec_text:
                    rec_text = rec_text.replace("[MEDIUM]", "").strip()
                
                recommendations.append({
                    "action": rec_text,
                    "priority": priority
                })
        
        return {
            "analysis": analysis,
            "recommendations": recommendations,
            "error": None
        }
    
    async def generate_competitor_analysis(
        self,
        org_id: UUID,
        competitor: Competitor
    ) -> Dict[str, Any]:
        """Generate AI analysis for a competitor."""
        api_key = await self._get_deepseek_key(org_id)
        if not api_key:
            return self._default_competitor_analysis(competitor)
        
        system_prompt = """You are a competitive intelligence analyst. 
        Analyze the given competitor and provide strategic insights.
        Be specific and actionable in your recommendations."""
        
        user_prompt = f"""Analyze this competitor:

Company: {competitor.name}
Website: {competitor.website or 'N/A'}
Description: {competitor.description or 'N/A'}
Industry: {competitor.industry or 'N/A'}
Threat Level: {competitor.threat_level}/10
Market Overlap: {competitor.market_overlap}%

Known Strengths: {competitor.strengths or []}
Known Weaknesses: {competitor.weaknesses or []}
Recent Moves: {competitor.recent_moves or []}

Please provide a competitive analysis with:
1. Overall threat assessment (1-2 sentences)
2. Their key strengths (3-5 points)
3. Their key weaknesses (3-5 points)
4. Opportunities we can exploit against them (3-5 points)
5. Threats they pose to us (3-5 points)
6. Recommended actions (3-5 specific actions with priority)
7. Market position summary (1-2 sentences)

Format as JSON with keys: overall_threat_assessment, strengths, weaknesses, opportunities_against, threats_from, recommended_actions, market_position_summary
"""
        
        response = await self._call_deepseek(api_key, system_prompt, user_prompt, temperature=0.5)
        
        if not response:
            return self._default_competitor_analysis(competitor)
        
        # Try to parse JSON from response
        try:
            import json
            # Find JSON in response
            start = response.find("{")
            end = response.rfind("}") + 1
            if start >= 0 and end > start:
                json_str = response[start:end]
                parsed = json.loads(json_str)
                return {
                    "competitor_id": str(competitor.id),
                    "competitor_name": competitor.name,
                    "overall_threat_assessment": parsed.get("overall_threat_assessment", ""),
                    "strengths": parsed.get("strengths", []),
                    "weaknesses": parsed.get("weaknesses", []),
                    "opportunities_against": parsed.get("opportunities_against", []),
                    "threats_from": parsed.get("threats_from", []),
                    "recommended_actions": parsed.get("recommended_actions", []),
                    "market_position_summary": parsed.get("market_position_summary", "")
                }
        except:
            pass
        
        return self._default_competitor_analysis(competitor)
    
    def _default_competitor_analysis(self, competitor: Competitor) -> Dict[str, Any]:
        """Return default competitor analysis when AI is unavailable."""
        threat_desc = "low" if competitor.threat_level <= 3 else "moderate" if competitor.threat_level <= 6 else "high"
        
        return {
            "competitor_id": str(competitor.id),
            "competitor_name": competitor.name,
            "overall_threat_assessment": f"{competitor.name} represents a {threat_desc} competitive threat with {competitor.market_overlap}% market overlap.",
            "strengths": competitor.strengths or ["Market presence", "Brand recognition"],
            "weaknesses": competitor.weaknesses or ["Limited product range", "Slower innovation"],
            "opportunities_against": [
                "Differentiate on customer service",
                "Target underserved market segments",
                "Innovate faster in key areas"
            ],
            "threats_from": [
                "Price competition",
                "Market share erosion",
                "Talent acquisition competition"
            ],
            "recommended_actions": [
                {"action": "Monitor their product releases closely", "priority": "high"},
                {"action": "Strengthen customer relationships", "priority": "medium"},
                {"action": "Develop unique value propositions", "priority": "high"}
            ],
            "market_position_summary": f"This competitor has a {threat_desc} market position with significant overlap in our target segments."
        }
    
    async def generate_strategic_recommendations(
        self,
        org_id: UUID,
        context: Dict[str, Any]
    ) -> List[StrategicRecommendation]:
        """Generate strategic recommendations based on business context."""
        api_key = await self._get_deepseek_key(org_id)
        
        if not api_key:
            # Return sample recommendations
            return await self._create_sample_recommendations(org_id)
        
        system_prompt = """You are a strategic business advisor for C-level executives.
        Based on the business context provided, generate actionable strategic recommendations.
        Each recommendation should be specific, measurable, and tied to business outcomes."""
        
        user_prompt = f"""Based on this business context, generate 3-5 strategic recommendations:

Business Context:
{context}

For each recommendation, provide:
1. Title (concise, action-oriented)
2. Description (2-3 sentences)
3. Rationale (why this matters)
4. Category (growth, efficiency, risk, innovation, market)
5. Priority (critical, high, medium, low)
6. Potential Impact (high, medium, low)
7. Estimated ROI percentage
8. Timeline in weeks
9. 3-5 specific action items

Format as JSON array with objects containing: title, description, rationale, category, priority, potential_impact, estimated_roi, timeline_weeks, action_items
"""
        
        response = await self._call_deepseek(api_key, system_prompt, user_prompt, temperature=0.6)
        
        if not response:
            return await self._create_sample_recommendations(org_id)
        
        recommendations = []
        try:
            import json
            start = response.find("[")
            end = response.rfind("]") + 1
            if start >= 0 and end > start:
                json_str = response[start:end]
                parsed = json.loads(json_str)
                
                for rec_data in parsed:
                    priority_map = {
                        "critical": AlertPriority.CRITICAL,
                        "high": AlertPriority.HIGH,
                        "medium": AlertPriority.MEDIUM,
                        "low": AlertPriority.LOW
                    }
                    
                    rec = StrategicRecommendation(
                        organization_id=org_id,
                        title=rec_data.get("title", "Strategic Recommendation"),
                        description=rec_data.get("description"),
                        rationale=rec_data.get("rationale"),
                        category=rec_data.get("category", "growth"),
                        priority=priority_map.get(rec_data.get("priority", "medium").lower(), AlertPriority.MEDIUM),
                        potential_impact=rec_data.get("potential_impact", "medium"),
                        estimated_roi=rec_data.get("estimated_roi"),
                        confidence_score=0.75,
                        action_items=rec_data.get("action_items", []),
                        timeline_weeks=rec_data.get("timeline_weeks"),
                        status="pending",
                        source_type="ai_generated"
                    )
                    self.db.add(rec)
                    recommendations.append(rec)
                
                await self.db.commit()
        except Exception as e:
            print(f"Failed to parse recommendations: {e}")
            return await self._create_sample_recommendations(org_id)
        
        return recommendations
    
    async def _create_sample_recommendations(self, org_id: UUID) -> List[StrategicRecommendation]:
        """Create sample recommendations when AI is unavailable."""
        sample_recs = [
            {
                "title": "Expand into Adjacent Market Segments",
                "description": "Identify and target 2-3 adjacent market segments that align with current capabilities.",
                "rationale": "Diversification reduces risk and opens new revenue streams.",
                "category": "growth",
                "priority": AlertPriority.HIGH,
                "potential_impact": "high",
                "estimated_roi": 150,
                "timeline_weeks": 12,
                "action_items": [
                    {"action": "Conduct market research on adjacent segments", "owner": "Strategy Team"},
                    {"action": "Identify top 3 target segments", "owner": "Product Team"},
                    {"action": "Develop go-to-market plan", "owner": "Marketing Team"}
                ]
            },
            {
                "title": "Implement Customer Success Program",
                "description": "Establish a proactive customer success program to reduce churn and increase expansion revenue.",
                "rationale": "Retaining existing customers is 5x cheaper than acquiring new ones.",
                "category": "efficiency",
                "priority": AlertPriority.MEDIUM,
                "potential_impact": "medium",
                "estimated_roi": 200,
                "timeline_weeks": 8,
                "action_items": [
                    {"action": "Hire Customer Success Manager", "owner": "HR"},
                    {"action": "Define success metrics and health scores", "owner": "Product"},
                    {"action": "Implement customer health monitoring", "owner": "Engineering"}
                ]
            },
            {
                "title": "Accelerate Product Innovation",
                "description": "Increase R&D investment by 20% to accelerate feature development and maintain competitive edge.",
                "rationale": "Competitors are increasing their innovation pace; we need to stay ahead.",
                "category": "innovation",
                "priority": AlertPriority.HIGH,
                "potential_impact": "high",
                "estimated_roi": 100,
                "timeline_weeks": 16,
                "action_items": [
                    {"action": "Identify key innovation areas", "owner": "Product"},
                    {"action": "Allocate additional engineering resources", "owner": "Engineering"},
                    {"action": "Establish innovation metrics", "owner": "Strategy"}
                ]
            }
        ]
        
        recommendations = []
        for rec_data in sample_recs:
            rec = StrategicRecommendation(
                organization_id=org_id,
                title=rec_data["title"],
                description=rec_data["description"],
                rationale=rec_data["rationale"],
                category=rec_data["category"],
                priority=rec_data["priority"],
                potential_impact=rec_data["potential_impact"],
                estimated_roi=rec_data["estimated_roi"],
                confidence_score=0.8,
                action_items=rec_data["action_items"],
                timeline_weeks=rec_data["timeline_weeks"],
                status="pending",
                source_type="system_generated"
            )
            self.db.add(rec)
            recommendations.append(rec)
        
        await self.db.commit()
        return recommendations
    
    async def generate_executive_narrative(
        self,
        org_id: UUID,
        summary_data: Dict[str, Any]
    ) -> Optional[str]:
        """Generate executive narrative for a summary."""
        api_key = await self._get_deepseek_key(org_id)
        if not api_key:
            return self._default_executive_narrative(summary_data)
        
        system_prompt = """You are a strategic advisor writing an executive summary for a CEO.
        Be concise, insightful, and focus on what matters most for decision-making."""
        
        user_prompt = f"""Write a brief executive narrative (3-4 paragraphs) based on this data:

Period: {summary_data.get('period_type', 'weekly')}
Key Highlights: {summary_data.get('highlights', [])}
Performance: {summary_data.get('performance', {})}
Competitive Landscape: {summary_data.get('competitive', {})}
Market Trends: {summary_data.get('trends', [])}
Risks: {summary_data.get('risks', [])}
Opportunities: {summary_data.get('opportunities', [])}

Focus on:
1. Overall business health and trajectory
2. Key wins and concerns
3. Strategic priorities for the coming period
4. Critical decisions needed
"""
        
        response = await self._call_deepseek(api_key, system_prompt, user_prompt, temperature=0.7)
        return response or self._default_executive_narrative(summary_data)
    
    def _default_executive_narrative(self, summary_data: Dict[str, Any]) -> str:
        """Return default executive narrative."""
        period = summary_data.get('period_type', 'week')
        return f"""This {period}'s performance shows steady progress across key metrics. 
        
The business continues to execute on its strategic priorities, with notable developments in customer acquisition and product development. Market conditions remain favorable, though competitive pressure continues to intensify.

Looking ahead, the focus should be on accelerating growth initiatives while maintaining operational efficiency. Key decisions around resource allocation and market expansion will be critical in the coming period.

Recommended priorities: (1) Strengthen competitive positioning, (2) Optimize customer retention, (3) Accelerate product roadmap execution."""
