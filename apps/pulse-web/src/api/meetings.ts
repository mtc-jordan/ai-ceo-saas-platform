/**
 * API client for AI Meeting Assistant module
 */
import api from './client';

// Types
export interface Participant {
  name: string;
  email?: string;
  role?: string;
  speaking_time_seconds?: number;
}

export interface TranscriptSegment {
  start_time: number;
  end_time: number;
  speaker?: string;
  text: string;
  confidence?: number;
}

export interface Topic {
  topic: string;
  start_time?: number;
  end_time?: number;
  summary?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  platform: string;
  external_meeting_id?: string;
  meeting_url?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  duration_minutes?: number;
  status: string;
  has_transcript: boolean;
  has_summary: boolean;
  participants?: Participant[];
  tags?: string[];
  action_items_count: number;
  created_at: string;
  updated_at: string;
}

export interface MeetingDetail extends Meeting {
  transcript?: string;
  transcript_segments?: TranscriptSegment[];
  transcription_confidence?: number;
  summary?: string;
  key_points?: string[];
  decisions?: string[];
  topics?: Topic[];
  sentiment_analysis?: Record<string, any>;
}

export interface ActionItem {
  id: string;
  meeting_id?: string;
  title: string;
  description?: string;
  assignee_id?: string;
  assignee_name?: string;
  assignee_email?: string;
  due_date?: string;
  completed_at?: string;
  status: string;
  priority: string;
  context?: string;
  timestamp_in_meeting?: number;
  ai_extracted: boolean;
  confidence_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  platform: string;
  platform_email?: string;
  is_active: boolean;
  auto_transcribe: boolean;
  auto_analyze: boolean;
  sync_calendar: boolean;
  last_synced_at?: string;
  created_at: string;
}

export interface MeetingDashboardStats {
  total_meetings: number;
  meetings_this_week: number;
  meetings_this_month: number;
  total_action_items: number;
  pending_action_items: number;
  overdue_action_items: number;
  completed_action_items: number;
  average_meeting_duration?: number;
  total_meeting_hours: number;
  upcoming_meetings: Meeting[];
  recent_action_items: ActionItem[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

// API Functions

// Dashboard
export const getMeetingDashboard = async (): Promise<MeetingDashboardStats> => {
  const response = await api.get('/meetings/dashboard');
  return response.data;
};

// Meetings CRUD
export const getMeetings = async (params?: {
  page?: number;
  page_size?: number;
  status?: string;
  platform?: string;
}): Promise<{ meetings: Meeting[]; total: number; page: number; page_size: number }> => {
  const response = await api.get('/meetings', { params });
  return response.data;
};

export const getMeeting = async (meetingId: string): Promise<MeetingDetail> => {
  const response = await api.get(`/meetings/${meetingId}`);
  return response.data;
};

export const createMeeting = async (data: {
  title: string;
  description?: string;
  platform?: string;
  meeting_url?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  participants?: Participant[];
  tags?: string[];
}): Promise<Meeting> => {
  const response = await api.post('/meetings', data);
  return response.data;
};

export const updateMeeting = async (
  meetingId: string,
  data: Partial<{
    title: string;
    description: string;
    scheduled_start: string;
    scheduled_end: string;
    participants: Participant[];
    tags: string[];
    status: string;
  }>
): Promise<Meeting> => {
  const response = await api.put(`/meetings/${meetingId}`, data);
  return response.data;
};

export const deleteMeeting = async (meetingId: string): Promise<void> => {
  await api.delete(`/meetings/${meetingId}`);
};

// Upload and Transcription
export const uploadMeetingRecording = async (
  meetingId: string,
  file: File
): Promise<Meeting> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/meetings/${meetingId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const transcribeMeeting = async (
  meetingId: string,
  data: {
    audio_url?: string;
    video_url?: string;
    language?: string;
  }
): Promise<{ meeting_id: string; status: string }> => {
  const response = await api.post(`/meetings/${meetingId}/transcribe`, data);
  return response.data;
};

// Analysis
export const analyzeMeeting = async (
  meetingId: string,
  options?: {
    extract_action_items?: boolean;
    generate_summary?: boolean;
    identify_decisions?: boolean;
    track_topics?: boolean;
    analyze_sentiment?: boolean;
  }
): Promise<{
  meeting_id: string;
  status: string;
  summary?: {
    executive_summary: string;
    key_points: string[];
    decisions: string[];
    topics: Topic[];
    sentiment?: Record<string, any>;
    action_items_extracted: number;
  };
  action_items?: ActionItem[];
}> => {
  const response = await api.post(`/meetings/${meetingId}/analyze`, {
    meeting_id: meetingId,
    ...options,
  });
  return response.data;
};

// Action Items
export const getActionItems = async (params?: {
  meeting_id?: string;
  status?: string;
  assignee_id?: string;
}): Promise<{
  action_items: ActionItem[];
  total: number;
  pending_count: number;
  overdue_count: number;
}> => {
  const response = await api.get('/meetings/action-items', { params });
  return response.data;
};

export const createActionItem = async (data: {
  meeting_id?: string;
  title: string;
  description?: string;
  assignee_id?: string;
  assignee_name?: string;
  assignee_email?: string;
  due_date?: string;
  priority?: string;
  context?: string;
}): Promise<ActionItem> => {
  const response = await api.post('/meetings/action-items', data);
  return response.data;
};

export const updateActionItem = async (
  itemId: string,
  data: Partial<{
    title: string;
    description: string;
    assignee_id: string;
    assignee_name: string;
    assignee_email: string;
    due_date: string;
    status: string;
    priority: string;
  }>
): Promise<ActionItem> => {
  const response = await api.put(`/meetings/action-items/${itemId}`, data);
  return response.data;
};

export const deleteActionItem = async (itemId: string): Promise<void> => {
  await api.delete(`/meetings/action-items/${itemId}`);
};

// Integrations
export const getIntegrations = async (): Promise<{ integrations: Integration[] }> => {
  const response = await api.get('/meetings/integrations');
  return response.data;
};

export const getIntegrationAuthUrl = async (
  platform: string
): Promise<{ auth_url: string }> => {
  const response = await api.get(`/meetings/integrations/${platform}/auth-url`);
  return response.data;
};

export const connectIntegration = async (data: {
  platform: string;
  authorization_code?: string;
  access_token?: string;
  refresh_token?: string;
  auto_transcribe?: boolean;
  auto_analyze?: boolean;
  sync_calendar?: boolean;
}): Promise<Integration> => {
  const response = await api.post('/meetings/integrations/connect', data);
  return response.data;
};

export const disconnectIntegration = async (integrationId: string): Promise<void> => {
  await api.delete(`/meetings/integrations/${integrationId}`);
};

export const syncIntegration = async (
  integrationId: string
): Promise<{ message: string }> => {
  const response = await api.post(`/meetings/integrations/${integrationId}/sync`);
  return response.data;
};

// Notifications
export const getNotifications = async (
  unreadOnly?: boolean
): Promise<{ notifications: Notification[] }> => {
  const response = await api.get('/meetings/notifications', {
    params: { unread_only: unreadOnly },
  });
  return response.data;
};

export const markNotificationRead = async (
  notificationId: string
): Promise<void> => {
  await api.post(`/meetings/notifications/${notificationId}/read`);
};

// Send Summary
export const sendMeetingSummary = async (
  meetingId: string
): Promise<{ message: string; results: Record<string, any> }> => {
  const response = await api.post(`/meetings/${meetingId}/send-summary`);
  return response.data;
};
