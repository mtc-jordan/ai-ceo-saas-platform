import apiClient from './client';

export interface StripeMetrics {
  revenue: {
    total_revenue: number;
    successful_payments: number;
    failed_payments: number;
    refunded_amount: number;
  };
  subscriptions: {
    active_subscriptions: number;
    mrr: number;
    canceled_subscriptions: number;
    new_subscriptions: number;
  };
  customers: {
    total_customers: number;
    new_customers: number;
  };
}

export interface GoogleAnalyticsMetrics {
  overview: {
    active_users: number;
    new_users: number;
    sessions: number;
    page_views: number;
    avg_session_duration: number;
    bounce_rate: number;
  };
  by_source: Array<{
    source: string;
    sessions: number;
    users: number;
  }>;
  daily: Array<{
    date: string;
    users: number;
    sessions: number;
    page_views: number;
  }>;
}

export interface HubSpotMetrics {
  contacts: {
    total_contacts: number;
    new_contacts_30d: number;
    growth_rate: number;
  };
  deals: {
    total_deals: number;
    total_pipeline_value: number;
    won_deals: number;
    won_value: number;
    avg_deal_size: number;
  };
  companies: {
    total_companies: number;
  };
  deal_stages: Array<{
    name: string;
    count: number;
    value: number;
  }>;
}

export interface AllMetrics {
  metrics: {
    stripe?: StripeMetrics;
    google_analytics?: GoogleAnalyticsMetrics;
    hubspot?: HubSpotMetrics;
  };
  errors?: Record<string, string>;
  connected_sources: string[];
}

export interface Briefing {
  title: string;
  content: string;
  highlights: Array<{
    text: string;
    type: string;
  }>;
  generated_at: string;
  metrics_summary?: Record<string, any>;
  type: string;
}

export interface InsightResponse {
  question: string;
  insight: string;
  sources_used: string[];
}

export const integrationsApi = {
  getAllMetrics: async (): Promise<AllMetrics> => {
    const response = await apiClient.get<AllMetrics>('/integrations/metrics');
    return response.data;
  },

  getStripeMetrics: async (): Promise<StripeMetrics> => {
    const response = await apiClient.get<StripeMetrics>('/integrations/metrics/stripe');
    return response.data;
  },

  getGoogleAnalyticsMetrics: async (): Promise<GoogleAnalyticsMetrics> => {
    const response = await apiClient.get<GoogleAnalyticsMetrics>('/integrations/metrics/google-analytics');
    return response.data;
  },

  getHubSpotMetrics: async (): Promise<HubSpotMetrics> => {
    const response = await apiClient.get<HubSpotMetrics>('/integrations/metrics/hubspot');
    return response.data;
  },

  generateBriefing: async (briefingType: string = 'daily'): Promise<Briefing> => {
    const response = await apiClient.post<Briefing>(`/integrations/briefing/generate?briefing_type=${briefingType}`);
    return response.data;
  },

  generateInsight: async (question: string): Promise<InsightResponse> => {
    const response = await apiClient.post<InsightResponse>('/integrations/insight', null, {
      params: { question }
    });
    return response.data;
  },
};

export default integrationsApi;
