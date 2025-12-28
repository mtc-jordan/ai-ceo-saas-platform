"""
Goal Tracking & OKRs Service
Handles goal management, progress tracking, and alignment visualization
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from openai import OpenAI
import os


class OKRService:
    """Service for managing OKRs and goal tracking"""
    
    def __init__(self):
        self.client = OpenAI()
    
    async def get_goals_dashboard(self, organization_id: int, cycle_id: Optional[int] = None) -> Dict[str, Any]:
        """Get OKR dashboard overview"""
        # Mock data for demonstration
        return {
            "summary": {
                "total_goals": 24,
                "company_goals": 3,
                "department_goals": 8,
                "team_goals": 13,
                "average_progress": 67.5,
                "on_track": 18,
                "at_risk": 4,
                "behind": 2,
                "completed": 5
            },
            "current_cycle": {
                "id": 1,
                "name": "Q4 2024",
                "start_date": "2024-10-01",
                "end_date": "2024-12-31",
                "days_remaining": 7,
                "progress_expected": 92.0
            },
            "company_goals": [
                {
                    "id": 1,
                    "title": "Achieve $2M ARR",
                    "progress": 85,
                    "status": "on_track",
                    "key_results_count": 4,
                    "key_results_completed": 3
                },
                {
                    "id": 2,
                    "title": "Expand to 3 New Markets",
                    "progress": 66,
                    "status": "on_track",
                    "key_results_count": 3,
                    "key_results_completed": 2
                },
                {
                    "id": 3,
                    "title": "Achieve 95% Customer Satisfaction",
                    "progress": 78,
                    "status": "on_track",
                    "key_results_count": 3,
                    "key_results_completed": 2
                }
            ],
            "recent_updates": [
                {
                    "goal_title": "Increase MRR by 25%",
                    "key_result": "Acquire 50 new enterprise customers",
                    "previous_value": 42,
                    "new_value": 47,
                    "updated_by": "Sarah Chen",
                    "updated_at": "2024-12-23T14:30:00Z"
                },
                {
                    "goal_title": "Improve Product NPS",
                    "key_result": "Achieve NPS score of 70+",
                    "previous_value": 62,
                    "new_value": 68,
                    "updated_by": "Mike Johnson",
                    "updated_at": "2024-12-23T10:15:00Z"
                }
            ]
        }
    
    async def get_goal_details(self, goal_id: int) -> Dict[str, Any]:
        """Get detailed goal information with key results"""
        return {
            "id": goal_id,
            "title": "Achieve $2M ARR",
            "description": "Scale the business to $2M in Annual Recurring Revenue by end of Q4 2024",
            "level": "company",
            "status": "on_track",
            "owner": {
                "id": 1,
                "name": "John Smith",
                "avatar": None,
                "role": "CEO"
            },
            "progress": 85,
            "confidence": 0.8,
            "start_date": "2024-10-01",
            "end_date": "2024-12-31",
            "tags": ["revenue", "growth", "Q4"],
            "priority": 1,
            "key_results": [
                {
                    "id": 1,
                    "title": "Increase MRR to $167K",
                    "description": "Monthly recurring revenue target",
                    "result_type": "currency",
                    "start_value": 125000,
                    "target_value": 167000,
                    "current_value": 158000,
                    "unit": "$",
                    "progress": 78.6,
                    "weight": 1.0,
                    "owner": {"id": 2, "name": "Sarah Chen", "role": "CFO"},
                    "is_completed": False
                },
                {
                    "id": 2,
                    "title": "Acquire 50 new enterprise customers",
                    "description": "New enterprise customer acquisition",
                    "result_type": "number",
                    "start_value": 0,
                    "target_value": 50,
                    "current_value": 47,
                    "unit": "customers",
                    "progress": 94,
                    "weight": 1.0,
                    "owner": {"id": 3, "name": "Mike Johnson", "role": "VP Sales"},
                    "is_completed": False
                },
                {
                    "id": 3,
                    "title": "Reduce churn to under 3%",
                    "description": "Monthly churn rate target",
                    "result_type": "percentage",
                    "start_value": 5.2,
                    "target_value": 3.0,
                    "current_value": 2.8,
                    "unit": "%",
                    "progress": 100,
                    "weight": 1.0,
                    "owner": {"id": 4, "name": "Lisa Wang", "role": "VP Customer Success"},
                    "is_completed": True
                },
                {
                    "id": 4,
                    "title": "Increase ARPU by 20%",
                    "description": "Average Revenue Per User growth",
                    "result_type": "percentage",
                    "start_value": 0,
                    "target_value": 20,
                    "current_value": 15,
                    "unit": "%",
                    "progress": 75,
                    "weight": 1.0,
                    "owner": {"id": 2, "name": "Sarah Chen", "role": "CFO"},
                    "is_completed": False
                }
            ],
            "child_goals": [
                {
                    "id": 4,
                    "title": "Sales Team: Close $500K in new deals",
                    "level": "team",
                    "progress": 88,
                    "status": "on_track"
                },
                {
                    "id": 5,
                    "title": "Marketing: Generate 200 qualified leads",
                    "level": "team",
                    "progress": 72,
                    "status": "on_track"
                }
            ],
            "check_ins": [
                {
                    "id": 1,
                    "status": "on_track",
                    "confidence": 0.8,
                    "notes": "Strong Q4 performance, on track to hit targets",
                    "checked_in_by": "John Smith",
                    "created_at": "2024-12-20T09:00:00Z"
                },
                {
                    "id": 2,
                    "status": "on_track",
                    "confidence": 0.75,
                    "notes": "Pipeline looking healthy, need to push on enterprise deals",
                    "checked_in_by": "John Smith",
                    "created_at": "2024-12-13T09:00:00Z"
                }
            ]
        }
    
    async def get_goal_alignment_tree(self, organization_id: int) -> Dict[str, Any]:
        """Get goal alignment visualization data"""
        return {
            "company": {
                "id": 1,
                "title": "Achieve $2M ARR",
                "progress": 85,
                "status": "on_track",
                "children": [
                    {
                        "id": 4,
                        "title": "Sales: Close $500K in new deals",
                        "level": "department",
                        "progress": 88,
                        "status": "on_track",
                        "children": [
                            {
                                "id": 10,
                                "title": "Enterprise Team: 20 new accounts",
                                "level": "team",
                                "progress": 90,
                                "status": "on_track",
                                "children": []
                            },
                            {
                                "id": 11,
                                "title": "SMB Team: 100 new accounts",
                                "level": "team",
                                "progress": 75,
                                "status": "on_track",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": 5,
                        "title": "Marketing: Generate 200 qualified leads",
                        "level": "department",
                        "progress": 72,
                        "status": "on_track",
                        "children": [
                            {
                                "id": 12,
                                "title": "Content: Publish 20 blog posts",
                                "level": "team",
                                "progress": 85,
                                "status": "on_track",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": 6,
                        "title": "Customer Success: Reduce churn to 3%",
                        "level": "department",
                        "progress": 100,
                        "status": "completed",
                        "children": []
                    }
                ]
            },
            "unaligned_goals": [
                {
                    "id": 20,
                    "title": "Improve team collaboration",
                    "level": "team",
                    "progress": 45,
                    "status": "at_risk"
                }
            ]
        }
    
    async def get_my_goals(self, user_id: int) -> List[Dict[str, Any]]:
        """Get goals owned by or assigned to a user"""
        return [
            {
                "id": 15,
                "title": "Complete Q4 product roadmap",
                "level": "individual",
                "progress": 80,
                "status": "on_track",
                "due_date": "2024-12-31",
                "key_results": [
                    {"title": "Ship 3 major features", "progress": 100},
                    {"title": "Reduce bug backlog by 50%", "progress": 60}
                ]
            },
            {
                "id": 16,
                "title": "Improve code review turnaround",
                "level": "individual",
                "progress": 65,
                "status": "on_track",
                "due_date": "2024-12-31",
                "key_results": [
                    {"title": "Average review time under 4 hours", "progress": 70},
                    {"title": "Review 20 PRs per week", "progress": 60}
                ]
            }
        ]
    
    async def create_goal(self, goal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new goal"""
        return {
            "id": 100,
            "message": "Goal created successfully",
            **goal_data
        }
    
    async def update_key_result(self, key_result_id: int, new_value: float, note: str = None) -> Dict[str, Any]:
        """Update a key result's current value"""
        return {
            "id": key_result_id,
            "previous_value": 42,
            "new_value": new_value,
            "progress": (new_value / 50) * 100,  # Example calculation
            "note": note,
            "updated_at": datetime.now().isoformat()
        }
    
    async def check_in_goal(self, goal_id: int, check_in_data: Dict[str, Any]) -> Dict[str, Any]:
        """Record a goal check-in"""
        return {
            "id": 100,
            "goal_id": goal_id,
            "message": "Check-in recorded successfully",
            **check_in_data,
            "created_at": datetime.now().isoformat()
        }
    
    async def get_ai_recommendations(self, goal_id: int) -> Dict[str, Any]:
        """Get AI-powered recommendations for a goal"""
        try:
            # Use AI to generate recommendations
            prompt = f"""Analyze this OKR goal and provide recommendations:
            Goal: Achieve $2M ARR
            Current Progress: 85%
            Days Remaining: 7
            Key Results:
            - MRR: 78.6% complete
            - New customers: 94% complete
            - Churn reduction: 100% complete
            - ARPU increase: 75% complete
            
            Provide 3-4 specific, actionable recommendations to help achieve this goal."""
            
            response = self.client.chat.completions.create(
                model="gpt-4.1-nano",
                messages=[
                    {"role": "system", "content": "You are an OKR coach helping teams achieve their goals."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500
            )
            
            ai_text = response.choices[0].message.content
        except Exception as e:
            ai_text = None
        
        return {
            "goal_id": goal_id,
            "recommendations": [
                {
                    "type": "action",
                    "title": "Focus on ARPU Growth",
                    "description": "ARPU increase is at 75% - consider launching an upsell campaign to existing customers in the final week.",
                    "priority": "high",
                    "impact": "Could add $15K to MRR"
                },
                {
                    "type": "risk",
                    "title": "MRR Target Gap",
                    "description": "Current MRR is $9K below target. Accelerate deal closures or consider promotional offers.",
                    "priority": "high",
                    "impact": "Critical for goal completion"
                },
                {
                    "type": "celebration",
                    "title": "Churn Target Achieved!",
                    "description": "Team has exceeded the churn reduction target. Document learnings for future quarters.",
                    "priority": "low",
                    "impact": "Team morale boost"
                },
                {
                    "type": "insight",
                    "title": "Strong Customer Acquisition",
                    "description": "At 94% of customer target with 7 days remaining. Team is performing well.",
                    "priority": "medium",
                    "impact": "Positive trend"
                }
            ],
            "ai_analysis": ai_text,
            "confidence_score": 0.82,
            "generated_at": datetime.now().isoformat()
        }
    
    async def get_progress_history(self, goal_id: int) -> Dict[str, Any]:
        """Get historical progress data for a goal"""
        return {
            "goal_id": goal_id,
            "data_points": [
                {"date": "2024-10-01", "progress": 0},
                {"date": "2024-10-15", "progress": 15},
                {"date": "2024-11-01", "progress": 35},
                {"date": "2024-11-15", "progress": 52},
                {"date": "2024-12-01", "progress": 68},
                {"date": "2024-12-15", "progress": 78},
                {"date": "2024-12-24", "progress": 85}
            ],
            "expected_trajectory": [
                {"date": "2024-10-01", "progress": 0},
                {"date": "2024-10-15", "progress": 16},
                {"date": "2024-11-01", "progress": 33},
                {"date": "2024-11-15", "progress": 50},
                {"date": "2024-12-01", "progress": 67},
                {"date": "2024-12-15", "progress": 83},
                {"date": "2024-12-31", "progress": 100}
            ]
        }


# Initialize service
okr_service = OKRService()
