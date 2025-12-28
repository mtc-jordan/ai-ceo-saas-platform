"""
Meeting Analytics API Endpoints
Meeting time trends, topic analysis, action item metrics, and participation
"""
from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime

from app.services.meeting_analytics_service import (
    MeetingAnalyticsService,
    get_mock_meeting_analytics_data,
    get_mock_action_items
)

router = APIRouter()

analytics_service = MeetingAnalyticsService()


@router.get("/dashboard", response_model=dict)
async def get_meeting_analytics_dashboard():
    """Get comprehensive meeting analytics dashboard"""
    meetings = get_mock_meeting_analytics_data()
    action_items = get_mock_action_items()
    
    time_trends = analytics_service.calculate_meeting_time_trends(meetings)
    topics = analytics_service.analyze_topics(meetings)
    action_metrics = analytics_service.calculate_action_item_metrics(action_items)
    participation = analytics_service.calculate_participation_metrics(meetings)
    efficiency = analytics_service.calculate_meeting_efficiency(meetings)
    
    return {
        "summary": {
            "total_meetings": len(meetings),
            "total_hours": time_trends["summary"]["total_hours"],
            "total_action_items": action_metrics["total"],
            "completion_rate": action_metrics["completion_rate"],
            "efficiency_score": efficiency["average_efficiency_score"],
            "unique_participants": participation["total_unique_participants"]
        },
        "time_trends": time_trends,
        "top_topics": topics["top_topics"][:5],
        "action_item_summary": {
            "completed": action_metrics["completed"],
            "pending": action_metrics["pending"],
            "overdue": action_metrics["overdue"],
            "completion_rate": action_metrics["completion_rate"]
        },
        "efficiency": {
            "score": efficiency["average_efficiency_score"],
            "grade": efficiency["efficiency_grade"],
            "recommendations": efficiency["recommendations"][:3]
        },
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/time-trends", response_model=dict)
async def get_meeting_time_trends(
    period: str = Query("month", regex="^(week|month|quarter|year)$")
):
    """Get meeting time trends over specified period"""
    meetings = get_mock_meeting_analytics_data()
    trends = analytics_service.calculate_meeting_time_trends(meetings)
    
    return {
        "period": period,
        **trends,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/topics", response_model=dict)
async def get_topic_analysis(
    limit: int = Query(10, ge=1, le=50)
):
    """Get analysis of most discussed topics"""
    meetings = get_mock_meeting_analytics_data()
    topics = analytics_service.analyze_topics(meetings)
    
    return {
        "top_topics": topics["top_topics"][:limit],
        "total_unique_topics": topics["total_unique_topics"],
        "total_mentions": topics["total_topic_mentions"],
        "topic_cloud": [
            {"text": t["topic"], "value": t["frequency"]}
            for t in topics["top_topics"][:20]
        ],
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/action-items", response_model=dict)
async def get_action_item_metrics(
    status: Optional[str] = Query(None, regex="^(pending|in_progress|completed|overdue)$")
):
    """Get action item completion metrics"""
    action_items = get_mock_action_items()
    
    # Filter by status if specified
    if status == "overdue":
        now = datetime.utcnow()
        action_items = [
            item for item in action_items
            if item.get("status") != "completed" and item.get("due_date") and
            datetime.fromisoformat(item["due_date"].replace("Z", "")) < now
        ]
    elif status:
        action_items = [item for item in action_items if item.get("status") == status]
    
    metrics = analytics_service.calculate_action_item_metrics(action_items)
    
    return {
        "filter": status,
        **metrics,
        "items": action_items,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/participation", response_model=dict)
async def get_participation_metrics():
    """Get team participation metrics"""
    meetings = get_mock_meeting_analytics_data()
    participation = analytics_service.calculate_participation_metrics(meetings)
    
    return {
        **participation,
        "engagement_distribution": {
            "high": sum(1 for p in participation["participants"] if p["engagement_score"] >= 70),
            "medium": sum(1 for p in participation["participants"] if 40 <= p["engagement_score"] < 70),
            "low": sum(1 for p in participation["participants"] if p["engagement_score"] < 40)
        },
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/efficiency", response_model=dict)
async def get_meeting_efficiency():
    """Get meeting efficiency analysis"""
    meetings = get_mock_meeting_analytics_data()
    efficiency = analytics_service.calculate_meeting_efficiency(meetings)
    
    # Calculate distribution
    score_distribution = {
        "excellent": sum(1 for m in efficiency["meetings"] if m["score"] >= 90),
        "good": sum(1 for m in efficiency["meetings"] if 70 <= m["score"] < 90),
        "needs_improvement": sum(1 for m in efficiency["meetings"] if m["score"] < 70)
    }
    
    return {
        **efficiency,
        "score_distribution": score_distribution,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/insights", response_model=dict)
async def get_meeting_insights():
    """Get AI-generated insights about meeting patterns"""
    meetings = get_mock_meeting_analytics_data()
    action_items = get_mock_action_items()
    
    time_trends = analytics_service.calculate_meeting_time_trends(meetings)
    topics = analytics_service.analyze_topics(meetings)
    action_metrics = analytics_service.calculate_action_item_metrics(action_items)
    participation = analytics_service.calculate_participation_metrics(meetings)
    efficiency = analytics_service.calculate_meeting_efficiency(meetings)
    
    insights = []
    
    # Time insights
    if time_trends["summary"]["week_over_week_change"] > 10:
        insights.append({
            "type": "warning",
            "category": "time",
            "title": "Meeting Time Increasing",
            "description": f"Meeting time increased by {time_trends['summary']['week_over_week_change']}% this week. Consider consolidating or shortening meetings.",
            "impact": "high"
        })
    
    # Action item insights
    if action_metrics["overdue"] > 0:
        insights.append({
            "type": "alert",
            "category": "action_items",
            "title": f"{action_metrics['overdue']} Overdue Action Items",
            "description": "There are overdue action items that need attention. Review and reassign if necessary.",
            "impact": "high"
        })
    
    if action_metrics["completion_rate"] < 70:
        insights.append({
            "type": "warning",
            "category": "action_items",
            "title": "Low Action Item Completion Rate",
            "description": f"Only {action_metrics['completion_rate']}% of action items are completed. Consider setting more realistic deadlines.",
            "impact": "medium"
        })
    
    # Efficiency insights
    if efficiency["average_efficiency_score"] < 70:
        insights.append({
            "type": "suggestion",
            "category": "efficiency",
            "title": "Meeting Efficiency Can Improve",
            "description": efficiency["recommendations"][0] if efficiency["recommendations"] else "Review meeting practices.",
            "impact": "medium"
        })
    
    # Participation insights
    if participation["average_meeting_size"] > 8:
        insights.append({
            "type": "suggestion",
            "category": "participation",
            "title": "Large Average Meeting Size",
            "description": f"Average meeting has {participation['average_meeting_size']} participants. Consider smaller, focused meetings.",
            "impact": "low"
        })
    
    # Topic insights
    if topics["top_topics"]:
        top_topic = topics["top_topics"][0]
        insights.append({
            "type": "info",
            "category": "topics",
            "title": f"Most Discussed: {top_topic['topic']}",
            "description": f"'{top_topic['topic']}' was discussed in {top_topic['frequency']} meetings ({top_topic['percentage']}% of all topics).",
            "impact": "low"
        })
    
    # Positive insights
    if efficiency["average_efficiency_score"] >= 80:
        insights.append({
            "type": "success",
            "category": "efficiency",
            "title": "Strong Meeting Efficiency",
            "description": f"Meeting efficiency score of {efficiency['average_efficiency_score']}% is excellent. Keep up the good practices!",
            "impact": "positive"
        })
    
    if action_metrics["completion_rate"] >= 80:
        insights.append({
            "type": "success",
            "category": "action_items",
            "title": "High Action Item Completion",
            "description": f"{action_metrics['completion_rate']}% completion rate shows strong follow-through on commitments.",
            "impact": "positive"
        })
    
    return {
        "insights": insights,
        "total_insights": len(insights),
        "by_category": {
            "time": sum(1 for i in insights if i["category"] == "time"),
            "action_items": sum(1 for i in insights if i["category"] == "action_items"),
            "efficiency": sum(1 for i in insights if i["category"] == "efficiency"),
            "participation": sum(1 for i in insights if i["category"] == "participation"),
            "topics": sum(1 for i in insights if i["category"] == "topics")
        },
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/comparison", response_model=dict)
async def compare_meeting_periods(
    current_period: str = Query("this_month"),
    previous_period: str = Query("last_month")
):
    """Compare meeting metrics between two periods"""
    # In production, this would filter by actual dates
    meetings = get_mock_meeting_analytics_data()
    
    # Mock comparison data
    return {
        "current_period": {
            "label": current_period,
            "total_meetings": 5,
            "total_hours": 4.5,
            "action_items_created": 8,
            "action_items_completed": 4,
            "efficiency_score": 78
        },
        "previous_period": {
            "label": previous_period,
            "total_meetings": 6,
            "total_hours": 5.2,
            "action_items_created": 10,
            "action_items_completed": 6,
            "efficiency_score": 72
        },
        "changes": {
            "meetings": {"value": -1, "percent": -16.7, "trend": "down"},
            "hours": {"value": -0.7, "percent": -13.5, "trend": "down"},
            "action_items_created": {"value": -2, "percent": -20.0, "trend": "down"},
            "completion_rate": {"value": -10.0, "percent": -16.7, "trend": "down"},
            "efficiency": {"value": 6, "percent": 8.3, "trend": "up"}
        },
        "summary": "Meeting time decreased by 13.5% while efficiency improved by 8.3%. Focus on improving action item completion rate.",
        "generated_at": datetime.utcnow().isoformat()
    }
