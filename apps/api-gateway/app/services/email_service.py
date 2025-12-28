"""
SendGrid Email Service for AI CEO Platform
Handles all transactional emails and notifications
"""
import os
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class EmailTemplate(str, Enum):
    """Email template types"""
    WELCOME = "welcome"
    TEAM_INVITATION = "team_invitation"
    PASSWORD_RESET = "password_reset"
    DAILY_BRIEFING = "daily_briefing"
    ALERT_NOTIFICATION = "alert_notification"
    SUBSCRIPTION_CONFIRMATION = "subscription_confirmation"
    SUBSCRIPTION_CANCELLED = "subscription_cancelled"
    PAYMENT_FAILED = "payment_failed"
    TRIAL_ENDING = "trial_ending"
    WEEKLY_REPORT = "weekly_report"


class EmailService:
    """SendGrid email service for transactional emails"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", "noreply@aiceo.com")
        self.from_name = os.getenv("SENDGRID_FROM_NAME", "AI CEO Platform")
        self.base_url = "https://api.sendgrid.com/v3"
        
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        to_name: Optional[str] = None,
        reply_to: Optional[str] = None,
        attachments: Optional[List[Dict]] = None,
        categories: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Send a single email via SendGrid"""
        if not self.api_key:
            # Log email instead of sending if no API key
            print(f"[EMAIL] To: {to_email}, Subject: {subject}")
            return {"success": True, "message": "Email logged (no API key)"}
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "personalizations": [{
                "to": [{"email": to_email, "name": to_name or to_email}],
                "subject": subject
            }],
            "from": {
                "email": self.from_email,
                "name": self.from_name
            },
            "content": [
                {"type": "text/html", "value": html_content}
            ]
        }
        
        if text_content:
            payload["content"].insert(0, {"type": "text/plain", "value": text_content})
            
        if reply_to:
            payload["reply_to"] = {"email": reply_to}
            
        if categories:
            payload["categories"] = categories
            
        if attachments:
            payload["attachments"] = attachments
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/mail/send",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code in [200, 202]:
                    return {"success": True, "message": "Email sent successfully"}
                else:
                    return {
                        "success": False, 
                        "message": f"SendGrid error: {response.status_code}",
                        "details": response.text
                    }
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    async def send_template_email(
        self,
        to_email: str,
        template: EmailTemplate,
        template_data: Dict[str, Any],
        to_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send email using a predefined template"""
        subject, html_content, text_content = self._render_template(template, template_data)
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            to_name=to_name,
            categories=[template.value]
        )
    
    def _render_template(
        self, 
        template: EmailTemplate, 
        data: Dict[str, Any]
    ) -> tuple[str, str, str]:
        """Render email template with data"""
        templates = {
            EmailTemplate.WELCOME: self._welcome_template,
            EmailTemplate.TEAM_INVITATION: self._invitation_template,
            EmailTemplate.PASSWORD_RESET: self._password_reset_template,
            EmailTemplate.DAILY_BRIEFING: self._daily_briefing_template,
            EmailTemplate.ALERT_NOTIFICATION: self._alert_template,
            EmailTemplate.SUBSCRIPTION_CONFIRMATION: self._subscription_confirmation_template,
            EmailTemplate.SUBSCRIPTION_CANCELLED: self._subscription_cancelled_template,
            EmailTemplate.PAYMENT_FAILED: self._payment_failed_template,
            EmailTemplate.TRIAL_ENDING: self._trial_ending_template,
            EmailTemplate.WEEKLY_REPORT: self._weekly_report_template,
        }
        
        template_func = templates.get(template, self._default_template)
        return template_func(data)
    
    def _base_html(self, content: str) -> str:
        """Base HTML template wrapper"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI CEO Platform</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 24px; }}
                .content {{ background: white; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                .metric {{ background: #f8fafc; padding: 15px; border-radius: 6px; margin: 10px 0; }}
                .metric-value {{ font-size: 24px; font-weight: bold; color: #3b82f6; }}
                .alert {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 10px 0; }}
                .success {{ background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 10px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✨ AI CEO Platform</h1>
                </div>
                <div class="content">
                    {content}
                </div>
                <div class="footer">
                    <p>© {datetime.now().year} AI CEO Platform. All rights reserved.</p>
                    <p>You're receiving this email because you have an account with AI CEO Platform.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _welcome_template(self, data: Dict) -> tuple[str, str, str]:
        """Welcome email template"""
        name = data.get("name", "there")
        subject = "Welcome to AI CEO Platform! 🚀"
        
        html_content = self._base_html(f"""
            <h2>Welcome aboard, {name}!</h2>
            <p>We're thrilled to have you join AI CEO Platform. You now have access to powerful AI-driven tools to help you make better business decisions.</p>
            
            <h3>Here's what you can do:</h3>
            <ul>
                <li><strong>Pulse AI</strong> - Get real-time operational insights and AI-powered daily briefings</li>
                <li><strong>Athena</strong> - Strategic planning with scenario analysis and competitor tracking</li>
                <li><strong>GovernAI</strong> - Board intelligence with meeting prep and compliance monitoring</li>
            </ul>
            
            <p style="text-align: center;">
                <a href="{data.get('login_url', 'https://app.aiceo.com/login')}" class="button">Get Started</a>
            </p>
            
            <p>If you have any questions, our support team is here to help.</p>
            
            <p>Best regards,<br>The AI CEO Team</p>
        """)
        
        text_content = f"""
Welcome aboard, {name}!

We're thrilled to have you join AI CEO Platform. You now have access to powerful AI-driven tools to help you make better business decisions.

Here's what you can do:
- Pulse AI - Get real-time operational insights and AI-powered daily briefings
- Athena - Strategic planning with scenario analysis and competitor tracking
- GovernAI - Board intelligence with meeting prep and compliance monitoring

Get started: {data.get('login_url', 'https://app.aiceo.com/login')}

Best regards,
The AI CEO Team
        """
        
        return subject, html_content, text_content
    
    def _invitation_template(self, data: Dict) -> tuple[str, str, str]:
        """Team invitation email template"""
        inviter_name = data.get("inviter_name", "A team member")
        org_name = data.get("organization_name", "their organization")
        role = data.get("role", "member")
        message = data.get("message", "")
        invite_url = data.get("invite_url", "https://app.aiceo.com/invite")
        
        subject = f"You've been invited to join {org_name} on AI CEO Platform"
        
        message_html = f'<div class="success"><p><strong>Personal message:</strong> {message}</p></div>' if message else ""
        
        html_content = self._base_html(f"""
            <h2>You're Invited! 🎉</h2>
            <p><strong>{inviter_name}</strong> has invited you to join <strong>{org_name}</strong> on AI CEO Platform as a <strong>{role}</strong>.</p>
            
            {message_html}
            
            <p>AI CEO Platform provides AI-powered executive intelligence to help teams make better business decisions.</p>
            
            <p style="text-align: center;">
                <a href="{invite_url}" class="button">Accept Invitation</a>
            </p>
            
            <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
        """)
        
        text_content = f"""
You're Invited!

{inviter_name} has invited you to join {org_name} on AI CEO Platform as a {role}.

{f"Personal message: {message}" if message else ""}

Accept your invitation: {invite_url}

This invitation will expire in 7 days.
        """
        
        return subject, html_content, text_content
    
    def _password_reset_template(self, data: Dict) -> tuple[str, str, str]:
        """Password reset email template"""
        reset_url = data.get("reset_url", "https://app.aiceo.com/reset-password")
        
        subject = "Reset Your AI CEO Platform Password"
        
        html_content = self._base_html(f"""
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <p style="text-align: center;">
                <a href="{reset_url}" class="button">Reset Password</a>
            </p>
            
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.</p>
        """)
        
        text_content = f"""
Password Reset Request

We received a request to reset your password. Click the link below to create a new password:

{reset_url}

This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
        """
        
        return subject, html_content, text_content
    
    def _daily_briefing_template(self, data: Dict) -> tuple[str, str, str]:
        """Daily briefing email template"""
        org_name = data.get("organization_name", "Your Organization")
        date = data.get("date", datetime.now().strftime("%B %d, %Y"))
        briefing = data.get("briefing", "No briefing available")
        metrics = data.get("metrics", {})
        
        subject = f"📊 Daily Briefing for {org_name} - {date}"
        
        metrics_html = ""
        if metrics:
            metrics_html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">'
            for name, value in metrics.items():
                metrics_html += f'<div class="metric"><div class="metric-value">{value}</div><div>{name}</div></div>'
            metrics_html += '</div>'
        
        html_content = self._base_html(f"""
            <h2>📊 Daily Briefing</h2>
            <p style="color: #666;">{date}</p>
            
            {metrics_html}
            
            <h3>Executive Summary</h3>
            <p>{briefing}</p>
            
            <p style="text-align: center;">
                <a href="{data.get('dashboard_url', 'https://app.aiceo.com/dashboard')}" class="button">View Full Dashboard</a>
            </p>
        """)
        
        text_content = f"""
Daily Briefing - {date}

{briefing}

View your full dashboard: {data.get('dashboard_url', 'https://app.aiceo.com/dashboard')}
        """
        
        return subject, html_content, text_content
    
    def _alert_template(self, data: Dict) -> tuple[str, str, str]:
        """Alert notification email template"""
        alert_type = data.get("alert_type", "Alert")
        alert_title = data.get("title", "New Alert")
        alert_message = data.get("message", "You have a new alert")
        severity = data.get("severity", "medium")
        
        severity_colors = {
            "critical": "#dc2626",
            "high": "#ea580c",
            "medium": "#ca8a04",
            "low": "#16a34a"
        }
        color = severity_colors.get(severity, "#ca8a04")
        
        subject = f"🚨 {alert_type}: {alert_title}"
        
        html_content = self._base_html(f"""
            <div class="alert" style="border-left-color: {color};">
                <h2 style="margin-top: 0; color: {color};">🚨 {alert_type}</h2>
                <h3>{alert_title}</h3>
                <p>{alert_message}</p>
            </div>
            
            <p style="text-align: center;">
                <a href="{data.get('alert_url', 'https://app.aiceo.com/alerts')}" class="button">View Alert Details</a>
            </p>
        """)
        
        text_content = f"""
{alert_type}: {alert_title}

{alert_message}

View alert details: {data.get('alert_url', 'https://app.aiceo.com/alerts')}
        """
        
        return subject, html_content, text_content
    
    def _subscription_confirmation_template(self, data: Dict) -> tuple[str, str, str]:
        """Subscription confirmation email template"""
        plan_name = data.get("plan_name", "Pro")
        amount = data.get("amount", "$99")
        billing_period = data.get("billing_period", "monthly")
        
        subject = f"🎉 Welcome to AI CEO {plan_name}!"
        
        html_content = self._base_html(f"""
            <div class="success">
                <h2 style="margin-top: 0;">🎉 Subscription Confirmed!</h2>
                <p>Thank you for subscribing to AI CEO <strong>{plan_name}</strong>!</p>
            </div>
            
            <h3>Subscription Details</h3>
            <ul>
                <li><strong>Plan:</strong> {plan_name}</li>
                <li><strong>Amount:</strong> {amount}/{billing_period}</li>
                <li><strong>Start Date:</strong> {datetime.now().strftime("%B %d, %Y")}</li>
            </ul>
            
            <p>You now have access to all {plan_name} features. Start exploring your new capabilities!</p>
            
            <p style="text-align: center;">
                <a href="{data.get('dashboard_url', 'https://app.aiceo.com/dashboard')}" class="button">Go to Dashboard</a>
            </p>
        """)
        
        text_content = f"""
Subscription Confirmed!

Thank you for subscribing to AI CEO {plan_name}!

Subscription Details:
- Plan: {plan_name}
- Amount: {amount}/{billing_period}
- Start Date: {datetime.now().strftime("%B %d, %Y")}

Go to your dashboard: {data.get('dashboard_url', 'https://app.aiceo.com/dashboard')}
        """
        
        return subject, html_content, text_content
    
    def _subscription_cancelled_template(self, data: Dict) -> tuple[str, str, str]:
        """Subscription cancelled email template"""
        plan_name = data.get("plan_name", "Pro")
        end_date = data.get("end_date", "the end of your billing period")
        
        subject = "Your AI CEO subscription has been cancelled"
        
        html_content = self._base_html(f"""
            <h2>Subscription Cancelled</h2>
            <p>Your AI CEO <strong>{plan_name}</strong> subscription has been cancelled.</p>
            
            <p>You'll continue to have access to {plan_name} features until <strong>{end_date}</strong>.</p>
            
            <p>We're sorry to see you go! If you change your mind, you can resubscribe at any time.</p>
            
            <p style="text-align: center;">
                <a href="{data.get('pricing_url', 'https://app.aiceo.com/pricing')}" class="button">View Plans</a>
            </p>
        """)
        
        text_content = f"""
Subscription Cancelled

Your AI CEO {plan_name} subscription has been cancelled.

You'll continue to have access to {plan_name} features until {end_date}.

We're sorry to see you go! If you change your mind, you can resubscribe at any time.

View plans: {data.get('pricing_url', 'https://app.aiceo.com/pricing')}
        """
        
        return subject, html_content, text_content
    
    def _payment_failed_template(self, data: Dict) -> tuple[str, str, str]:
        """Payment failed email template"""
        amount = data.get("amount", "$99")
        retry_date = data.get("retry_date", "in 3 days")
        
        subject = "⚠️ Payment Failed - Action Required"
        
        html_content = self._base_html(f"""
            <div class="alert">
                <h2 style="margin-top: 0;">⚠️ Payment Failed</h2>
                <p>We were unable to process your payment of <strong>{amount}</strong>.</p>
            </div>
            
            <p>Please update your payment method to avoid service interruption. We'll automatically retry the payment {retry_date}.</p>
            
            <p style="text-align: center;">
                <a href="{data.get('billing_url', 'https://app.aiceo.com/settings/billing')}" class="button">Update Payment Method</a>
            </p>
        """)
        
        text_content = f"""
Payment Failed

We were unable to process your payment of {amount}.

Please update your payment method to avoid service interruption. We'll automatically retry the payment {retry_date}.

Update payment method: {data.get('billing_url', 'https://app.aiceo.com/settings/billing')}
        """
        
        return subject, html_content, text_content
    
    def _trial_ending_template(self, data: Dict) -> tuple[str, str, str]:
        """Trial ending email template"""
        days_left = data.get("days_left", 3)
        
        subject = f"⏰ Your AI CEO trial ends in {days_left} days"
        
        html_content = self._base_html(f"""
            <h2>⏰ Your Trial is Ending Soon</h2>
            <p>Your AI CEO free trial will end in <strong>{days_left} days</strong>.</p>
            
            <p>To continue using all features without interruption, upgrade to a paid plan today.</p>
            
            <h3>What you'll keep with a paid plan:</h3>
            <ul>
                <li>✅ AI-powered daily briefings</li>
                <li>✅ Unlimited data source connections</li>
                <li>✅ Strategic scenario planning</li>
                <li>✅ Board meeting preparation tools</li>
                <li>✅ Team collaboration features</li>
            </ul>
            
            <p style="text-align: center;">
                <a href="{data.get('pricing_url', 'https://app.aiceo.com/pricing')}" class="button">Upgrade Now</a>
            </p>
        """)
        
        text_content = f"""
Your Trial is Ending Soon

Your AI CEO free trial will end in {days_left} days.

To continue using all features without interruption, upgrade to a paid plan today.

Upgrade now: {data.get('pricing_url', 'https://app.aiceo.com/pricing')}
        """
        
        return subject, html_content, text_content
    
    def _weekly_report_template(self, data: Dict) -> tuple[str, str, str]:
        """Weekly report email template"""
        org_name = data.get("organization_name", "Your Organization")
        week = data.get("week", "This Week")
        summary = data.get("summary", "No summary available")
        highlights = data.get("highlights", [])
        
        subject = f"📈 Weekly Report for {org_name} - {week}"
        
        highlights_html = ""
        if highlights:
            highlights_html = "<h3>Key Highlights</h3><ul>"
            for highlight in highlights:
                highlights_html += f"<li>{highlight}</li>"
            highlights_html += "</ul>"
        
        html_content = self._base_html(f"""
            <h2>📈 Weekly Report</h2>
            <p style="color: #666;">{week}</p>
            
            <h3>Summary</h3>
            <p>{summary}</p>
            
            {highlights_html}
            
            <p style="text-align: center;">
                <a href="{data.get('report_url', 'https://app.aiceo.com/reports')}" class="button">View Full Report</a>
            </p>
        """)
        
        text_content = f"""
Weekly Report - {week}

Summary:
{summary}

{"Key Highlights:" if highlights else ""}
{chr(10).join(f"- {h}" for h in highlights)}

View full report: {data.get('report_url', 'https://app.aiceo.com/reports')}
        """
        
        return subject, html_content, text_content
    
    def _default_template(self, data: Dict) -> tuple[str, str, str]:
        """Default email template"""
        subject = data.get("subject", "AI CEO Platform Notification")
        message = data.get("message", "You have a new notification.")
        
        html_content = self._base_html(f"""
            <h2>{subject}</h2>
            <p>{message}</p>
        """)
        
        return subject, html_content, message


# Notification preferences model
class NotificationPreferences:
    """User notification preferences"""
    
    DEFAULT_PREFERENCES = {
        "email_daily_briefing": True,
        "email_weekly_report": True,
        "email_alerts_critical": True,
        "email_alerts_high": True,
        "email_alerts_medium": False,
        "email_alerts_low": False,
        "email_team_updates": True,
        "email_billing_updates": True,
        "email_product_updates": True,
    }


# Global email service instance
email_service = EmailService()
