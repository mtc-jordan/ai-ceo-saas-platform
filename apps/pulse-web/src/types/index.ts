// User types
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_platform_admin?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  organization: Organization | null;
  token: Token;
}

// Data Source types
export interface DataSource {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'connected' | 'error';
  last_sync_at: string | null;
  created_at: string;
}

export interface DataSourceCreate {
  name: string;
  type: string;
  credentials?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

// Dashboard types
export interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  layout: Record<string, unknown> | null;
  is_default: number;
  created_at: string;
}

export interface DashboardCreate {
  name: string;
  description?: string;
  layout?: Record<string, unknown>;
}

// Widget types
export interface Widget {
  id: string;
  name: string;
  type: 'line_chart' | 'bar_chart' | 'kpi' | 'table' | 'pie_chart';
  data_source_id: string | null;
  query: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number } | null;
  config: Record<string, unknown> | null;
}

export interface WidgetCreate {
  name: string;
  type: string;
  data_source_id?: string;
  query: Record<string, unknown>;
  position?: { x: number; y: number; w: number; h: number };
  config?: Record<string, unknown>;
}

// Briefing types
export interface Briefing {
  id: string;
  date: string;
  content: string;
  highlights: Array<{ text: string; type: string }> | null;
  alerts: Array<Record<string, unknown>> | null;
  created_at: string;
}

// Alert types
export interface Alert {
  id: string;
  type: 'anomaly' | 'prediction' | 'threshold';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: number;
  is_dismissed: number;
  created_at: string;
}

// Metric types
export interface Metric {
  name: string;
  value: number;
  change?: number;
  change_period?: string;
}

// Chart data types
export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}
