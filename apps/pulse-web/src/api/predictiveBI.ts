import api from './client';

// Types
export interface ForecastResult {
  forecasts: number[];
  trend: string;
  growth_rate: number;
  confidence: number;
}

export interface AnomalyResult {
  anomalies: { index: number; value: number; z_score: number; label?: string }[];
  anomaly_count: number;
  mean: number;
  std: number;
}

export interface ChurnCustomer {
  customer_id: number;
  company_name: string;
  mrr: number;
  churn_probability: number;
  risk_level: string;
  risk_factors: string[];
  recommended_actions: string[];
}

export interface KPITrend {
  current_value: number;
  previous_value: number;
  change: number;
  change_percent: number;
  data: number[];
  labels: string[];
  analysis: {
    trend: string;
    volatility: string;
    forecast: number[];
  };
}

// API Functions
export const predictiveBIApi = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/predictive-bi/dashboard');
    return response.data;
  },

  // Revenue Forecasting
  getHistoricalRevenue: async () => {
    const response = await api.get('/predictive-bi/revenue/historical');
    return response.data;
  },

  getRevenueForecast: async (periods: number = 6, model: string = 'all') => {
    const response = await api.get('/predictive-bi/revenue/forecast', {
      params: { periods, model }
    });
    return response.data;
  },

  customForecast: async (data: number[], periods: number, model: string) => {
    const response = await api.post('/predictive-bi/revenue/custom-forecast', {
      data, periods, model
    });
    return response.data;
  },

  // Anomaly Detection
  detectAnomalies: async (metric: string = 'revenue', method: string = 'z_score', threshold: number = 2.5) => {
    const response = await api.get('/predictive-bi/anomalies/detect', {
      params: { metric, method, threshold }
    });
    return response.data;
  },

  getAnomalyAlerts: async () => {
    const response = await api.get('/predictive-bi/anomalies/alerts');
    return response.data;
  },

  // Churn Prediction
  getAtRiskCustomers: async () => {
    const response = await api.get('/predictive-bi/churn/at-risk');
    return response.data;
  },

  predictChurn: async (customerData: any) => {
    const response = await api.post('/predictive-bi/churn/predict', customerData);
    return response.data;
  },

  getChurnTrends: async () => {
    const response = await api.get('/predictive-bi/churn/trends');
    return response.data;
  },

  // Trend Analysis
  getKPITrends: async () => {
    const response = await api.get('/predictive-bi/trends/kpis');
    return response.data;
  },

  analyzeTrend: async (data: number[], labels?: string[]) => {
    const response = await api.post('/predictive-bi/trends/analyze', { data, labels });
    return response.data;
  },

  comparePeriods: async (metric: string, currentPeriod: string, previousPeriod: string) => {
    const response = await api.get('/predictive-bi/trends/compare', {
      params: { metric, current_period: currentPeriod, previous_period: previousPeriod }
    });
    return response.data;
  }
};

// Meeting Analytics API
export const meetingAnalyticsApi = {
  getDashboard: async () => {
    const response = await api.get('/meeting-analytics/dashboard');
    return response.data;
  },

  getTimeTrends: async (period: string = 'month') => {
    const response = await api.get('/meeting-analytics/time-trends', { params: { period } });
    return response.data;
  },

  getTopics: async (limit: number = 10) => {
    const response = await api.get('/meeting-analytics/topics', { params: { limit } });
    return response.data;
  },

  getActionItemMetrics: async (status?: string) => {
    const response = await api.get('/meeting-analytics/action-items', { params: { status } });
    return response.data;
  },

  getParticipation: async () => {
    const response = await api.get('/meeting-analytics/participation');
    return response.data;
  },

  getEfficiency: async () => {
    const response = await api.get('/meeting-analytics/efficiency');
    return response.data;
  },

  getInsights: async () => {
    const response = await api.get('/meeting-analytics/insights');
    return response.data;
  },

  comparePeriods: async (currentPeriod: string, previousPeriod: string) => {
    const response = await api.get('/meeting-analytics/comparison', {
      params: { current_period: currentPeriod, previous_period: previousPeriod }
    });
    return response.data;
  }
};

export default { predictiveBIApi, meetingAnalyticsApi };
