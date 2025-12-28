import apiClient from './client';

export interface DeepSeekSettings {
  api_key?: string;
  enabled: boolean;
}

export interface StripeSettings {
  api_key?: string;
  enabled: boolean;
}

export interface GoogleAnalyticsSettings {
  credentials_json?: string;
  property_id?: string;
  enabled: boolean;
}

export interface HubSpotSettings {
  api_key?: string;
  enabled: boolean;
}

export interface BriefingSettings {
  frequency: string;
  time: string;
}

export interface OrganizationSettingsUpdate {
  deepseek?: DeepSeekSettings;
  stripe?: StripeSettings;
  google_analytics?: GoogleAnalyticsSettings;
  hubspot?: HubSpotSettings;
  briefing?: BriefingSettings;
}

export interface OrganizationSettingsResponse {
  id: string;
  organization_id: string;
  deepseek_configured: boolean;
  deepseek_enabled: boolean;
  stripe_configured: boolean;
  stripe_enabled: boolean;
  google_analytics_configured: boolean;
  google_analytics_property_id?: string;
  google_analytics_enabled: boolean;
  hubspot_configured: boolean;
  hubspot_enabled: boolean;
  salesforce_configured: boolean;
  salesforce_enabled: boolean;
  briefing_frequency: string;
  briefing_time: string;
  created_at: string;
  updated_at: string;
}

export interface TestConnectionRequest {
  source_type: string;
  api_key?: string;
  credentials_json?: string;
  property_id?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  source_type: string;
}

export interface DataSourceConnection {
  id: string;
  organization_id: string;
  source_type: string;
  display_name: string;
  status: string;
  last_sync_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export const settingsApi = {
  getSettings: async (): Promise<OrganizationSettingsResponse> => {
    const response = await apiClient.get<OrganizationSettingsResponse>('/settings');
    return response.data;
  },

  updateSettings: async (settings: OrganizationSettingsUpdate): Promise<OrganizationSettingsResponse> => {
    const response = await apiClient.put<OrganizationSettingsResponse>('/settings', settings);
    return response.data;
  },

  testConnection: async (request: TestConnectionRequest): Promise<TestConnectionResponse> => {
    const response = await apiClient.post<TestConnectionResponse>('/settings/test-connection', request);
    return response.data;
  },

  getConnections: async (): Promise<DataSourceConnection[]> => {
    const response = await apiClient.get<DataSourceConnection[]>('/settings/connections');
    return response.data;
  },

  createConnection: async (source_type: string, display_name: string): Promise<DataSourceConnection> => {
    const response = await apiClient.post<DataSourceConnection>('/settings/connections', {
      source_type,
      display_name,
    });
    return response.data;
  },

  deleteConnection: async (connectionId: string): Promise<void> => {
    await apiClient.delete(`/settings/connections/${connectionId}`);
  },
};

export default settingsApi;
