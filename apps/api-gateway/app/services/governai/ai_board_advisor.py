"""
GovernAI AI Board Advisor Service
Provides AI-powered insights for board governance, meetings, and strategic decisions.
"""
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.settings import OrganizationSettings


class AIBoardAdvisor:
    """AI-powered board advisor using DeepSeek API"""
    
    DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
    
    def __init__(self, db: Session):
        self.db = db
    
    async def _get_deepseek_key(self, organization_id: str) -> Optional[str]:
        """Get DeepSeek API key from organization settings"""
        settings = self.db.query(OrganizationSettings).filter(
            OrganizationSettings.organization_id == organization_id,
            OrganizationSettings.setting_key == "deepseek_api_key"
        ).first()
        return settings.setting_value if settings else None
    
    async def _call_deepseek(
        self, 
        api_key: str, 
        system_prompt: str, 
        user_prompt: str,
        temperature: float = 0.7
    ) -> str:
        """Call DeepSeek API for AI completion"""
        async with httpx.AsyncClient() as client:
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
                },
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def generate_meeting_brief(
        self,
        organization_id: str,
        meeting_data: Dict[str, Any],
        company_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate AI-powered meeting preparation brief"""
        api_key = await self._get_deepseek_key(organization_id)
        
        if not api_key:
            return self._generate_mock_meeting_brief(meeting_data)
        
        system_prompt = """You are an expert board secretary and corporate governance advisor. 
        Generate comprehensive meeting preparation briefs that help board members prepare effectively.
        Focus on key discussion points, potential questions, and strategic considerations."""
        
        user_prompt = f"""Generate a board meeting preparation brief for the following meeting:

Meeting Title: {meeting_data.get('title')}
Meeting Type: {meeting_data.get('meeting_type')}
Date: {meeting_data.get('scheduled_date')}
Agenda Items: {meeting_data.get('agenda_items', [])}

Company Context: {company_context or 'General corporate context'}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Discussion Points for each agenda item
3. Potential Questions board members should consider
4. Strategic Considerations
5. Recommended Pre-reading materials
6. Risk Factors to address"""

        try:
            response = await self._call_deepseek(api_key, system_prompt, user_prompt)
            return {
                "brief": response,
                "generated_at": datetime.utcnow().isoformat(),
                "ai_powered": True
            }
        except Exception as e:
            return self._generate_mock_meeting_brief(meeting_data)
    
    async def analyze_resolution(
        self,
        organization_id: str,
        resolution_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze a board resolution and provide recommendations"""
        api_key = await self._get_deepseek_key(organization_id)
        
        if not api_key:
            return self._generate_mock_resolution_analysis(resolution_data)
        
        system_prompt = """You are a corporate governance expert and legal advisor.
        Analyze board resolutions for potential risks, compliance issues, and strategic implications.
        Provide balanced, objective analysis to help board members make informed decisions."""
        
        user_prompt = f"""Analyze the following board resolution:

Title: {resolution_data.get('title')}
Description: {resolution_data.get('description')}
Type: {resolution_data.get('resolution_type')}

Please provide:
1. Summary of the resolution
2. Potential benefits
3. Potential risks and concerns
4. Legal and compliance considerations
5. Stakeholder impact analysis
6. Recommendation (support/oppose/modify) with reasoning"""

        try:
            response = await self._call_deepseek(api_key, system_prompt, user_prompt)
            return {
                "analysis": response,
                "generated_at": datetime.utcnow().isoformat(),
                "ai_powered": True
            }
        except Exception as e:
            return self._generate_mock_resolution_analysis(resolution_data)
    
    async def generate_governance_report(
        self,
        organization_id: str,
        governance_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate AI-powered governance health report"""
        api_key = await self._get_deepseek_key(organization_id)
        
        if not api_key:
            return self._generate_mock_governance_report(governance_data)
        
        system_prompt = """You are a corporate governance expert specializing in board effectiveness.
        Generate comprehensive governance health reports that identify strengths, weaknesses, and improvement opportunities."""
        
        user_prompt = f"""Generate a governance health report based on the following data:

Board Composition:
- Total Members: {governance_data.get('total_members', 0)}
- Independent Directors: {governance_data.get('independent_directors', 0)}
- Average Tenure: {governance_data.get('avg_tenure', 'N/A')} years

Meeting Statistics:
- Meetings Held (YTD): {governance_data.get('meetings_held', 0)}
- Average Attendance: {governance_data.get('avg_attendance', 0)}%
- Resolutions Passed: {governance_data.get('resolutions_passed', 0)}

Compliance Status:
- Compliance Rate: {governance_data.get('compliance_rate', 0)}%
- Open Issues: {governance_data.get('open_issues', 0)}

Please provide:
1. Governance Health Score (0-100)
2. Key Strengths
3. Areas for Improvement
4. Benchmark Comparison (vs industry standards)
5. Recommended Actions
6. Risk Assessment"""

        try:
            response = await self._call_deepseek(api_key, system_prompt, user_prompt)
            return {
                "report": response,
                "generated_at": datetime.utcnow().isoformat(),
                "ai_powered": True
            }
        except Exception as e:
            return self._generate_mock_governance_report(governance_data)
    
    def _generate_mock_meeting_brief(self, meeting_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock meeting brief when AI is not available"""
        return {
            "brief": f"""## Meeting Preparation Brief

### Executive Summary
This {meeting_data.get('meeting_type', 'board')} meeting scheduled for {meeting_data.get('scheduled_date', 'TBD')} will cover key strategic and operational matters requiring board attention.

### Key Discussion Points
1. Review of previous meeting minutes and action items
2. Financial performance update and Q&A
3. Strategic initiatives progress review
4. Risk management and compliance updates
5. Any other business

### Potential Questions to Consider
- What are the key risks facing the organization?
- Are we on track to meet our strategic objectives?
- What resources are needed to address current challenges?

### Strategic Considerations
- Market conditions and competitive landscape
- Regulatory environment changes
- Stakeholder expectations and engagement

### Recommended Pre-reading
- Previous board meeting minutes
- Latest financial statements
- Management reports and dashboards

### Risk Factors
- Ensure quorum requirements are met
- Review any conflicts of interest
- Consider confidentiality of sensitive discussions""",
            "generated_at": datetime.utcnow().isoformat(),
            "ai_powered": False,
            "note": "Configure DeepSeek API key in Settings for AI-powered briefs"
        }
    
    def _generate_mock_resolution_analysis(self, resolution_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock resolution analysis when AI is not available"""
        return {
            "analysis": f"""## Resolution Analysis

### Summary
Resolution: {resolution_data.get('title', 'Untitled')}
Type: {resolution_data.get('resolution_type', 'General')}

### Potential Benefits
- Supports organizational objectives
- Aligns with strategic direction
- Addresses identified needs

### Potential Risks
- Implementation challenges
- Resource requirements
- Timeline considerations

### Legal and Compliance
- Review for regulatory compliance
- Ensure proper authorization levels
- Document decision rationale

### Stakeholder Impact
- Consider employee implications
- Assess shareholder interests
- Evaluate customer/partner effects

### Recommendation
Review the resolution carefully and consider all stakeholder perspectives before voting.""",
            "generated_at": datetime.utcnow().isoformat(),
            "ai_powered": False,
            "note": "Configure DeepSeek API key in Settings for AI-powered analysis"
        }
    
    def _generate_mock_governance_report(self, governance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock governance report when AI is not available"""
        compliance_rate = governance_data.get('compliance_rate', 75)
        health_score = min(100, int(compliance_rate * 0.9 + 10))
        
        return {
            "report": f"""## Governance Health Report

### Overall Health Score: {health_score}/100

### Key Strengths
- Regular board meeting cadence
- Documented governance policies
- Active committee structure

### Areas for Improvement
- Increase board diversity
- Enhance succession planning
- Strengthen risk oversight

### Benchmark Comparison
- Meeting frequency: At industry standard
- Board independence: Review recommended
- Committee structure: Adequate

### Recommended Actions
1. Conduct board effectiveness review
2. Update governance policies annually
3. Enhance director onboarding program
4. Implement board evaluation process

### Risk Assessment
- Governance Risk Level: Moderate
- Key Focus Areas: Compliance, Succession, Diversity""",
            "generated_at": datetime.utcnow().isoformat(),
            "ai_powered": False,
            "health_score": health_score,
            "note": "Configure DeepSeek API key in Settings for AI-powered reports"
        }
