"""Meeting follow-up reminder and notification service."""
import os
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx


class NotificationChannel(str, Enum):
    EMAIL = "email"
    IN_APP = "in_app"
    SLACK = "slack"
    TEAMS = "teams"


class ReminderType(str, Enum):
    ACTION_ITEM_DUE = "action_item_due"
    ACTION_ITEM_OVERDUE = "action_item_overdue"
    MEETING_FOLLOW_UP = "meeting_follow_up"
    MEETING_SUMMARY = "meeting_summary"
    WEEKLY_DIGEST = "weekly_digest"


class MeetingReminderService:
    """
    Service for managing meeting follow-ups and reminders.
    
    Features:
    - Action item due date reminders
    - Overdue action item notifications
    - Meeting follow-up emails
    - Weekly digest of pending items
    - Multi-channel notifications (email, Slack, Teams, in-app)
    """
    
    def __init__(self):
        # Email configuration
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@aiceo.com")
        
        # Slack configuration
        self.slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        self.slack_bot_token = os.getenv("SLACK_BOT_TOKEN")
        
        # Teams configuration
        self.teams_webhook_url = os.getenv("TEAMS_WEBHOOK_URL")
        
        # In-app notification storage (in production, use database)
        self.in_app_notifications: Dict[str, List[Dict]] = {}
    
    async def send_reminder(
        self,
        reminder_type: ReminderType,
        recipient_email: str,
        recipient_id: Optional[str] = None,
        subject: str = "",
        message: str = "",
        data: Optional[Dict[str, Any]] = None,
        channels: List[NotificationChannel] = None
    ) -> Dict[str, bool]:
        """
        Send a reminder through specified channels.
        
        Args:
            reminder_type: Type of reminder
            recipient_email: Email address of recipient
            recipient_id: User ID for in-app notifications
            subject: Notification subject
            message: Notification message
            data: Additional data for the notification
            channels: List of channels to send through
        
        Returns:
            Dictionary with success status for each channel
        """
        if channels is None:
            channels = [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
        
        results = {}
        
        for channel in channels:
            try:
                if channel == NotificationChannel.EMAIL:
                    results["email"] = await self._send_email(
                        recipient_email, subject, message, data
                    )
                elif channel == NotificationChannel.IN_APP and recipient_id:
                    results["in_app"] = await self._send_in_app(
                        recipient_id, reminder_type, subject, message, data
                    )
                elif channel == NotificationChannel.SLACK:
                    results["slack"] = await self._send_slack(
                        recipient_email, subject, message, data
                    )
                elif channel == NotificationChannel.TEAMS:
                    results["teams"] = await self._send_teams(
                        subject, message, data
                    )
            except Exception as e:
                print(f"Error sending {channel} notification: {e}")
                results[channel.value] = False
        
        return results
    
    async def _send_email(
        self,
        to_email: str,
        subject: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send email notification."""
        if not self.smtp_user or not self.smtp_password:
            print("Email not configured, skipping email notification")
            return False
        
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email
            
            # Create HTML version
            html_content = self._create_email_html(subject, message, data)
            
            # Attach both plain text and HTML
            msg.attach(MIMEText(message, "plain"))
            msg.attach(MIMEText(html_content, "html"))
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_email, msg.as_string())
            
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
    
    def _create_email_html(
        self,
        subject: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create HTML email content."""
        action_items_html = ""
        if data and data.get("action_items"):
            items = data["action_items"]
            action_items_html = """
            <h3>Action Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Task</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Assignee</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Due Date</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Status</th>
                </tr>
            """
            for item in items:
                action_items_html += f"""
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">{item.get('title', '')}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{item.get('assignee_name', 'Unassigned')}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{item.get('due_date', 'No due date')}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{item.get('status', 'pending')}</td>
                </tr>
                """
            action_items_html += "</table>"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f9fafb; }}
                .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
                .button {{ display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>AI CEO Platform</h1>
                </div>
                <div class="content">
                    <h2>{subject}</h2>
                    <p>{message}</p>
                    {action_items_html}
                    <p style="margin-top: 20px;">
                        <a href="{data.get('meeting_url', '#') if data else '#'}" class="button">View in Platform</a>
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated message from AI CEO Platform.</p>
                    <p>© 2025 AI CEO. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    async def _send_in_app(
        self,
        user_id: str,
        notification_type: ReminderType,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Store in-app notification."""
        notification = {
            "id": f"notif_{datetime.utcnow().timestamp()}",
            "type": notification_type.value,
            "title": title,
            "message": message,
            "data": data,
            "read": False,
            "created_at": datetime.utcnow().isoformat(),
        }
        
        if user_id not in self.in_app_notifications:
            self.in_app_notifications[user_id] = []
        
        self.in_app_notifications[user_id].insert(0, notification)
        
        # Keep only last 100 notifications per user
        self.in_app_notifications[user_id] = self.in_app_notifications[user_id][:100]
        
        return True
    
    async def _send_slack(
        self,
        recipient_email: str,
        subject: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send Slack notification."""
        if not self.slack_webhook_url:
            return False
        
        # Format message for Slack
        blocks = [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": subject}
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": message}
            }
        ]
        
        # Add action items if present
        if data and data.get("action_items"):
            items_text = "\n".join([
                f"• *{item.get('title')}* - {item.get('assignee_name', 'Unassigned')} (Due: {item.get('due_date', 'TBD')})"
                for item in data["action_items"]
            ])
            blocks.append({
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*Action Items:*\n{items_text}"}
            })
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.slack_webhook_url,
                    json={"blocks": blocks}
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Failed to send Slack notification: {e}")
            return False
    
    async def _send_teams(
        self,
        subject: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send Microsoft Teams notification."""
        if not self.teams_webhook_url:
            return False
        
        # Format message for Teams (Adaptive Card)
        card = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": "2563eb",
            "summary": subject,
            "sections": [
                {
                    "activityTitle": subject,
                    "text": message,
                }
            ]
        }
        
        # Add action items if present
        if data and data.get("action_items"):
            facts = [
                {"name": item.get("title", "Task"), "value": f"{item.get('assignee_name', 'Unassigned')} - Due: {item.get('due_date', 'TBD')}"}
                for item in data["action_items"]
            ]
            card["sections"].append({
                "title": "Action Items",
                "facts": facts
            })
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.teams_webhook_url,
                    json=card
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Failed to send Teams notification: {e}")
            return False
    
    def get_in_app_notifications(
        self,
        user_id: str,
        unread_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Get in-app notifications for a user."""
        notifications = self.in_app_notifications.get(user_id, [])
        if unread_only:
            return [n for n in notifications if not n.get("read")]
        return notifications
    
    def mark_notification_read(self, user_id: str, notification_id: str) -> bool:
        """Mark a notification as read."""
        notifications = self.in_app_notifications.get(user_id, [])
        for notification in notifications:
            if notification.get("id") == notification_id:
                notification["read"] = True
                return True
        return False
    
    async def send_action_item_reminder(
        self,
        action_item: Dict[str, Any],
        recipient_email: str,
        recipient_id: Optional[str] = None,
        is_overdue: bool = False
    ) -> Dict[str, bool]:
        """Send reminder for an action item."""
        reminder_type = ReminderType.ACTION_ITEM_OVERDUE if is_overdue else ReminderType.ACTION_ITEM_DUE
        
        if is_overdue:
            subject = f"⚠️ Overdue: {action_item.get('title', 'Action Item')}"
            message = f"The following action item is overdue and requires your attention:\n\n{action_item.get('title')}\n\nDue date: {action_item.get('due_date', 'Not set')}"
        else:
            subject = f"📋 Reminder: {action_item.get('title', 'Action Item')}"
            message = f"This is a reminder about an upcoming action item:\n\n{action_item.get('title')}\n\nDue date: {action_item.get('due_date', 'Not set')}"
        
        return await self.send_reminder(
            reminder_type=reminder_type,
            recipient_email=recipient_email,
            recipient_id=recipient_id,
            subject=subject,
            message=message,
            data={"action_item": action_item}
        )
    
    async def send_meeting_summary(
        self,
        meeting: Dict[str, Any],
        summary: str,
        action_items: List[Dict[str, Any]],
        recipients: List[Dict[str, Any]]
    ) -> Dict[str, List[Dict[str, bool]]]:
        """Send meeting summary to all participants."""
        results = {}
        
        subject = f"📝 Meeting Summary: {meeting.get('title', 'Meeting')}"
        message = f"Here's the summary from your recent meeting:\n\n{summary}"
        
        for recipient in recipients:
            email = recipient.get("email")
            user_id = recipient.get("id")
            
            if email:
                result = await self.send_reminder(
                    reminder_type=ReminderType.MEETING_SUMMARY,
                    recipient_email=email,
                    recipient_id=user_id,
                    subject=subject,
                    message=message,
                    data={
                        "meeting": meeting,
                        "action_items": action_items,
                        "meeting_url": f"/app/meetings/{meeting.get('id')}"
                    }
                )
                results[email] = result
        
        return results
    
    async def send_weekly_digest(
        self,
        user_email: str,
        user_id: str,
        pending_items: List[Dict[str, Any]],
        overdue_items: List[Dict[str, Any]],
        upcoming_meetings: List[Dict[str, Any]]
    ) -> Dict[str, bool]:
        """Send weekly digest of action items and meetings."""
        subject = "📊 Your Weekly AI CEO Digest"
        
        message = f"""Here's your weekly summary:

📋 Pending Action Items: {len(pending_items)}
⚠️ Overdue Items: {len(overdue_items)}
📅 Upcoming Meetings: {len(upcoming_meetings)}

Please review your pending tasks and upcoming meetings in the platform."""
        
        return await self.send_reminder(
            reminder_type=ReminderType.WEEKLY_DIGEST,
            recipient_email=user_email,
            recipient_id=user_id,
            subject=subject,
            message=message,
            data={
                "pending_items": pending_items,
                "overdue_items": overdue_items,
                "upcoming_meetings": upcoming_meetings
            }
        )


# Singleton instance
meeting_reminder_service = MeetingReminderService()


async def check_and_send_reminders(db_session) -> Dict[str, int]:
    """
    Background task to check for due/overdue items and send reminders.
    
    This should be run periodically (e.g., every hour) via a scheduler.
    """
    # This would query the database for:
    # 1. Action items due within 24 hours
    # 2. Overdue action items that haven't been reminded recently
    # 3. Scheduled follow-ups that are due
    
    # For now, return a placeholder
    return {
        "due_reminders_sent": 0,
        "overdue_reminders_sent": 0,
        "follow_ups_sent": 0
    }
