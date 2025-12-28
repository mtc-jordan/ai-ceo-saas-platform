import apiClient from './client';
import type {
  DataSource,
  DataSourceCreate,
  Dashboard,
  DashboardCreate,
  Widget,
  WidgetCreate,
  Briefing,
  Alert,
} from '../types';

export const pulseApi = {
  // Data Sources
  getDataSources: async (): Promise<DataSource[]> => {
    const response = await apiClient.get<DataSource[]>('/pulse/data-sources');
    return response.data;
  },

  createDataSource: async (data: DataSourceCreate): Promise<DataSource> => {
    const response = await apiClient.post<DataSource>('/pulse/data-sources', data);
    return response.data;
  },

  deleteDataSource: async (id: string): Promise<void> => {
    await apiClient.delete(`/pulse/data-sources/${id}`);
  },

  syncDataSource: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/pulse/data-sources/${id}/sync`);
    return response.data;
  },

  // Dashboards
  getDashboards: async (): Promise<Dashboard[]> => {
    const response = await apiClient.get<Dashboard[]>('/pulse/dashboards');
    return response.data;
  },

  getDashboard: async (id: string): Promise<Dashboard> => {
    const response = await apiClient.get<Dashboard>(`/pulse/dashboards/${id}`);
    return response.data;
  },

  createDashboard: async (data: DashboardCreate): Promise<Dashboard> => {
    const response = await apiClient.post<Dashboard>('/pulse/dashboards', data);
    return response.data;
  },

  updateDashboard: async (id: string, data: Partial<DashboardCreate>): Promise<Dashboard> => {
    const response = await apiClient.patch<Dashboard>(`/pulse/dashboards/${id}`, data);
    return response.data;
  },

  // Widgets
  getWidgets: async (dashboardId: string): Promise<Widget[]> => {
    const response = await apiClient.get<Widget[]>(`/pulse/dashboards/${dashboardId}/widgets`);
    return response.data;
  },

  createWidget: async (dashboardId: string, data: WidgetCreate): Promise<Widget> => {
    const response = await apiClient.post<Widget>(`/pulse/dashboards/${dashboardId}/widgets`, data);
    return response.data;
  },

  // Briefings
  getLatestBriefing: async (): Promise<Briefing> => {
    const response = await apiClient.get<Briefing>('/pulse/briefing');
    return response.data;
  },

  getBriefings: async (days: number = 7): Promise<Briefing[]> => {
    const response = await apiClient.get<Briefing[]>(`/pulse/briefings?days=${days}`);
    return response.data;
  },

  // Alerts
  getAlerts: async (unreadOnly: boolean = false): Promise<Alert[]> => {
    const response = await apiClient.get<Alert[]>(`/pulse/alerts?unread_only=${unreadOnly}`);
    return response.data;
  },

  markAlertRead: async (id: string): Promise<Alert> => {
    const response = await apiClient.patch<Alert>(`/pulse/alerts/${id}/read`);
    return response.data;
  },
};

export default pulseApi;
