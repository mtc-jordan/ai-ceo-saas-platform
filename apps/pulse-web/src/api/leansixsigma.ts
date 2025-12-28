import apiClient from './client';

// Types
export interface DMAICProject {
  id: string;
  name: string;
  description?: string;
  problem_statement?: string;
  goal_statement?: string;
  business_case?: string;
  current_phase: string;
  priority: string;
  belt_level: string;
  champion_id?: string;
  project_lead_id?: string;
  team_members: string[];
  in_scope: string[];
  out_of_scope: string[];
  start_date?: string;
  target_completion?: string;
  actual_completion?: string;
  baseline_metric?: number;
  target_metric?: number;
  current_metric?: number;
  metric_unit?: string;
  metric_name?: string;
  estimated_savings: number;
  actual_savings: number;
  implementation_cost: number;
  status: string;
  completion_percentage: number;
  created_at: string;
}

export interface SIPOC {
  id: string;
  project_id: string;
  process_name: string;
  process_description?: string;
  suppliers: string[];
  inputs: string[];
  process_steps: string[];
  outputs: string[];
  customers: string[];
  created_at: string;
}

export interface ProcessStep {
  step_number: number;
  name: string;
  description?: string;
  step_type: string;
  responsible?: string;
  cycle_time?: number;
  wait_time?: number;
  setup_time?: number;
  is_value_add: boolean;
  is_necessary: boolean;
  defect_rate: number;
  notes?: string;
}

export interface ProcessMap {
  id: string;
  project_id?: string;
  name: string;
  map_type: string;
  description?: string;
  steps: ProcessStep[];
  total_lead_time?: number;
  total_cycle_time?: number;
  total_wait_time?: number;
  value_add_ratio?: number;
  takt_time?: number;
  created_at: string;
}

export interface WasteItem {
  id: string;
  project_id?: string;
  waste_type: string;
  description: string;
  location?: string;
  frequency?: string;
  time_impact?: number;
  cost_impact?: number;
  quality_impact?: string;
  status: string;
  root_cause?: string;
  countermeasure?: string;
  identified_date: string;
}

export interface ControlChart {
  id: string;
  project_id?: string;
  chart_name: string;
  chart_type: string;
  metric_name?: string;
  unit?: string;
  ucl?: number;
  lcl?: number;
  center_line?: number;
  usl?: number;
  lsl?: number;
  target?: number;
  data_points: { timestamp: string; value: number }[];
  cp?: number;
  cpk?: number;
  sigma_level?: number;
  dpmo?: number;
  created_at: string;
}

export interface ParetoAnalysis {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  category_type?: string;
  items: { category: string; count: number; percentage: number; cumulative_percentage: number }[];
  total_count: number;
  vital_few_categories: string[];
  analysis_date: string;
}

export interface RootCauseAnalysis {
  id: string;
  project_id?: string;
  problem_statement: string;
  analysis_type: string;
  five_whys: { why_number: number; question: string; answer: string }[];
  fishbone_data: Record<string, { cause: string; sub_causes: string[] }[]>;
  root_causes: string[];
  verified: boolean;
  created_at: string;
}

export interface KaizenEvent {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  event_type: string;
  focus_area?: string;
  target_process?: string;
  facilitator_id?: string;
  team_members: string[];
  start_date?: string;
  end_date?: string;
  goals: { metric: string; baseline: number; target: number; actual?: number }[];
  improvements_identified: string[];
  improvements_implemented: string[];
  savings_achieved: number;
  status: string;
  created_at: string;
}

export interface ImprovementAction {
  id: string;
  project_id?: string;
  kaizen_id?: string;
  title: string;
  description?: string;
  action_type: string;
  assigned_to?: string;
  due_date?: string;
  expected_savings?: number;
  actual_savings?: number;
  status: string;
  verified: boolean;
  created_at: string;
}

export interface OEERecord {
  id: string;
  equipment_name: string;
  equipment_id?: string;
  record_date: string;
  shift?: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  total_units_produced: number;
  good_units: number;
  defective_units: number;
  downtime_losses: { reason: string; duration: number }[];
  created_at: string;
}

export interface LeanMetric {
  id: string;
  project_id?: string;
  name: string;
  category: string;
  current_value: number;
  target_value?: number;
  baseline_value?: number;
  unit?: string;
  trend?: string;
  trend_percentage?: number;
  history: { value: number; timestamp: string }[];
  last_updated: string;
}

export interface LeanSixSigmaDashboard {
  active_projects: number;
  completed_projects: number;
  total_savings: number;
  projects_by_phase: Record<string, number>;
  projects_by_belt: Record<string, number>;
  waste_items_identified: number;
  waste_items_eliminated: number;
  kaizen_events_completed: number;
  average_oee?: number;
  top_projects: DMAICProject[];
  recent_improvements: ImprovementAction[];
}

// Dashboard
export const getLeanDashboard = async (): Promise<LeanSixSigmaDashboard> => {
  const response = await apiClient.get('/lean-sixsigma/dashboard');
  return response.data;
};

// DMAIC Projects
export const createProject = async (data: Partial<DMAICProject>): Promise<DMAICProject> => {
  const response = await apiClient.post('/lean-sixsigma/projects', data);
  return response.data;
};

export const getProjects = async (params?: { phase?: string; status?: string; belt_level?: string }): Promise<DMAICProject[]> => {
  const response = await apiClient.get('/lean-sixsigma/projects', { params });
  return response.data;
};

export const getProject = async (projectId: string): Promise<DMAICProject> => {
  const response = await apiClient.get(`/lean-sixsigma/projects/${projectId}`);
  return response.data;
};

export const updateProject = async (projectId: string, data: Partial<DMAICProject>): Promise<DMAICProject> => {
  const response = await apiClient.put(`/lean-sixsigma/projects/${projectId}`, data);
  return response.data;
};

export const advanceProjectPhase = async (projectId: string): Promise<DMAICProject> => {
  const response = await apiClient.post(`/lean-sixsigma/projects/${projectId}/advance-phase`);
  return response.data;
};

// SIPOC
export const createSIPOC = async (projectId: string, data: Partial<SIPOC>): Promise<SIPOC> => {
  const response = await apiClient.post(`/lean-sixsigma/projects/${projectId}/sipoc`, data);
  return response.data;
};

export const getProjectSIPOCs = async (projectId: string): Promise<SIPOC[]> => {
  const response = await apiClient.get(`/lean-sixsigma/projects/${projectId}/sipoc`);
  return response.data;
};

// Process Maps
export const createProcessMap = async (data: Partial<ProcessMap>): Promise<ProcessMap> => {
  const response = await apiClient.post('/lean-sixsigma/process-maps', data);
  return response.data;
};

export const getProcessMaps = async (projectId?: string): Promise<ProcessMap[]> => {
  const response = await apiClient.get('/lean-sixsigma/process-maps', { params: { project_id: projectId } });
  return response.data;
};

export const getProcessMap = async (mapId: string): Promise<ProcessMap> => {
  const response = await apiClient.get(`/lean-sixsigma/process-maps/${mapId}`);
  return response.data;
};

// Waste Tracking
export const createWasteItem = async (data: Partial<WasteItem>): Promise<WasteItem> => {
  const response = await apiClient.post('/lean-sixsigma/waste', data);
  return response.data;
};

export const getWasteItems = async (params?: { waste_type?: string; status?: string; project_id?: string }): Promise<WasteItem[]> => {
  const response = await apiClient.get('/lean-sixsigma/waste', { params });
  return response.data;
};

export const updateWasteItem = async (wasteId: string, data: Partial<WasteItem>): Promise<WasteItem> => {
  const response = await apiClient.put(`/lean-sixsigma/waste/${wasteId}`, data);
  return response.data;
};

export const getWasteSummary = async (): Promise<Record<string, { count: number; total_cost: number; total_time: number }>> => {
  const response = await apiClient.get('/lean-sixsigma/waste/summary');
  return response.data;
};

// Control Charts
export const createControlChart = async (data: Partial<ControlChart> & { data_points: { timestamp: string; value: number }[] }): Promise<ControlChart> => {
  const response = await apiClient.post('/lean-sixsigma/control-charts', data);
  return response.data;
};

export const getControlCharts = async (projectId?: string): Promise<ControlChart[]> => {
  const response = await apiClient.get('/lean-sixsigma/control-charts', { params: { project_id: projectId } });
  return response.data;
};

// Pareto Analysis
export const createParetoAnalysis = async (data: { name: string; items: { category: string; count: number }[]; project_id?: string; description?: string; category_type?: string }): Promise<ParetoAnalysis> => {
  const response = await apiClient.post('/lean-sixsigma/pareto-analysis', data);
  return response.data;
};

export const getParetoAnalyses = async (projectId?: string): Promise<ParetoAnalysis[]> => {
  const response = await apiClient.get('/lean-sixsigma/pareto-analysis', { params: { project_id: projectId } });
  return response.data;
};

// Root Cause Analysis
export const createRootCauseAnalysis = async (data: Partial<RootCauseAnalysis>): Promise<RootCauseAnalysis> => {
  const response = await apiClient.post('/lean-sixsigma/root-cause-analysis', data);
  return response.data;
};

export const getRootCauseAnalyses = async (params?: { project_id?: string; analysis_type?: string }): Promise<RootCauseAnalysis[]> => {
  const response = await apiClient.get('/lean-sixsigma/root-cause-analysis', { params });
  return response.data;
};

// Kaizen Events
export const createKaizenEvent = async (data: Partial<KaizenEvent>): Promise<KaizenEvent> => {
  const response = await apiClient.post('/lean-sixsigma/kaizen', data);
  return response.data;
};

export const getKaizenEvents = async (params?: { status?: string; event_type?: string; project_id?: string }): Promise<KaizenEvent[]> => {
  const response = await apiClient.get('/lean-sixsigma/kaizen', { params });
  return response.data;
};

export const updateKaizenEvent = async (kaizenId: string, data: Partial<KaizenEvent>): Promise<KaizenEvent> => {
  const response = await apiClient.put(`/lean-sixsigma/kaizen/${kaizenId}`, data);
  return response.data;
};

// Improvement Actions
export const createImprovementAction = async (data: Partial<ImprovementAction>): Promise<ImprovementAction> => {
  const response = await apiClient.post('/lean-sixsigma/improvements', data);
  return response.data;
};

export const getImprovementActions = async (params?: { status?: string; project_id?: string; kaizen_id?: string }): Promise<ImprovementAction[]> => {
  const response = await apiClient.get('/lean-sixsigma/improvements', { params });
  return response.data;
};

export const updateImprovementAction = async (actionId: string, data: Partial<ImprovementAction>): Promise<ImprovementAction> => {
  const response = await apiClient.put(`/lean-sixsigma/improvements/${actionId}`, data);
  return response.data;
};

// OEE Records
export const createOEERecord = async (data: Partial<OEERecord> & { planned_production_time: number; actual_run_time: number; ideal_cycle_time: number }): Promise<OEERecord> => {
  const response = await apiClient.post('/lean-sixsigma/oee', data);
  return response.data;
};

export const getOEERecords = async (equipmentName?: string): Promise<OEERecord[]> => {
  const response = await apiClient.get('/lean-sixsigma/oee', { params: { equipment_name: equipmentName } });
  return response.data;
};

// Lean Metrics
export const createLeanMetric = async (data: Partial<LeanMetric>): Promise<LeanMetric> => {
  const response = await apiClient.post('/lean-sixsigma/metrics', data);
  return response.data;
};

export const getLeanMetrics = async (params?: { category?: string; project_id?: string }): Promise<LeanMetric[]> => {
  const response = await apiClient.get('/lean-sixsigma/metrics', { params });
  return response.data;
};
