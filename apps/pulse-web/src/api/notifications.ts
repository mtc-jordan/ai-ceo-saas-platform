/**
 * Real-Time Notifications API Client
 */

import api from './axios';

// Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'action_required';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  action_label?: string;
  icon?: string;
  is_read: boolean;
  read_at?: string;
  is_archived: boolean;
  archived_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  notifications_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  sound_enabled: boolean;
  email_digest_frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  digest_time: string;
  digest_timezone: string;
  category_preferences: Record<string, {
    in_app: boolean;
    push: boolean;
    email: boolean;
  }>;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  dnd_enabled: boolean;
  dnd_until?: string;
}

export interface PushSubscription {
  id: string;
  endpoint: string;
  device_name: string;
  device_type: string;
  is_active: boolean;
  created_at: string;
}

export interface DigestPreview {
  user_id: string;
  frequency: string;
  period_start: string;
  period_end: string;
  notification_count: number;
  summary: Record<string, number>;
  highlights: Array<{ title: string; type: string }>;
}

// API Functions

export const getNotifications = async (params?: {
  page?: number;
  page_size?: number;
  unread_only?: boolean;
  category?: string;
}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const createNotification = async (notification: {
  title: string;
  message: string;
  type?: string;
  category?: string;
  priority?: string;
  action_url?: string;
  action_label?: string;
}) => {
  const response = await api.post('/notifications', notification);
  return response.data;
};

export const markAsRead = async (notificationId: string) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async (category?: string) => {
  const response = await api.put('/notifications/read-all', null, {
    params: category ? { category } : undefined
  });
  return response.data;
};

export const archiveNotification = async (notificationId: string) => {
  const response = await api.put(`/notifications/${notificationId}/archive`);
  return response.data;
};

export const deleteNotification = async (notificationId: string) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

// Preferences

export const getPreferences = async (): Promise<NotificationPreferences> => {
  const response = await api.get('/notifications/preferences');
  return response.data;
};

export const updatePreferences = async (preferences: Partial<NotificationPreferences>) => {
  const response = await api.put('/notifications/preferences', preferences);
  return response.data;
};

// Push Subscriptions

export const subscribePush = async (subscription: {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  device_name?: string;
  device_type?: string;
}) => {
  const response = await api.post('/notifications/push/subscribe', subscription);
  return response.data;
};

export const unsubscribePush = async (subscriptionId: string) => {
  const response = await api.delete(`/notifications/push/subscribe/${subscriptionId}`);
  return response.data;
};

// Test

export const sendTestNotification = async (channel: 'all' | 'in_app' | 'push' | 'email' = 'all') => {
  const response = await api.post('/notifications/test', null, {
    params: { channel }
  });
  return response.data;
};

// Digests

export const getDigestHistory = async (limit: number = 10) => {
  const response = await api.get('/notifications/digests', {
    params: { limit }
  });
  return response.data;
};

export const previewDigest = async (frequency: 'hourly' | 'daily' | 'weekly' = 'daily'): Promise<DigestPreview> => {
  const response = await api.post('/notifications/digests/preview', null, {
    params: { frequency }
  });
  return response.data;
};

// WebSocket connection helper
export const createNotificationWebSocket = (onMessage: (notification: Notification) => void) => {
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/notifications/ws`;
  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        onMessage(data.data);
      }
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  };
  
  // Ping to keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('ping');
    }
  }, 30000);
  
  ws.onclose = () => {
    clearInterval(pingInterval);
  };
  
  return {
    close: () => {
      clearInterval(pingInterval);
      ws.close();
    },
    ws
  };
};
