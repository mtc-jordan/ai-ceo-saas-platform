import api from './client';

// Types
export interface ReportType {
  id: string;
  name: string;
  description: string;
  sections: string[];
  formats: string[];
}

export interface ReportSchedule {
  id: number;
  name: string;
  report_type: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  time: string;
  timezone: string;
  recipients: string[];
  format: string[];
  include_ai_insights: boolean;
  is_active: boolean;
  created_at: string;
  last_run?: string;
  next_run: string;
}

export interface GeneratedReport {
  id: number;
  report_type: string;
  title: string;
  format: string;
  filename: string;
  size: number;
  generated_by: string;
  generated_at: string;
  status: string;
}

export interface ReportTemplate {
  id: number;
  name: string;
  report_type: string;
  description: string;
  sections: string[];
  is_default: boolean;
}

// API Functions
export const executiveReportsApi = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  // Report Types
  getReportTypes: async () => {
    const response = await api.get('/reports/types');
    return response.data;
  },

  // Preview Report
  previewReport: async (reportType: string, period: string) => {
    const response = await api.get('/reports/preview', {
      params: { report_type: reportType, period }
    });
    return response.data;
  },

  // Generate Report
  generateReport: async (data: {
    report_type: string;
    period: string;
    include_ai_insights: boolean;
    format: string;
  }) => {
    const response = await api.post('/reports/generate', data);
    return response.data;
  },

  // Download Report
  downloadReport: async (filename: string) => {
    const response = await api.get(`/reports/download/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Report History
  getHistory: async (reportType?: string, limit?: number) => {
    const response = await api.get('/reports/history', {
      params: { report_type: reportType, limit }
    });
    return response.data;
  },

  // Schedules
  getSchedules: async () => {
    const response = await api.get('/reports/schedules');
    return response.data;
  },

  createSchedule: async (data: Partial<ReportSchedule>) => {
    const response = await api.post('/reports/schedules', data);
    return response.data;
  },

  getSchedule: async (id: number) => {
    const response = await api.get(`/reports/schedules/${id}`);
    return response.data;
  },

  updateSchedule: async (id: number, data: Partial<ReportSchedule>) => {
    const response = await api.put(`/reports/schedules/${id}`, data);
    return response.data;
  },

  deleteSchedule: async (id: number) => {
    const response = await api.delete(`/reports/schedules/${id}`);
    return response.data;
  },

  runScheduleNow: async (id: number) => {
    const response = await api.post(`/reports/schedules/${id}/run`);
    return response.data;
  },

  toggleSchedule: async (id: number) => {
    const response = await api.post(`/reports/schedules/${id}/toggle`);
    return response.data;
  },

  // Templates
  getTemplates: async () => {
    const response = await api.get('/reports/templates');
    return response.data;
  }
};

export default executiveReportsApi;
