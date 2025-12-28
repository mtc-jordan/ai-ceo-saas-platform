"""Scenario Planning Service for What-If Analysis."""
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload

from app.models.athena import Scenario, ScenarioVersion, ScenarioComparison
from app.models.athena import ScenarioType, ScenarioStatus
from app.schemas.athena import (
    ScenarioCreate, ScenarioUpdate, ScenarioResponse,
    ScenarioAnalysisRequest, ScenarioAnalysisResponse, ScenarioOutcome
)


class ScenarioService:
    """Service for managing scenarios and what-if analysis."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_scenario(
        self,
        org_id: UUID,
        user_id: UUID,
        data: ScenarioCreate
    ) -> Scenario:
        """Create a new scenario."""
        scenario = Scenario(
            organization_id=org_id,
            created_by_id=user_id,
            name=data.name,
            description=data.description,
            scenario_type=data.scenario_type,
            time_horizon_months=data.time_horizon_months,
            base_assumptions=data.base_assumptions,
            variables=data.variables,
            tags=data.tags,
            status=ScenarioStatus.DRAFT
        )
        self.db.add(scenario)
        await self.db.commit()
        await self.db.refresh(scenario)
        return scenario

    async def get_scenario(self, scenario_id: UUID, org_id: UUID) -> Optional[Scenario]:
        """Get a scenario by ID."""
        result = await self.db.execute(
            select(Scenario)
            .where(Scenario.id == scenario_id)
            .where(Scenario.organization_id == org_id)
        )
        return result.scalar_one_or_none()

    async def list_scenarios(
        self,
        org_id: UUID,
        scenario_type: Optional[ScenarioType] = None,
        status: Optional[ScenarioStatus] = None,
        is_favorite: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Scenario]:
        """List scenarios for an organization."""
        query = select(Scenario).where(Scenario.organization_id == org_id)
        
        if scenario_type:
            query = query.where(Scenario.scenario_type == scenario_type)
        if status:
            query = query.where(Scenario.status == status)
        if is_favorite is not None:
            query = query.where(Scenario.is_favorite == is_favorite)
        
        query = query.order_by(Scenario.updated_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_scenario(
        self,
        scenario_id: UUID,
        org_id: UUID,
        data: ScenarioUpdate
    ) -> Optional[Scenario]:
        """Update a scenario."""
        scenario = await self.get_scenario(scenario_id, org_id)
        if not scenario:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(scenario, key, value)
        
        scenario.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(scenario)
        return scenario

    async def delete_scenario(self, scenario_id: UUID, org_id: UUID) -> bool:
        """Delete a scenario."""
        result = await self.db.execute(
            delete(Scenario)
            .where(Scenario.id == scenario_id)
            .where(Scenario.organization_id == org_id)
        )
        await self.db.commit()
        return result.rowcount > 0

    async def analyze_scenario(
        self,
        scenario: Scenario,
        variables: List[Dict[str, Any]],
        ai_service: Optional[Any] = None
    ) -> ScenarioAnalysisResponse:
        """Perform what-if analysis on a scenario."""
        # Update scenario status
        scenario.status = ScenarioStatus.ANALYZING
        await self.db.commit()
        
        # Calculate outcomes based on variables
        outcomes = await self._calculate_outcomes(scenario, variables)
        
        # Generate AI analysis if service provided
        ai_analysis = None
        ai_recommendations = []
        
        if ai_service:
            analysis_result = await ai_service.analyze_scenario(
                scenario_type=scenario.scenario_type,
                base_assumptions=scenario.base_assumptions,
                variables=variables,
                outcomes=[o.model_dump() for o in outcomes],
                time_horizon=scenario.time_horizon_months
            )
            ai_analysis = analysis_result.get("analysis")
            ai_recommendations = analysis_result.get("recommendations", [])
        
        # Update scenario with results
        scenario.variables = variables
        scenario.outcomes = {"outcomes": [o.model_dump() for o in outcomes]}
        scenario.ai_analysis = ai_analysis
        scenario.ai_recommendations = ai_recommendations
        scenario.status = ScenarioStatus.COMPLETED
        await self.db.commit()
        
        # Create version
        await self._create_version(scenario, variables, scenario.outcomes)
        
        return ScenarioAnalysisResponse(
            outcomes=outcomes,
            ai_analysis=ai_analysis,
            ai_recommendations=ai_recommendations,
            confidence_score=self._calculate_confidence(outcomes),
            warnings=self._generate_warnings(outcomes)
        )

    async def _calculate_outcomes(
        self,
        scenario: Scenario,
        variables: List[Dict[str, Any]]
    ) -> List[ScenarioOutcome]:
        """Calculate projected outcomes based on variable changes."""
        outcomes = []
        
        # Get base metrics from assumptions
        base = scenario.base_assumptions or {}
        base_revenue = base.get("revenue", 1000000)
        base_costs = base.get("costs", 600000)
        base_customers = base.get("customers", 1000)
        base_churn = base.get("churn_rate", 0.05)
        base_growth = base.get("growth_rate", 0.10)
        
        # Apply variable modifications
        revenue_multiplier = 1.0
        cost_multiplier = 1.0
        customer_multiplier = 1.0
        churn_modifier = 0
        growth_modifier = 0
        
        for var in variables:
            name = var.get("name", "")
            current = var.get("current_value", 0)
            modified = var.get("modified_value", 0)
            
            if current == 0:
                continue
                
            change_ratio = modified / current if current != 0 else 1
            
            if "price" in name.lower():
                # Price increase affects revenue but may reduce customers
                revenue_multiplier *= change_ratio
                customer_multiplier *= (2 - change_ratio) * 0.5 + 0.5  # Inverse relationship
            elif "marketing" in name.lower() or "acquisition" in name.lower():
                # Marketing spend affects customer growth
                growth_modifier += (change_ratio - 1) * 0.5
                cost_multiplier *= 1 + (change_ratio - 1) * 0.3
            elif "cost" in name.lower() or "expense" in name.lower():
                cost_multiplier *= change_ratio
            elif "churn" in name.lower():
                churn_modifier = modified - current
            elif "growth" in name.lower():
                growth_modifier += modified - current
            elif "headcount" in name.lower() or "employee" in name.lower():
                cost_multiplier *= 1 + (change_ratio - 1) * 0.4
        
        # Calculate projected values over time horizon
        months = scenario.time_horizon_months
        years = months / 12
        
        # Project revenue
        projected_growth = base_growth + growth_modifier
        projected_customers = base_customers * customer_multiplier * ((1 + projected_growth) ** years)
        projected_revenue = base_revenue * revenue_multiplier * ((1 + projected_growth) ** years)
        
        # Project costs
        projected_costs = base_costs * cost_multiplier * ((1 + 0.03) ** years)  # 3% inflation
        
        # Project profit
        base_profit = base_revenue - base_costs
        projected_profit = projected_revenue - projected_costs
        
        # Project churn impact
        projected_churn = base_churn + churn_modifier
        retention_impact = (1 - projected_churn) ** years / (1 - base_churn) ** years
        
        # Create outcome objects
        outcomes.append(ScenarioOutcome(
            metric="revenue",
            display_name="Annual Revenue",
            baseline_value=base_revenue,
            projected_value=round(projected_revenue, 2),
            change_percent=round((projected_revenue / base_revenue - 1) * 100, 1),
            confidence=0.85,
            unit="$"
        ))
        
        outcomes.append(ScenarioOutcome(
            metric="profit",
            display_name="Annual Profit",
            baseline_value=base_profit,
            projected_value=round(projected_profit, 2),
            change_percent=round((projected_profit / base_profit - 1) * 100, 1) if base_profit != 0 else 0,
            confidence=0.75,
            unit="$"
        ))
        
        outcomes.append(ScenarioOutcome(
            metric="customers",
            display_name="Total Customers",
            baseline_value=base_customers,
            projected_value=round(projected_customers * retention_impact),
            change_percent=round((projected_customers * retention_impact / base_customers - 1) * 100, 1),
            confidence=0.70,
            unit=""
        ))
        
        outcomes.append(ScenarioOutcome(
            metric="margin",
            display_name="Profit Margin",
            baseline_value=round((base_profit / base_revenue) * 100, 1),
            projected_value=round((projected_profit / projected_revenue) * 100, 1) if projected_revenue != 0 else 0,
            change_percent=round(((projected_profit / projected_revenue) - (base_profit / base_revenue)) * 100, 1) if projected_revenue != 0 and base_revenue != 0 else 0,
            confidence=0.80,
            unit="%"
        ))
        
        outcomes.append(ScenarioOutcome(
            metric="growth_rate",
            display_name="Growth Rate",
            baseline_value=round(base_growth * 100, 1),
            projected_value=round(projected_growth * 100, 1),
            change_percent=round((projected_growth - base_growth) * 100, 1),
            confidence=0.65,
            unit="%"
        ))
        
        return outcomes

    async def _create_version(
        self,
        scenario: Scenario,
        variables: List[Dict[str, Any]],
        outcomes: Dict[str, Any]
    ) -> ScenarioVersion:
        """Create a version snapshot of the scenario."""
        # Get current version count
        result = await self.db.execute(
            select(ScenarioVersion)
            .where(ScenarioVersion.scenario_id == scenario.id)
            .order_by(ScenarioVersion.version_number.desc())
            .limit(1)
        )
        latest = result.scalar_one_or_none()
        version_number = (latest.version_number + 1) if latest else 1
        
        version = ScenarioVersion(
            scenario_id=scenario.id,
            version_number=version_number,
            variables=variables,
            outcomes=outcomes
        )
        self.db.add(version)
        await self.db.commit()
        return version

    def _calculate_confidence(self, outcomes: List[ScenarioOutcome]) -> float:
        """Calculate overall confidence score."""
        if not outcomes:
            return 0.5
        return sum(o.confidence for o in outcomes) / len(outcomes)

    def _generate_warnings(self, outcomes: List[ScenarioOutcome]) -> List[str]:
        """Generate warnings based on outcomes."""
        warnings = []
        
        for outcome in outcomes:
            if outcome.metric == "profit" and outcome.projected_value < 0:
                warnings.append("Warning: Projected profit is negative. Review cost assumptions.")
            if outcome.metric == "margin" and outcome.projected_value < 10:
                warnings.append("Warning: Profit margin below 10%. Consider pricing adjustments.")
            if outcome.metric == "customers" and outcome.change_percent < -20:
                warnings.append("Warning: Significant customer loss projected. Review churn factors.")
            if outcome.confidence < 0.5:
                warnings.append(f"Low confidence in {outcome.display_name} projection. More data needed.")
        
        return warnings

    async def compare_scenarios(
        self,
        org_id: UUID,
        scenario_ids: List[UUID],
        name: str,
        ai_service: Optional[Any] = None
    ) -> ScenarioComparison:
        """Compare multiple scenarios."""
        scenarios = []
        for sid in scenario_ids:
            s = await self.get_scenario(sid, org_id)
            if s:
                scenarios.append(s)
        
        # Build comparison metrics
        comparison_metrics = []
        for metric in ["revenue", "profit", "customers", "margin", "growth_rate"]:
            metric_data = {
                "metric": metric,
                "scenarios": []
            }
            for s in scenarios:
                outcomes = s.outcomes.get("outcomes", []) if s.outcomes else []
                for o in outcomes:
                    if o.get("metric") == metric:
                        metric_data["scenarios"].append({
                            "scenario_id": str(s.id),
                            "scenario_name": s.name,
                            "baseline": o.get("baseline_value"),
                            "projected": o.get("projected_value"),
                            "change_percent": o.get("change_percent")
                        })
            comparison_metrics.append(metric_data)
        
        # Generate AI recommendation if service provided
        ai_recommendation = None
        if ai_service and scenarios:
            ai_recommendation = await ai_service.compare_scenarios(
                [{"name": s.name, "outcomes": s.outcomes} for s in scenarios]
            )
        
        comparison = ScenarioComparison(
            organization_id=org_id,
            name=name,
            scenario_ids=scenario_ids,
            comparison_metrics=comparison_metrics,
            ai_recommendation=ai_recommendation
        )
        self.db.add(comparison)
        await self.db.commit()
        await self.db.refresh(comparison)
        return comparison

    @staticmethod
    def get_scenario_templates() -> List[Dict[str, Any]]:
        """Get predefined scenario templates."""
        return [
            {
                "type": ScenarioType.GROWTH,
                "name": "Revenue Growth Scenario",
                "description": "Analyze impact of growth initiatives on revenue",
                "suggested_variables": [
                    {"name": "price_increase", "display_name": "Price Increase %", "default": 10, "unit": "%"},
                    {"name": "marketing_budget", "display_name": "Marketing Budget", "default": 100000, "unit": "$"},
                    {"name": "sales_headcount", "display_name": "Sales Team Size", "default": 10, "unit": "people"},
                ]
            },
            {
                "type": ScenarioType.COST_REDUCTION,
                "name": "Cost Optimization Scenario",
                "description": "Analyze impact of cost reduction measures",
                "suggested_variables": [
                    {"name": "headcount_reduction", "display_name": "Headcount Reduction %", "default": 10, "unit": "%"},
                    {"name": "vendor_renegotiation", "display_name": "Vendor Cost Savings", "default": 50000, "unit": "$"},
                    {"name": "automation_investment", "display_name": "Automation Investment", "default": 100000, "unit": "$"},
                ]
            },
            {
                "type": ScenarioType.MARKET_EXPANSION,
                "name": "Market Expansion Scenario",
                "description": "Analyze entering new markets or segments",
                "suggested_variables": [
                    {"name": "new_market_tam", "display_name": "New Market TAM", "default": 10000000, "unit": "$"},
                    {"name": "market_entry_cost", "display_name": "Market Entry Cost", "default": 500000, "unit": "$"},
                    {"name": "expected_market_share", "display_name": "Expected Market Share %", "default": 5, "unit": "%"},
                ]
            },
            {
                "type": ScenarioType.PRICING,
                "name": "Pricing Strategy Scenario",
                "description": "Analyze different pricing strategies",
                "suggested_variables": [
                    {"name": "price_change", "display_name": "Price Change %", "default": 0, "unit": "%"},
                    {"name": "expected_churn_impact", "display_name": "Churn Impact %", "default": 2, "unit": "%"},
                    {"name": "new_tier_adoption", "display_name": "New Tier Adoption %", "default": 20, "unit": "%"},
                ]
            },
        ]
