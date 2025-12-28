"""
AI-powered Lean Six Sigma Advisor Service
Provides intelligent recommendations for process improvement
"""

import httpx
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.settings import OrganizationSettings


class LeanSixSigmaAIService:
    """AI service for Lean Six Sigma recommendations using DeepSeek"""
    
    DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
    
    def __init__(self, db: Session, organization_id: str):
        self.db = db
        self.organization_id = organization_id
    
    async def _get_deepseek_key(self) -> Optional[str]:
        """Get DeepSeek API key from organization settings"""
        settings = self.db.query(OrganizationSettings).filter(
            OrganizationSettings.organization_id == self.organization_id,
            OrganizationSettings.setting_key == "deepseek_api_key"
        ).first()
        return settings.setting_value if settings else None
    
    async def _call_deepseek(self, prompt: str, system_prompt: str) -> Optional[str]:
        """Call DeepSeek API for AI-powered analysis"""
        api_key = await self._get_deepseek_key()
        if not api_key:
            return None
        
        try:
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
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2000
                    },
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"DeepSeek API error: {e}")
        
        return None
    
    async def analyze_dmaic_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a DMAIC project and provide recommendations"""
        system_prompt = """You are an expert Lean Six Sigma Black Belt consultant. 
        Analyze the DMAIC project data and provide actionable recommendations.
        Focus on practical, measurable improvements.
        Structure your response with clear sections for each DMAIC phase."""
        
        prompt = f"""
        Analyze this DMAIC project and provide recommendations:
        
        Project Name: {project_data.get('name', 'N/A')}
        Current Phase: {project_data.get('current_phase', 'N/A')}
        Problem Statement: {project_data.get('problem_statement', 'N/A')}
        Goal Statement: {project_data.get('goal_statement', 'N/A')}
        Baseline Metrics: {project_data.get('baseline_metrics', {})}
        Target Metrics: {project_data.get('target_metrics', {})}
        
        Please provide:
        1. Assessment of current project status
        2. Recommended next steps for the current phase
        3. Potential risks and mitigation strategies
        4. Suggested tools and techniques to apply
        5. Expected timeline for completion
        """
        
        response = await self._call_deepseek(prompt, system_prompt)
        
        return {
            "analysis": response or "AI analysis unavailable. Please configure your DeepSeek API key in Settings.",
            "recommendations": self._extract_recommendations(response) if response else [],
            "risk_level": self._assess_risk_level(project_data),
            "suggested_tools": self._suggest_tools(project_data.get('current_phase', 'define'))
        }
    
    async def analyze_waste(self, waste_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze waste data and provide reduction recommendations"""
        system_prompt = """You are a Lean manufacturing expert specializing in waste reduction.
        Analyze the waste data using TIMWOODS framework and provide specific reduction strategies.
        Focus on quick wins and high-impact improvements."""
        
        waste_summary = "\n".join([
            f"- {w.get('waste_type', 'Unknown')}: {w.get('description', 'N/A')} "
            f"(Impact: ${w.get('estimated_cost', 0):,.0f}, Frequency: {w.get('frequency', 'N/A')})"
            for w in waste_data[:10]  # Limit to top 10
        ])
        
        prompt = f"""
        Analyze this waste data and provide reduction strategies:
        
        Identified Wastes:
        {waste_summary}
        
        Please provide:
        1. Prioritized list of wastes to address (based on impact and ease of elimination)
        2. Specific countermeasures for each waste type
        3. Expected savings from waste reduction
        4. Implementation timeline
        5. Key performance indicators to track progress
        """
        
        response = await self._call_deepseek(prompt, system_prompt)
        
        return {
            "analysis": response or "AI analysis unavailable. Please configure your DeepSeek API key in Settings.",
            "priority_wastes": self._prioritize_wastes(waste_data),
            "total_potential_savings": sum(w.get('estimated_cost', 0) for w in waste_data)
        }
    
    async def suggest_kaizen_improvements(self, process_data: Dict[str, Any]) -> Dict[str, Any]:
        """Suggest Kaizen improvements for a process"""
        system_prompt = """You are a Kaizen facilitator with expertise in continuous improvement.
        Analyze the process data and suggest practical Kaizen improvements.
        Focus on small, incremental changes that can be implemented quickly."""
        
        prompt = f"""
        Suggest Kaizen improvements for this process:
        
        Process Name: {process_data.get('name', 'N/A')}
        Current Cycle Time: {process_data.get('cycle_time', 'N/A')} minutes
        Current Defect Rate: {process_data.get('defect_rate', 'N/A')}%
        Current OEE: {process_data.get('oee', 'N/A')}%
        
        Pain Points:
        {process_data.get('pain_points', 'Not specified')}
        
        Please provide:
        1. Top 5 quick-win Kaizen improvements
        2. Expected impact of each improvement
        3. Resources required for implementation
        4. Suggested Kaizen event type (Blitz, Gemba Walk, 5S, etc.)
        5. Success metrics to track
        """
        
        response = await self._call_deepseek(prompt, system_prompt)
        
        return {
            "suggestions": response or "AI suggestions unavailable. Please configure your DeepSeek API key in Settings.",
            "recommended_event_type": self._recommend_event_type(process_data),
            "estimated_improvement": self._estimate_improvement(process_data)
        }
    
    async def perform_root_cause_analysis(self, problem_data: Dict[str, Any]) -> Dict[str, Any]:
        """AI-assisted root cause analysis"""
        system_prompt = """You are a problem-solving expert trained in root cause analysis techniques.
        Use the 5 Whys and Fishbone (Ishikawa) diagram approaches to identify root causes.
        Provide clear, actionable corrective actions."""
        
        prompt = f"""
        Perform root cause analysis for this problem:
        
        Problem Statement: {problem_data.get('problem_statement', 'N/A')}
        When it occurs: {problem_data.get('when', 'N/A')}
        Where it occurs: {problem_data.get('where', 'N/A')}
        Impact: {problem_data.get('impact', 'N/A')}
        
        Please provide:
        1. 5 Whys analysis (drill down to root cause)
        2. Fishbone diagram categories (Man, Machine, Method, Material, Measurement, Environment)
        3. Most likely root cause(s)
        4. Recommended corrective actions
        5. Preventive measures to avoid recurrence
        """
        
        response = await self._call_deepseek(prompt, system_prompt)
        
        return {
            "analysis": response or "AI analysis unavailable. Please configure your DeepSeek API key in Settings.",
            "suggested_five_whys": self._generate_five_whys_template(problem_data),
            "fishbone_categories": self._generate_fishbone_template()
        }
    
    async def calculate_process_capability(self, measurement_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate and interpret process capability indices"""
        system_prompt = """You are a statistical process control expert.
        Analyze the measurement data and calculate process capability indices.
        Provide interpretation and improvement recommendations."""
        
        prompt = f"""
        Analyze process capability for this data:
        
        Process: {measurement_data.get('process_name', 'N/A')}
        USL (Upper Spec Limit): {measurement_data.get('usl', 'N/A')}
        LSL (Lower Spec Limit): {measurement_data.get('lsl', 'N/A')}
        Mean: {measurement_data.get('mean', 'N/A')}
        Standard Deviation: {measurement_data.get('std_dev', 'N/A')}
        Sample Size: {measurement_data.get('sample_size', 'N/A')}
        
        Please provide:
        1. Cp and Cpk calculations
        2. Interpretation of capability indices
        3. Sigma level assessment
        4. Recommendations for improvement
        5. Expected defect rate (DPMO)
        """
        
        response = await self._call_deepseek(prompt, system_prompt)
        
        # Calculate basic capability indices if data is available
        capability_metrics = self._calculate_capability_metrics(measurement_data)
        
        return {
            "analysis": response or "AI analysis unavailable. Please configure your DeepSeek API key in Settings.",
            "metrics": capability_metrics
        }
    
    def _extract_recommendations(self, response: Optional[str]) -> List[str]:
        """Extract key recommendations from AI response"""
        if not response:
            return []
        
        recommendations = []
        lines = response.split('\n')
        for line in lines:
            line = line.strip()
            if line and (line.startswith('-') or line.startswith('•') or 
                        (len(line) > 2 and line[0].isdigit() and line[1] in '.)')):
                recommendations.append(line.lstrip('-•0123456789.) '))
        
        return recommendations[:10]  # Limit to top 10
    
    def _assess_risk_level(self, project_data: Dict[str, Any]) -> str:
        """Assess project risk level based on data"""
        phase = project_data.get('current_phase', 'define').lower()
        
        # Higher risk in later phases if metrics aren't improving
        baseline = project_data.get('baseline_metrics', {})
        current = project_data.get('current_metrics', {})
        
        if phase in ['improve', 'control'] and baseline == current:
            return 'high'
        elif phase in ['analyze', 'improve']:
            return 'medium'
        return 'low'
    
    def _suggest_tools(self, phase: str) -> List[str]:
        """Suggest appropriate tools for each DMAIC phase"""
        tools = {
            'define': ['Project Charter', 'SIPOC', 'Voice of Customer', 'CTQ Tree', 'Stakeholder Analysis'],
            'measure': ['Data Collection Plan', 'MSA', 'Process Mapping', 'Pareto Chart', 'Run Chart'],
            'analyze': ['Fishbone Diagram', '5 Whys', 'Hypothesis Testing', 'Regression Analysis', 'FMEA'],
            'improve': ['Brainstorming', 'Pugh Matrix', 'Pilot Testing', 'DOE', 'Mistake Proofing'],
            'control': ['Control Charts', 'Control Plan', 'Standard Work', 'Training Plan', 'Response Plan']
        }
        return tools.get(phase.lower(), tools['define'])
    
    def _prioritize_wastes(self, waste_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Prioritize wastes by impact and frequency"""
        scored_wastes = []
        for waste in waste_data:
            cost = waste.get('estimated_cost', 0)
            freq_score = {'daily': 5, 'weekly': 3, 'monthly': 2, 'occasional': 1}.get(
                waste.get('frequency', 'occasional'), 1
            )
            score = cost * freq_score
            scored_wastes.append({**waste, 'priority_score': score})
        
        return sorted(scored_wastes, key=lambda x: x['priority_score'], reverse=True)[:5]
    
    def _recommend_event_type(self, process_data: Dict[str, Any]) -> str:
        """Recommend appropriate Kaizen event type"""
        oee = process_data.get('oee', 100)
        defect_rate = process_data.get('defect_rate', 0)
        
        if oee < 60:
            return 'kaizen_blitz'
        elif defect_rate > 5:
            return 'standard_work'
        elif process_data.get('disorganized', False):
            return '5s_event'
        else:
            return 'gemba_walk'
    
    def _estimate_improvement(self, process_data: Dict[str, Any]) -> Dict[str, Any]:
        """Estimate potential improvement percentages"""
        return {
            'cycle_time_reduction': '15-25%',
            'defect_reduction': '30-50%',
            'oee_improvement': '10-20%',
            'cost_savings': '10-15%'
        }
    
    def _generate_five_whys_template(self, problem_data: Dict[str, Any]) -> List[str]:
        """Generate a 5 Whys template based on problem"""
        problem = problem_data.get('problem_statement', 'the problem')
        return [
            f"Why does {problem} occur?",
            "Why does [answer to Why 1] happen?",
            "Why does [answer to Why 2] happen?",
            "Why does [answer to Why 3] happen?",
            "Why does [answer to Why 4] happen? (Root Cause)"
        ]
    
    def _generate_fishbone_template(self) -> Dict[str, List[str]]:
        """Generate a Fishbone diagram template"""
        return {
            'man': ['Training', 'Experience', 'Motivation', 'Fatigue'],
            'machine': ['Age', 'Maintenance', 'Calibration', 'Capability'],
            'method': ['Procedures', 'Standards', 'Documentation', 'Sequence'],
            'material': ['Quality', 'Specifications', 'Storage', 'Handling'],
            'measurement': ['Accuracy', 'Precision', 'Calibration', 'Method'],
            'environment': ['Temperature', 'Humidity', 'Lighting', 'Cleanliness']
        }
    
    def _calculate_capability_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate process capability metrics"""
        try:
            usl = float(data.get('usl', 0))
            lsl = float(data.get('lsl', 0))
            mean = float(data.get('mean', 0))
            std_dev = float(data.get('std_dev', 1))
            
            if std_dev == 0:
                return {'error': 'Standard deviation cannot be zero'}
            
            cp = (usl - lsl) / (6 * std_dev)
            cpu = (usl - mean) / (3 * std_dev)
            cpl = (mean - lsl) / (3 * std_dev)
            cpk = min(cpu, cpl)
            
            # Sigma level approximation
            sigma_level = cpk * 3
            
            return {
                'cp': round(cp, 3),
                'cpk': round(cpk, 3),
                'cpu': round(cpu, 3),
                'cpl': round(cpl, 3),
                'sigma_level': round(sigma_level, 2),
                'interpretation': self._interpret_cpk(cpk)
            }
        except (ValueError, TypeError):
            return {'error': 'Invalid measurement data'}
    
    def _interpret_cpk(self, cpk: float) -> str:
        """Interpret Cpk value"""
        if cpk >= 2.0:
            return 'World Class (Six Sigma)'
        elif cpk >= 1.67:
            return 'Excellent'
        elif cpk >= 1.33:
            return 'Good'
        elif cpk >= 1.0:
            return 'Capable but needs improvement'
        else:
            return 'Not capable - immediate action required'
