"""
Meeting Analytics Service
Comprehensive analytics for meeting patterns, topics, and team participation
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
from collections import Counter
import json


class MeetingAnalyticsService:
    """Service for meeting analytics and insights"""
    
    def __init__(self):
        pass
    
    def calculate_meeting_time_trends(self, meetings: List[Dict]) -> Dict[str, Any]:
        """Calculate meeting time trends over weeks/months"""
        if not meetings:
            return {"error": "No meeting data available"}
        
        # Group meetings by week
        weekly_data = {}
        for meeting in meetings:
            meeting_date = datetime.fromisoformat(meeting["scheduled_at"].replace("Z", ""))
            week_key = meeting_date.strftime("%Y-W%W")
            
            if week_key not in weekly_data:
                weekly_data[week_key] = {
                    "total_minutes": 0,
                    "meeting_count": 0,
                    "participants": set()
                }
            
            weekly_data[week_key]["total_minutes"] += meeting.get("duration_minutes", 60)
            weekly_data[week_key]["meeting_count"] += 1
            for p in meeting.get("participants", []):
                weekly_data[week_key]["participants"].add(p.get("name", ""))
        
        # Calculate trends
        weeks = sorted(weekly_data.keys())
        time_series = [weekly_data[w]["total_minutes"] for w in weeks]
        
        # Calculate week-over-week change
        if len(time_series) >= 2:
            wow_change = (time_series[-1] - time_series[-2]) / time_series[-2] * 100 if time_series[-2] > 0 else 0
        else:
            wow_change = 0
        
        # Calculate average
        avg_weekly_minutes = np.mean(time_series) if time_series else 0
        
        return {
            "weekly_data": [
                {
                    "week": w,
                    "total_hours": round(weekly_data[w]["total_minutes"] / 60, 1),
                    "meeting_count": weekly_data[w]["meeting_count"],
                    "unique_participants": len(weekly_data[w]["participants"])
                }
                for w in weeks
            ],
            "summary": {
                "total_meetings": sum(weekly_data[w]["meeting_count"] for w in weeks),
                "total_hours": round(sum(time_series) / 60, 1),
                "average_weekly_hours": round(avg_weekly_minutes / 60, 1),
                "week_over_week_change": round(wow_change, 1),
                "trend": "increasing" if wow_change > 5 else "decreasing" if wow_change < -5 else "stable"
            }
        }
    
    def analyze_topics(self, meetings: List[Dict]) -> Dict[str, Any]:
        """Analyze most discussed topics across meetings"""
        all_topics = []
        topic_details = {}
        
        for meeting in meetings:
            topics = meeting.get("topics_discussed", [])
            for topic in topics:
                topic_name = topic if isinstance(topic, str) else topic.get("name", "")
                all_topics.append(topic_name)
                
                if topic_name not in topic_details:
                    topic_details[topic_name] = {
                        "count": 0,
                        "meetings": [],
                        "total_time": 0
                    }
                
                topic_details[topic_name]["count"] += 1
                topic_details[topic_name]["meetings"].append(meeting.get("title", ""))
                topic_details[topic_name]["total_time"] += meeting.get("duration_minutes", 60) // len(topics) if topics else 0
        
        # Count frequency
        topic_counts = Counter(all_topics)
        top_topics = topic_counts.most_common(10)
        
        return {
            "top_topics": [
                {
                    "topic": topic,
                    "frequency": count,
                    "percentage": round(count / len(all_topics) * 100, 1) if all_topics else 0,
                    "total_time_minutes": topic_details.get(topic, {}).get("total_time", 0),
                    "recent_meetings": topic_details.get(topic, {}).get("meetings", [])[:3]
                }
                for topic, count in top_topics
            ],
            "total_unique_topics": len(set(all_topics)),
            "total_topic_mentions": len(all_topics)
        }
    
    def calculate_action_item_metrics(self, action_items: List[Dict]) -> Dict[str, Any]:
        """Calculate action item completion rates and metrics"""
        if not action_items:
            return {
                "total": 0,
                "completed": 0,
                "pending": 0,
                "overdue": 0,
                "completion_rate": 0
            }
        
        total = len(action_items)
        completed = sum(1 for item in action_items if item.get("status") == "completed")
        pending = sum(1 for item in action_items if item.get("status") == "pending")
        in_progress = sum(1 for item in action_items if item.get("status") == "in_progress")
        
        # Calculate overdue
        now = datetime.utcnow()
        overdue = 0
        for item in action_items:
            if item.get("status") != "completed" and item.get("due_date"):
                due_date = datetime.fromisoformat(item["due_date"].replace("Z", ""))
                if due_date < now:
                    overdue += 1
        
        # Calculate average completion time
        completion_times = []
        for item in action_items:
            if item.get("status") == "completed" and item.get("created_at") and item.get("completed_at"):
                created = datetime.fromisoformat(item["created_at"].replace("Z", ""))
                completed_at = datetime.fromisoformat(item["completed_at"].replace("Z", ""))
                completion_times.append((completed_at - created).days)
        
        avg_completion_days = np.mean(completion_times) if completion_times else 0
        
        # By assignee
        assignee_stats = {}
        for item in action_items:
            assignee = item.get("assignee_name", "Unassigned")
            if assignee not in assignee_stats:
                assignee_stats[assignee] = {"total": 0, "completed": 0}
            assignee_stats[assignee]["total"] += 1
            if item.get("status") == "completed":
                assignee_stats[assignee]["completed"] += 1
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "in_progress": in_progress,
            "overdue": overdue,
            "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
            "average_completion_days": round(avg_completion_days, 1),
            "by_assignee": [
                {
                    "name": name,
                    "total": stats["total"],
                    "completed": stats["completed"],
                    "completion_rate": round(stats["completed"] / stats["total"] * 100, 1) if stats["total"] > 0 else 0
                }
                for name, stats in sorted(assignee_stats.items(), key=lambda x: x[1]["total"], reverse=True)
            ]
        }
    
    def calculate_participation_metrics(self, meetings: List[Dict]) -> Dict[str, Any]:
        """Calculate team participation metrics"""
        participant_stats = {}
        
        for meeting in meetings:
            participants = meeting.get("participants", [])
            duration = meeting.get("duration_minutes", 60)
            
            for participant in participants:
                name = participant.get("name", "Unknown")
                role = participant.get("role", "Attendee")
                
                if name not in participant_stats:
                    participant_stats[name] = {
                        "meetings_attended": 0,
                        "total_time_minutes": 0,
                        "roles": [],
                        "organized": 0
                    }
                
                participant_stats[name]["meetings_attended"] += 1
                participant_stats[name]["total_time_minutes"] += duration
                participant_stats[name]["roles"].append(role)
                
                if role == "Organizer":
                    participant_stats[name]["organized"] += 1
        
        # Calculate engagement scores
        max_meetings = max(stats["meetings_attended"] for stats in participant_stats.values()) if participant_stats else 1
        
        participants_list = []
        for name, stats in participant_stats.items():
            engagement_score = (stats["meetings_attended"] / max_meetings) * 100
            participants_list.append({
                "name": name,
                "meetings_attended": stats["meetings_attended"],
                "total_hours": round(stats["total_time_minutes"] / 60, 1),
                "meetings_organized": stats["organized"],
                "engagement_score": round(engagement_score, 1),
                "primary_role": Counter(stats["roles"]).most_common(1)[0][0] if stats["roles"] else "Attendee"
            })
        
        # Sort by meetings attended
        participants_list.sort(key=lambda x: x["meetings_attended"], reverse=True)
        
        return {
            "participants": participants_list,
            "total_unique_participants": len(participant_stats),
            "average_meeting_size": round(
                sum(len(m.get("participants", [])) for m in meetings) / len(meetings), 1
            ) if meetings else 0,
            "most_active": participants_list[0] if participants_list else None
        }
    
    def calculate_meeting_efficiency(self, meetings: List[Dict]) -> Dict[str, Any]:
        """Calculate meeting efficiency metrics"""
        efficiency_scores = []
        
        for meeting in meetings:
            score = 100
            factors = []
            
            # Check if meeting had agenda
            if not meeting.get("agenda"):
                score -= 10
                factors.append("No agenda")
            
            # Check if meeting had action items
            action_items = meeting.get("action_items", [])
            if not action_items:
                score -= 15
                factors.append("No action items")
            
            # Check duration vs scheduled
            actual_duration = meeting.get("actual_duration_minutes", meeting.get("duration_minutes", 60))
            scheduled_duration = meeting.get("duration_minutes", 60)
            
            if actual_duration > scheduled_duration * 1.2:
                score -= 10
                factors.append("Ran over time")
            
            # Check participant count
            participants = len(meeting.get("participants", []))
            if participants > 10:
                score -= 5
                factors.append("Large meeting")
            
            # Check if summary was generated
            if meeting.get("ai_summary"):
                score += 5
                factors.append("Summary generated")
            
            efficiency_scores.append({
                "meeting_id": meeting.get("id"),
                "title": meeting.get("title"),
                "score": max(0, min(100, score)),
                "factors": factors
            })
        
        avg_score = np.mean([s["score"] for s in efficiency_scores]) if efficiency_scores else 0
        
        return {
            "average_efficiency_score": round(avg_score, 1),
            "efficiency_grade": self._get_efficiency_grade(avg_score),
            "meetings": efficiency_scores,
            "recommendations": self._get_efficiency_recommendations(efficiency_scores)
        }
    
    def _get_efficiency_grade(self, score: float) -> str:
        """Convert efficiency score to grade"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    def _get_efficiency_recommendations(self, efficiency_scores: List[Dict]) -> List[str]:
        """Generate recommendations based on efficiency analysis"""
        recommendations = []
        
        # Count common issues
        all_factors = []
        for score in efficiency_scores:
            all_factors.extend(score.get("factors", []))
        
        factor_counts = Counter(all_factors)
        
        if factor_counts.get("No agenda", 0) > len(efficiency_scores) * 0.3:
            recommendations.append("Create agendas for meetings to improve focus and outcomes")
        
        if factor_counts.get("No action items", 0) > len(efficiency_scores) * 0.3:
            recommendations.append("Ensure meetings conclude with clear action items and owners")
        
        if factor_counts.get("Ran over time", 0) > len(efficiency_scores) * 0.2:
            recommendations.append("Consider shorter meeting durations or stricter time management")
        
        if factor_counts.get("Large meeting", 0) > len(efficiency_scores) * 0.2:
            recommendations.append("Reduce meeting sizes by inviting only essential participants")
        
        if not recommendations:
            recommendations.append("Meeting efficiency is good! Continue current practices.")
        
        return recommendations


# Mock data for demonstration
def get_mock_meeting_analytics_data():
    """Generate mock meeting data for analytics"""
    meetings = [
        {
            "id": 1,
            "title": "Weekly Team Standup",
            "scheduled_at": "2024-12-16T09:00:00Z",
            "duration_minutes": 30,
            "actual_duration_minutes": 35,
            "participants": [
                {"name": "John Smith", "role": "Organizer"},
                {"name": "Sarah Johnson", "role": "Attendee"},
                {"name": "Mike Chen", "role": "Attendee"},
                {"name": "Emily Davis", "role": "Attendee"}
            ],
            "topics_discussed": ["Sprint Progress", "Blockers", "Upcoming Tasks"],
            "action_items": [
                {"title": "Review PR #123", "assignee_name": "Mike Chen", "status": "completed", "due_date": "2024-12-17T17:00:00Z", "created_at": "2024-12-16T09:30:00Z", "completed_at": "2024-12-17T14:00:00Z"},
                {"title": "Update documentation", "assignee_name": "Emily Davis", "status": "pending", "due_date": "2024-12-20T17:00:00Z", "created_at": "2024-12-16T09:30:00Z"}
            ],
            "agenda": True,
            "ai_summary": "Team discussed sprint progress..."
        },
        {
            "id": 2,
            "title": "Product Strategy Review",
            "scheduled_at": "2024-12-17T14:00:00Z",
            "duration_minutes": 60,
            "actual_duration_minutes": 75,
            "participants": [
                {"name": "John Smith", "role": "Organizer"},
                {"name": "Sarah Johnson", "role": "Attendee"},
                {"name": "Lisa Wang", "role": "Attendee"}
            ],
            "topics_discussed": ["Q1 Roadmap", "Feature Prioritization", "Customer Feedback", "Competitive Analysis"],
            "action_items": [
                {"title": "Draft Q1 roadmap", "assignee_name": "John Smith", "status": "in_progress", "due_date": "2024-12-23T17:00:00Z", "created_at": "2024-12-17T15:00:00Z"},
                {"title": "Analyze competitor features", "assignee_name": "Lisa Wang", "status": "completed", "due_date": "2024-12-19T17:00:00Z", "created_at": "2024-12-17T15:00:00Z", "completed_at": "2024-12-19T10:00:00Z"}
            ],
            "agenda": True,
            "ai_summary": "Reviewed product strategy..."
        },
        {
            "id": 3,
            "title": "Customer Success Sync",
            "scheduled_at": "2024-12-18T10:00:00Z",
            "duration_minutes": 45,
            "actual_duration_minutes": 45,
            "participants": [
                {"name": "Sarah Johnson", "role": "Organizer"},
                {"name": "Tom Wilson", "role": "Attendee"},
                {"name": "Amy Brown", "role": "Attendee"}
            ],
            "topics_discussed": ["Customer Health", "Churn Risk", "Upsell Opportunities"],
            "action_items": [
                {"title": "Contact at-risk accounts", "assignee_name": "Tom Wilson", "status": "pending", "due_date": "2024-12-20T17:00:00Z", "created_at": "2024-12-18T10:45:00Z"},
                {"title": "Prepare renewal proposals", "assignee_name": "Amy Brown", "status": "pending", "due_date": "2024-12-22T17:00:00Z", "created_at": "2024-12-18T10:45:00Z"}
            ],
            "agenda": True,
            "ai_summary": "Discussed customer health metrics..."
        },
        {
            "id": 4,
            "title": "Engineering All-Hands",
            "scheduled_at": "2024-12-19T15:00:00Z",
            "duration_minutes": 60,
            "actual_duration_minutes": 55,
            "participants": [
                {"name": "Mike Chen", "role": "Organizer"},
                {"name": "John Smith", "role": "Attendee"},
                {"name": "Emily Davis", "role": "Attendee"},
                {"name": "David Lee", "role": "Attendee"},
                {"name": "Jennifer Park", "role": "Attendee"},
                {"name": "Robert Kim", "role": "Attendee"}
            ],
            "topics_discussed": ["Technical Debt", "Infrastructure Updates", "Team Announcements", "Q1 Goals"],
            "action_items": [
                {"title": "Create tech debt backlog", "assignee_name": "David Lee", "status": "completed", "due_date": "2024-12-20T17:00:00Z", "created_at": "2024-12-19T16:00:00Z", "completed_at": "2024-12-20T11:00:00Z"}
            ],
            "agenda": True,
            "ai_summary": "Engineering team all-hands covering..."
        },
        {
            "id": 5,
            "title": "Board Preparation",
            "scheduled_at": "2024-12-20T11:00:00Z",
            "duration_minutes": 90,
            "actual_duration_minutes": 100,
            "participants": [
                {"name": "John Smith", "role": "Organizer"},
                {"name": "Sarah Johnson", "role": "Attendee"}
            ],
            "topics_discussed": ["Financial Review", "Growth Metrics", "Strategic Initiatives", "Risk Assessment"],
            "action_items": [
                {"title": "Finalize board deck", "assignee_name": "John Smith", "status": "in_progress", "due_date": "2024-12-23T12:00:00Z", "created_at": "2024-12-20T12:30:00Z"},
                {"title": "Prepare financial appendix", "assignee_name": "Sarah Johnson", "status": "pending", "due_date": "2024-12-23T12:00:00Z", "created_at": "2024-12-20T12:30:00Z"}
            ],
            "agenda": False,
            "ai_summary": None
        }
    ]
    
    return meetings


def get_mock_action_items():
    """Get all action items from mock meetings"""
    meetings = get_mock_meeting_analytics_data()
    all_items = []
    for meeting in meetings:
        for item in meeting.get("action_items", []):
            item["meeting_title"] = meeting["title"]
            all_items.append(item)
    return all_items
