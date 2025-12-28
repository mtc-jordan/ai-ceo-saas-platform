"""Meeting platform integrations for Zoom, Google Meet, and Microsoft Teams."""
import os
import json
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from abc import ABC, abstractmethod
from urllib.parse import urlencode


class MeetingPlatformIntegration(ABC):
    """Base class for meeting platform integrations."""
    
    @abstractmethod
    async def authenticate(self, authorization_code: str) -> Dict[str, Any]:
        """Exchange authorization code for access tokens."""
        pass
    
    @abstractmethod
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token."""
        pass
    
    @abstractmethod
    async def get_meetings(self, access_token: str, from_date: datetime = None) -> List[Dict[str, Any]]:
        """Get list of meetings."""
        pass
    
    @abstractmethod
    async def get_meeting_recording(self, access_token: str, meeting_id: str) -> Optional[Dict[str, Any]]:
        """Get meeting recording URL."""
        pass
    
    @abstractmethod
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get authenticated user info."""
        pass


class ZoomIntegration(MeetingPlatformIntegration):
    """Zoom meeting platform integration."""
    
    def __init__(self):
        self.client_id = os.getenv("ZOOM_CLIENT_ID")
        self.client_secret = os.getenv("ZOOM_CLIENT_SECRET")
        self.redirect_uri = os.getenv("ZOOM_REDIRECT_URI", "http://localhost:8000/api/v1/meetings/integrations/zoom/callback")
        self.base_url = "https://api.zoom.us/v2"
        self.auth_url = "https://zoom.us/oauth"
    
    def get_authorization_url(self, state: str = None) -> str:
        """Get OAuth authorization URL."""
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
        }
        if state:
            params["state"] = state
        return f"{self.auth_url}/authorize?{urlencode(params)}"
    
    async def authenticate(self, authorization_code: str) -> Dict[str, Any]:
        """Exchange authorization code for access tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token",
                data={
                    "grant_type": "authorization_code",
                    "code": authorization_code,
                    "redirect_uri": self.redirect_uri,
                },
                auth=(self.client_id, self.client_secret),
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
                "token_type": data.get("token_type"),
            }
    
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                },
                auth=(self.client_id, self.client_secret),
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
            }
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get authenticated user info."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/users/me",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "id": data.get("id"),
                "email": data.get("email"),
                "first_name": data.get("first_name"),
                "last_name": data.get("last_name"),
                "display_name": f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
            }
    
    async def get_meetings(self, access_token: str, from_date: datetime = None) -> List[Dict[str, Any]]:
        """Get list of meetings."""
        async with httpx.AsyncClient() as client:
            params = {"type": "scheduled", "page_size": 100}
            if from_date:
                params["from"] = from_date.strftime("%Y-%m-%d")
            
            response = await client.get(
                f"{self.base_url}/users/me/meetings",
                params=params,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            data = response.json()
            
            meetings = []
            for meeting in data.get("meetings", []):
                meetings.append({
                    "id": str(meeting.get("id")),
                    "title": meeting.get("topic"),
                    "start_time": meeting.get("start_time"),
                    "duration": meeting.get("duration"),
                    "join_url": meeting.get("join_url"),
                    "status": meeting.get("status"),
                    "platform": "zoom",
                })
            
            return meetings
    
    async def get_meeting_recording(self, access_token: str, meeting_id: str) -> Optional[Dict[str, Any]]:
        """Get meeting recording URL."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/meetings/{meeting_id}/recordings",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                response.raise_for_status()
                data = response.json()
                
                recording_files = data.get("recording_files", [])
                audio_file = next(
                    (f for f in recording_files if f.get("file_type") == "M4A"),
                    None
                )
                video_file = next(
                    (f for f in recording_files if f.get("file_type") == "MP4"),
                    None
                )
                
                return {
                    "audio_url": audio_file.get("download_url") if audio_file else None,
                    "video_url": video_file.get("download_url") if video_file else None,
                    "duration": data.get("duration"),
                    "start_time": data.get("start_time"),
                }
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return None
                raise


class GoogleMeetIntegration(MeetingPlatformIntegration):
    """Google Meet integration via Google Calendar API."""
    
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/meetings/integrations/google/callback")
        self.auth_url = "https://accounts.google.com/o/oauth2"
        self.calendar_api = "https://www.googleapis.com/calendar/v3"
        self.people_api = "https://people.googleapis.com/v1"
    
    def get_authorization_url(self, state: str = None) -> str:
        """Get OAuth authorization URL."""
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        if state:
            params["state"] = state
        return f"{self.auth_url}/auth?{urlencode(params)}"
    
    async def authenticate(self, authorization_code: str) -> Dict[str, Any]:
        """Exchange authorization code for access tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token",
                data={
                    "grant_type": "authorization_code",
                    "code": authorization_code,
                    "redirect_uri": self.redirect_uri,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
                "token_type": data.get("token_type"),
            }
    
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "access_token": data.get("access_token"),
                "refresh_token": refresh_token,  # Google doesn't return new refresh token
                "expires_in": data.get("expires_in"),
            }
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get authenticated user info."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.people_api}/people/me",
                params={"personFields": "names,emailAddresses"},
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            data = response.json()
            
            names = data.get("names", [{}])[0]
            emails = data.get("emailAddresses", [{}])[0]
            
            return {
                "id": data.get("resourceName", "").replace("people/", ""),
                "email": emails.get("value"),
                "first_name": names.get("givenName"),
                "last_name": names.get("familyName"),
                "display_name": names.get("displayName"),
            }
    
    async def get_meetings(self, access_token: str, from_date: datetime = None) -> List[Dict[str, Any]]:
        """Get list of calendar events with Google Meet links."""
        async with httpx.AsyncClient() as client:
            params = {
                "maxResults": 100,
                "singleEvents": True,
                "orderBy": "startTime",
            }
            if from_date:
                params["timeMin"] = from_date.isoformat() + "Z"
            else:
                params["timeMin"] = datetime.utcnow().isoformat() + "Z"
            
            response = await client.get(
                f"{self.calendar_api}/calendars/primary/events",
                params=params,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            data = response.json()
            
            meetings = []
            for event in data.get("items", []):
                # Only include events with Google Meet links
                conference_data = event.get("conferenceData", {})
                entry_points = conference_data.get("entryPoints", [])
                meet_link = next(
                    (ep.get("uri") for ep in entry_points if ep.get("entryPointType") == "video"),
                    None
                )
                
                if meet_link:
                    start = event.get("start", {})
                    end = event.get("end", {})
                    
                    meetings.append({
                        "id": event.get("id"),
                        "title": event.get("summary", "Untitled Meeting"),
                        "start_time": start.get("dateTime") or start.get("date"),
                        "end_time": end.get("dateTime") or end.get("date"),
                        "join_url": meet_link,
                        "status": event.get("status"),
                        "platform": "google_meet",
                        "attendees": [
                            {"email": a.get("email"), "name": a.get("displayName")}
                            for a in event.get("attendees", [])
                        ],
                    })
            
            return meetings
    
    async def get_meeting_recording(self, access_token: str, meeting_id: str) -> Optional[Dict[str, Any]]:
        """Google Meet recordings require Google Workspace and Drive API."""
        # Note: Google Meet recordings are stored in Google Drive
        # This would require additional Drive API integration
        return None


class MicrosoftTeamsIntegration(MeetingPlatformIntegration):
    """Microsoft Teams integration via Microsoft Graph API."""
    
    def __init__(self):
        self.client_id = os.getenv("MICROSOFT_CLIENT_ID")
        self.client_secret = os.getenv("MICROSOFT_CLIENT_SECRET")
        self.redirect_uri = os.getenv("MICROSOFT_REDIRECT_URI", "http://localhost:8000/api/v1/meetings/integrations/teams/callback")
        self.auth_url = "https://login.microsoftonline.com/common/oauth2/v2.0"
        self.graph_api = "https://graph.microsoft.com/v1.0"
    
    def get_authorization_url(self, state: str = None) -> str:
        """Get OAuth authorization URL."""
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "offline_access Calendars.Read OnlineMeetings.Read User.Read",
            "response_mode": "query",
        }
        if state:
            params["state"] = state
        return f"{self.auth_url}/authorize?{urlencode(params)}"
    
    async def authenticate(self, authorization_code: str) -> Dict[str, Any]:
        """Exchange authorization code for access tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token",
                data={
                    "grant_type": "authorization_code",
                    "code": authorization_code,
                    "redirect_uri": self.redirect_uri,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
                "token_type": data.get("token_type"),
            }
    
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
            }
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get authenticated user info."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.graph_api}/me",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "id": data.get("id"),
                "email": data.get("mail") or data.get("userPrincipalName"),
                "first_name": data.get("givenName"),
                "last_name": data.get("surname"),
                "display_name": data.get("displayName"),
            }
    
    async def get_meetings(self, access_token: str, from_date: datetime = None) -> List[Dict[str, Any]]:
        """Get list of calendar events with Teams meetings."""
        async with httpx.AsyncClient() as client:
            start_time = from_date or datetime.utcnow()
            end_time = start_time + timedelta(days=30)
            
            response = await client.get(
                f"{self.graph_api}/me/calendarView",
                params={
                    "startDateTime": start_time.isoformat() + "Z",
                    "endDateTime": end_time.isoformat() + "Z",
                    "$top": 100,
                    "$select": "subject,start,end,onlineMeeting,attendees,isOnlineMeeting",
                },
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            data = response.json()
            
            meetings = []
            for event in data.get("value", []):
                if event.get("isOnlineMeeting"):
                    online_meeting = event.get("onlineMeeting", {})
                    
                    meetings.append({
                        "id": event.get("id"),
                        "title": event.get("subject", "Untitled Meeting"),
                        "start_time": event.get("start", {}).get("dateTime"),
                        "end_time": event.get("end", {}).get("dateTime"),
                        "join_url": online_meeting.get("joinUrl"),
                        "platform": "microsoft_teams",
                        "attendees": [
                            {
                                "email": a.get("emailAddress", {}).get("address"),
                                "name": a.get("emailAddress", {}).get("name")
                            }
                            for a in event.get("attendees", [])
                        ],
                    })
            
            return meetings
    
    async def get_meeting_recording(self, access_token: str, meeting_id: str) -> Optional[Dict[str, Any]]:
        """Get Teams meeting recording."""
        # Teams recordings require additional permissions and are stored in OneDrive/SharePoint
        # This would require additional Graph API calls
        return None


class MeetingIntegrationsService:
    """Service to manage all meeting platform integrations."""
    
    def __init__(self):
        self.zoom = ZoomIntegration()
        self.google = GoogleMeetIntegration()
        self.teams = MicrosoftTeamsIntegration()
    
    def get_integration(self, platform: str) -> Optional[MeetingPlatformIntegration]:
        """Get integration instance by platform name."""
        integrations = {
            "zoom": self.zoom,
            "google_meet": self.google,
            "microsoft_teams": self.teams,
        }
        return integrations.get(platform)
    
    def get_authorization_url(self, platform: str, state: str = None) -> Optional[str]:
        """Get OAuth authorization URL for a platform."""
        integration = self.get_integration(platform)
        if integration:
            return integration.get_authorization_url(state)
        return None
    
    async def connect_platform(
        self,
        platform: str,
        authorization_code: str
    ) -> Dict[str, Any]:
        """Connect a meeting platform using authorization code."""
        integration = self.get_integration(platform)
        if not integration:
            raise ValueError(f"Unsupported platform: {platform}")
        
        # Exchange code for tokens
        tokens = await integration.authenticate(authorization_code)
        
        # Get user info
        user_info = await integration.get_user_info(tokens["access_token"])
        
        return {
            "platform": platform,
            "tokens": tokens,
            "user_info": user_info,
        }
    
    async def sync_meetings(
        self,
        platform: str,
        access_token: str,
        from_date: datetime = None
    ) -> List[Dict[str, Any]]:
        """Sync meetings from a platform."""
        integration = self.get_integration(platform)
        if not integration:
            raise ValueError(f"Unsupported platform: {platform}")
        
        return await integration.get_meetings(access_token, from_date)
    
    async def get_recording(
        self,
        platform: str,
        access_token: str,
        meeting_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get meeting recording from a platform."""
        integration = self.get_integration(platform)
        if not integration:
            raise ValueError(f"Unsupported platform: {platform}")
        
        return await integration.get_meeting_recording(access_token, meeting_id)


# Singleton instance
meeting_integrations_service = MeetingIntegrationsService()
