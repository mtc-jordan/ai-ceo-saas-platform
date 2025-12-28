import apiClient from './client';

// Dashboard Overview
export const getAdminDashboard = async () => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data;
};

export const getStatsHistory = async (days: number = 30) => {
  const response = await apiClient.get(`/admin/stats/history?days=${days}`);
  return response.data;
};

// User Management
export const listUsers = async (params: {
  page?: number;
  per_page?: number;
  search?: string;
  plan?: string;
  status?: string;
}) => {
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};

export const getUserDetails = async (userId: string) => {
  const response = await apiClient.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserStatus = async (userId: string, status: string, reason?: string) => {
  const response = await apiClient.put(`/admin/users/${userId}/status`, { status, reason });
  return response.data;
};

// Organization Management
export const listOrganizations = async (params: {
  page?: number;
  per_page?: number;
  search?: string;
  plan?: string;
}) => {
  const response = await apiClient.get('/admin/organizations', { params });
  return response.data;
};

// Feature Flags
export const listFeatureFlags = async () => {
  const response = await apiClient.get('/admin/feature-flags');
  return response.data;
};

export const createFeatureFlag = async (flag: {
  name: string;
  description?: string;
  enabled: boolean;
  enabled_for_plans: string[];
  enabled_for_organizations: string[];
  percentage_rollout: number;
}) => {
  const response = await apiClient.post('/admin/feature-flags', flag);
  return response.data;
};

export const updateFeatureFlag = async (flagId: number, flag: {
  description?: string;
  enabled?: boolean;
  enabled_for_plans?: string[];
  enabled_for_organizations?: string[];
  percentage_rollout?: number;
}) => {
  const response = await apiClient.put(`/admin/feature-flags/${flagId}`, flag);
  return response.data;
};

export const deleteFeatureFlag = async (flagId: number) => {
  const response = await apiClient.delete(`/admin/feature-flags/${flagId}`);
  return response.data;
};

// Platform Configuration
export const listPlatformConfig = async (category?: string) => {
  const params = category ? { category } : {};
  const response = await apiClient.get('/admin/config', { params });
  return response.data;
};

export const updatePlatformConfig = async (key: string, value: string, description?: string) => {
  const response = await apiClient.put(`/admin/config/${key}`, { value, description });
  return response.data;
};

// Audit Logs
export const listAuditLogs = async (params: {
  page?: number;
  per_page?: number;
  action_type?: string;
  actor_email?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await apiClient.get('/admin/audit-logs', { params });
  return response.data;
};

// System Health
export const getSystemHealth = async () => {
  const response = await apiClient.get('/admin/health');
  return response.data;
};

// Announcements
export const listAnnouncements = async (activeOnly: boolean = false) => {
  const response = await apiClient.get('/admin/announcements', { params: { active_only: activeOnly } });
  return response.data;
};

export const createAnnouncement = async (announcement: {
  title: string;
  content: string;
  type: string;
  target_audience: string;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await apiClient.post('/admin/announcements', announcement);
  return response.data;
};

export const updateAnnouncement = async (announcementId: number, announcement: {
  title?: string;
  content?: string;
  type?: string;
  target_audience?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await apiClient.put(`/admin/announcements/${announcementId}`, announcement);
  return response.data;
};

export const deleteAnnouncement = async (announcementId: number) => {
  const response = await apiClient.delete(`/admin/announcements/${announcementId}`);
  return response.data;
};

// Revenue Analytics
export const getRevenueAnalytics = async (period: string = '30d') => {
  const response = await apiClient.get('/admin/revenue/analytics', { params: { period } });
  return response.data;
};

// Notifications
export const getNotificationPreferences = async () => {
  const response = await apiClient.get('/notifications/preferences');
  return response.data;
};

export const updateNotificationPreferences = async (preferences: Record<string, boolean>) => {
  const response = await apiClient.put('/notifications/preferences', preferences);
  return response.data;
};

export const sendTestEmail = async (to_email: string, template: string) => {
  const response = await apiClient.post('/notifications/send-test', { to_email, template });
  return response.data;
};

export const getEmailTemplates = async () => {
  const response = await apiClient.get('/notifications/templates');
  return response.data;
};
