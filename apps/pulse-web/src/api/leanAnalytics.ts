import apiClient from './client';

// ==================== Types ====================

export interface ControlChartData {
  center_line: number;
  ucl: number;
  lcl: number;
  data_points: number[];
  out_of_control_points: number[];
}

export interface XBarRChartResult {
  id: string;
  name: string;
  xbar_chart: ControlChartData;
  r_chart: ControlChartData;
  patterns_detected: { type: string; description: string; start_index: number }[];
  process_stable: boolean;
  recommendations: string[];
}

export interface IndividualsChartResult {
  id: string;
  name: string;
  individuals_chart: ControlChartData;
  mr_chart: ControlChartData;
  estimated_sigma: number;
  process_stable: boolean;
}

export interface ParetoResult {
  chart_data: {
    categories: string[];
    values: number[];
    percentages: number[];
    cumulative_percentages: number[];
  };
  vital_few: { category: string; value: number; percentage: number; cumulative: number }[];
  trivial_many: { category: string; value: number; percentage: number; cumulative: number }[];
  vital_few_count: number;
  vital_few_percentage: number;
  recommendation: string;
}

export interface CapabilityResult {
  id: string;
  name: string;
  sample_size: number;
  statistics: {
    mean: number;
    std_dev: number;
    min: number;
    max: number;
    range: number;
  };
  specification_limits: {
    usl: number;
    lsl: number;
    target: number | null;
    tolerance: number;
  };
  capability_indices: {
    cp: number;
    cpk: number;
    cpu: number;
    cpl: number;
    cpm: number | null;
  };
  performance: {
    sigma_level: number;
    ppm_total: number;
    ppm_upper: number;
    ppm_lower: number;
    yield_percent: number;
  };
  interpretation: {
    cpk_rating: string;
    cpk_color: string;
    centering: string;
    cp_vs_cpk: string;
  };
  recommendations: string[];
}

export interface OEETrendResult {
  current_average: number;
  trend: {
    direction: string;
    slope_per_day: number;
    r_squared: number;
  };
  forecast: { day: number; predicted_oee: number }[];
  forecast_30_day_oee: number;
  recommendations: string[];
}

export interface BottleneckResult {
  bottlenecks: {
    process: string;
    bottleneck_score: number;
    severity: string;
    reasons: string[];
  }[];
  primary_bottleneck: {
    process: string;
    bottleneck_score: number;
    severity: string;
    reasons: string[];
  } | null;
  total_identified: number;
  recommendations: string[];
}

export interface TaktTimeResult {
  takt_time_seconds: number;
  takt_time_minutes: number;
  available_time_minutes: number;
  demand_units: number;
  interpretation: string;
}

export interface SIPOCDiagram {
  id: string;
  name: string;
  description?: string;
  process_owner?: string;
  suppliers: { name: string; description?: string; type?: string }[];
  inputs: { name: string; description?: string; specification?: string }[];
  process_steps: { step_number: number; name: string; description?: string; responsible?: string }[];
  outputs: { name: string; description?: string; specification?: string }[];
  customers: { name: string; description?: string; type?: string; requirements?: string }[];
  analysis: {
    completeness_score: number;
    issues: string[];
    status: string;
  };
  created_at: string;
}

export interface VSMMetrics {
  total_cycle_time: number;
  total_wait_time: number;
  total_lead_time: number;
  value_added_time: number;
  non_value_added_time: number;
  process_cycle_efficiency: number;
}

export interface ValueStreamMap {
  id: string;
  name: string;
  description?: string;
  product_family?: string;
  current_state: {
    process_steps: {
      name: string;
      cycle_time: number;
      wait_time: number;
      value_added: boolean;
      inventory?: number;
      operators?: number;
    }[];
    metrics: VSMMetrics;
  };
  improvement_opportunities: {
    type: string;
    priority: string;
    step?: string;
    description: string;
    recommendation: string;
  }[];
  created_at: string;
}

export interface ProcessFlowDiagram {
  id: string;
  name: string;
  description?: string;
  process_type: string;
  nodes: {
    id: string;
    type: string;
    name: string;
    description?: string;
    time?: number;
    distance?: number;
    value_added?: boolean;
    x_position?: number;
    y_position?: number;
  }[];
  connections: {
    from_node_id: string;
    to_node_id: string;
    label?: string;
    condition?: string;
  }[];
  swimlanes: {
    id: string;
    name: string;
    department?: string;
    color?: string;
  }[];
  summary: {
    total_operations: number;
    total_decisions: number;
    total_delays: number;
    total_transports: number;
    total_inspections: number;
    total_storage: number;
    value_added_steps: number;
    non_value_added_steps: number;
    total_time: number;
    total_distance: number;
    value_added_ratio: number;
  };
  created_at: string;
}

export interface AIAnalysisResult {
  id: string;
  analysis_type: string;
  analysis?: string;
  recommendations?: string[];
  risk_level?: string;
  suggested_tools?: string[];
  priority_wastes?: any[];
  total_potential_savings?: number;
  suggestions?: string;
  recommended_event_type?: string;
  estimated_improvement?: Record<string, string>;
  suggested_five_whys?: string[];
  fishbone_categories?: Record<string, string[]>;
  metrics?: Record<string, any>;
}

// ==================== Control Charts ====================

export const createXBarRChart = async (data: {
  name: string;
  subgroup_size?: number;
  data: number[][];
  usl?: number;
  lsl?: number;
}): Promise<XBarRChartResult> => {
  const response = await apiClient.post('/lean-analytics/control-charts/xbar-r', data);
  return response.data;
};

export const createIndividualsChart = async (data: {
  name: string;
  data: number[];
  usl?: number;
  lsl?: number;
}): Promise<IndividualsChartResult> => {
  const response = await apiClient.post('/lean-analytics/control-charts/i-mr', data);
  return response.data;
};

export const getControlCharts = async (): Promise<any[]> => {
  const response = await apiClient.get('/lean-analytics/control-charts');
  return response.data;
};

export const getControlChart = async (chartId: string): Promise<any> => {
  const response = await apiClient.get(`/lean-analytics/control-charts/${chartId}`);
  return response.data;
};

// ==================== Pareto Analysis ====================

export const performParetoAnalysis = async (data: {
  categories: string[];
  values: number[];
  labels?: string[];
}): Promise<ParetoResult> => {
  const response = await apiClient.post('/lean-analytics/pareto-analysis', data);
  return response.data;
};

// ==================== Capability Analysis ====================

export const performCapabilityAnalysis = async (data: {
  name: string;
  process_name: string;
  characteristic: string;
  data: number[];
  usl: number;
  lsl: number;
  target?: number;
}): Promise<CapabilityResult> => {
  const response = await apiClient.post('/lean-analytics/capability-analysis', data);
  return response.data;
};

export const getCapabilityStudies = async (): Promise<any[]> => {
  const response = await apiClient.get('/lean-analytics/capability-studies');
  return response.data;
};

// ==================== Predictive Analytics ====================

export const predictOEETrend = async (data: {
  oee_history: { oee: number; date?: string }[];
  forecast_days?: number;
}): Promise<OEETrendResult> => {
  const response = await apiClient.post('/lean-analytics/predict/oee-trend', data);
  return response.data;
};

export const identifyBottlenecks = async (data: {
  process_data: {
    name: string;
    cycle_time: number;
    takt_time?: number;
    wait_time?: number;
    utilization?: number;
    wip?: number;
    wip_limit?: number;
  }[];
}): Promise<BottleneckResult> => {
  const response = await apiClient.post('/lean-analytics/analyze/bottlenecks', data);
  return response.data;
};

export const calculateTaktTime = async (data: {
  available_time_minutes: number;
  demand_units: number;
}): Promise<TaktTimeResult> => {
  const response = await apiClient.post('/lean-analytics/calculate/takt-time', data);
  return response.data;
};

// ==================== AI Analysis ====================

export const getAIAnalysis = async (data: {
  analysis_type: 'dmaic' | 'waste' | 'kaizen' | 'rca' | 'capability';
  data: Record<string, any>;
}): Promise<AIAnalysisResult> => {
  const response = await apiClient.post('/lean-analytics/ai/analyze', data);
  return response.data;
};

export const getAIRecommendations = async (analysisType?: string): Promise<AIAnalysisResult[]> => {
  const response = await apiClient.get('/lean-analytics/ai/recommendations', {
    params: { analysis_type: analysisType }
  });
  return response.data;
};

// ==================== SIPOC ====================

export const createSIPOC = async (data: {
  name: string;
  description?: string;
  process_owner?: string;
  suppliers?: { name: string; description?: string; type?: string }[];
  inputs?: { name: string; description?: string; specification?: string }[];
  process_steps?: { step_number: number; name: string; description?: string; responsible?: string }[];
  outputs?: { name: string; description?: string; specification?: string }[];
  customers?: { name: string; description?: string; type?: string; requirements?: string }[];
}): Promise<SIPOCDiagram> => {
  const response = await apiClient.post('/lean-analytics/sipoc', data);
  return response.data;
};

export const getSIPOCDiagrams = async (): Promise<SIPOCDiagram[]> => {
  const response = await apiClient.get('/lean-analytics/sipoc');
  return response.data;
};

export const getSIPOC = async (sipocId: string): Promise<SIPOCDiagram> => {
  const response = await apiClient.get(`/lean-analytics/sipoc/${sipocId}`);
  return response.data;
};

export const updateSIPOC = async (sipocId: string, data: Partial<SIPOCDiagram>): Promise<SIPOCDiagram> => {
  const response = await apiClient.put(`/lean-analytics/sipoc/${sipocId}`, data);
  return response.data;
};

// ==================== Value Stream Maps ====================

export const createVSM = async (data: {
  name: string;
  description?: string;
  product_family?: string;
  customer_demand?: number;
  process_steps?: {
    name: string;
    cycle_time: number;
    wait_time?: number;
    value_added?: boolean;
    inventory?: number;
    operators?: number;
  }[];
  information_flow?: { from: string; to: string; type: string; frequency?: string }[];
  material_flow?: { from: string; to: string; method: string; batch_size?: number }[];
}): Promise<ValueStreamMap> => {
  const response = await apiClient.post('/lean-analytics/vsm', data);
  return response.data;
};

export const getVSMs = async (): Promise<ValueStreamMap[]> => {
  const response = await apiClient.get('/lean-analytics/vsm');
  return response.data;
};

export const getVSM = async (vsmId: string): Promise<ValueStreamMap> => {
  const response = await apiClient.get(`/lean-analytics/vsm/${vsmId}`);
  return response.data;
};

// ==================== Process Flow Diagrams ====================

export const createProcessFlow = async (data: {
  name: string;
  description?: string;
  process_type?: string;
  nodes?: {
    id: string;
    type: string;
    name: string;
    description?: string;
    time?: number;
    distance?: number;
    value_added?: boolean;
    x_position?: number;
    y_position?: number;
  }[];
  connections?: {
    from_node_id: string;
    to_node_id: string;
    label?: string;
    condition?: string;
  }[];
  swimlanes?: {
    id: string;
    name: string;
    department?: string;
    color?: string;
  }[];
}): Promise<ProcessFlowDiagram> => {
  const response = await apiClient.post('/lean-analytics/process-flow', data);
  return response.data;
};

export const getProcessFlows = async (): Promise<ProcessFlowDiagram[]> => {
  const response = await apiClient.get('/lean-analytics/process-flow');
  return response.data;
};

export const getProcessFlow = async (flowId: string): Promise<ProcessFlowDiagram> => {
  const response = await apiClient.get(`/lean-analytics/process-flow/${flowId}`);
  return response.data;
};

// ==================== Exports ====================

export const exportCapabilityPDF = async (studyId: string): Promise<Blob> => {
  const response = await apiClient.get(`/lean-analytics/export/capability/${studyId}/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportCapabilityExcel = async (studyId: string): Promise<Blob> => {
  const response = await apiClient.get(`/lean-analytics/export/capability/${studyId}/excel`, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportControlChartExcel = async (chartId: string): Promise<Blob> => {
  const response = await apiClient.get(`/lean-analytics/export/control-chart/${chartId}/excel`, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportParetoExcel = async (data: {
  categories: string[];
  values: number[];
  labels?: string[];
}): Promise<Blob> => {
  const response = await apiClient.post('/lean-analytics/export/pareto/excel', data, {
    responseType: 'blob'
  });
  return response.data;
};

// ==================== Utility Functions ====================

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
