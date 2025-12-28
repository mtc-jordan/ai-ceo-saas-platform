import apiClient from './client';

// ============== Types ==============

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  scenario_type: string;
  status: string;
  time_horizon_months: number;
  base_assumptions: Record<string, any>;
  variables: ScenarioVariable[];
  outcomes: Record<string, any>;
  ai_analysis?: string;
  ai_recommendations: any[];
  is_favorite: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ScenarioVariable {
  name: string;
  display_name: string;
  current_value: number;
  modified_value: number;
  unit: string;
  category?: string;
}

export interface ScenarioOutcome {
  metric: string;
  display_name: string;
  baseline_value: number;
  projected_value: number;
  change_percent: number;
  confidence: number;
  unit: string;
}

export interface ScenarioAnalysisResult {
  outcomes: ScenarioOutcome[];
  ai_analysis?: string;
  ai_recommendations: any[];
  confidence_score: number;
  warnings: string[];
}

export interface Competitor {
  id: string;
  name: string;
  website?: string;
  description?: string;
  logo_url?: string;
  industry?: string;
  founded_year?: number;
  headquarters?: string;
  employee_count?: string;
  funding_stage?: string;
  total_funding?: number;
  threat_level: number;
  market_overlap: number;
  is_primary: boolean;
  strengths: string[];
  weaknesses: string[];
  recent_moves: any[];
  created_at: string;
  updated_at: string;
}

export interface CompetitorAnalysis {
  competitor_id: string;
  competitor_name: string;
  overall_threat_assessment: string;
  strengths: string[];
  weaknesses: string[];
  opportunities_against: string[];
  threats_from: string[];
  recommended_actions: any[];
  market_position_summary: string;
}

export interface MarketIntelligence {
  id: string;
  title: string;
  summary?: string;
  category: string;
  subcategory?: string;
  source_url?: string;
  source_name?: string;
  relevance_score: number;
  ai_summary?: string;
  ai_implications: string[];
  ai_action_items: any[];
  tags: string[];
  is_bookmarked: boolean;
  published_at?: string;
  created_at: string;
}

export interface StrategicRecommendation {
  id: string;
  title: string;
  description?: string;
  rationale?: string;
  category?: string;
  priority: string;
  potential_impact?: string;
  estimated_roi?: number;
  confidence_score?: number;
  action_items: any[];
  resources_required: any[];
  timeline_weeks?: number;
  status: string;
  source_type?: string;
  created_at: string;
}

export interface ExecutiveSummary {
  id: string;
  period_type: string;
  period_start: string;
  period_end: string;
  key_highlights: any[];
  performance_summary: Record<string, any>;
  competitive_landscape: Record<string, any>;
  market_trends: any[];
  risks_and_opportunities: Record<string, any>;
  recommendations: any[];
  executive_narrative?: string;
  created_at: string;
}

export interface AthenaDashboard {
  active_scenarios_count: number;
  tracked_competitors_count: number;
  pending_recommendations_count: number;
  recent_market_intel_count: number;
  top_recommendations: any[];
  competitor_alerts: any[];
  market_trends: any[];
  latest_summary?: any;
}

// ============== Scenarios API ==============

export const getScenarioTemplates = async () => {
  const response = await apiClient.get('/athena/scenarios/templates');
  return response.data;
};

export const createScenario = async (data: {
  name: string;
  description?: string;
  scenario_type: string;
  time_horizon_months: number;
  base_assumptions: Record<string, any>;
  variables?: any[];
  tags?: string[];
}): Promise<Scenario> => {
  const response = await apiClient.post('/athena/scenarios', data);
  return response.data;
};

export const listScenarios = async (params?: {
  scenario_type?: string;
  status?: string;
  is_favorite?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Scenario[]> => {
  const response = await apiClient.get('/athena/scenarios', { params });
  return response.data;
};

export const getScenario = async (id: string): Promise<Scenario> => {
  const response = await apiClient.get(`/athena/scenarios/${id}`);
  return response.data;
};

export const updateScenario = async (id: string, data: Partial<Scenario>): Promise<Scenario> => {
  const response = await apiClient.patch(`/athena/scenarios/${id}`, data);
  return response.data;
};

export const deleteScenario = async (id: string): Promise<void> => {
  await apiClient.delete(`/athena/scenarios/${id}`);
};

export const analyzeScenario = async (
  id: string,
  variables: ScenarioVariable[],
  includeAI: boolean = true
): Promise<ScenarioAnalysisResult> => {
  const response = await apiClient.post(`/athena/scenarios/${id}/analyze`, {
    variables,
    include_ai_analysis: includeAI
  });
  return response.data;
};

export const toggleScenarioFavorite = async (id: string): Promise<{ is_favorite: boolean }> => {
  const response = await apiClient.post(`/athena/scenarios/${id}/favorite`);
  return response.data;
};

export const compareScenarios = async (name: string, scenarioIds: string[]) => {
  const response = await apiClient.post('/athena/scenarios/compare', null, {
    params: { name, scenario_ids: scenarioIds }
  });
  return response.data;
};

// ============== Competitors API ==============

export const createCompetitor = async (data: {
  name: string;
  website?: string;
  description?: string;
  industry?: string;
  threat_level?: number;
  market_overlap?: number;
  is_primary?: boolean;
}): Promise<Competitor> => {
  const response = await apiClient.post('/athena/competitors', data);
  return response.data;
};

export const listCompetitors = async (params?: {
  is_primary?: boolean;
  min_threat_level?: number;
  limit?: number;
  offset?: number;
}): Promise<Competitor[]> => {
  const response = await apiClient.get('/athena/competitors', { params });
  return response.data;
};

export const getCompetitor = async (id: string): Promise<Competitor> => {
  const response = await apiClient.get(`/athena/competitors/${id}`);
  return response.data;
};

export const updateCompetitor = async (id: string, data: Partial<Competitor>): Promise<Competitor> => {
  const response = await apiClient.patch(`/athena/competitors/${id}`, data);
  return response.data;
};

export const deleteCompetitor = async (id: string): Promise<void> => {
  await apiClient.delete(`/athena/competitors/${id}`);
};

export const analyzeCompetitor = async (id: string): Promise<CompetitorAnalysis> => {
  const response = await apiClient.post(`/athena/competitors/${id}/analyze`);
  return response.data;
};

export const getCompetitiveLandscape = async () => {
  const response = await apiClient.get('/athena/competitors/landscape');
  return response.data;
};

export const addCompetitorUpdate = async (competitorId: string, data: {
  title: string;
  summary?: string;
  update_type: string;
  sentiment: string;
  importance: number;
}) => {
  const response = await apiClient.post(`/athena/competitors/${competitorId}/updates`, data);
  return response.data;
};

export const getCompetitorUpdates = async (competitorId: string, days?: number) => {
  const response = await apiClient.get(`/athena/competitors/${competitorId}/updates`, {
    params: { days }
  });
  return response.data;
};

// ============== Market Intelligence API ==============

export const createIntelligence = async (data: {
  title: string;
  summary?: string;
  category: string;
  source_url?: string;
  tags?: string[];
}): Promise<MarketIntelligence> => {
  const response = await apiClient.post('/athena/intelligence', data);
  return response.data;
};

export const listIntelligence = async (params?: {
  category?: string;
  is_bookmarked?: boolean;
  min_relevance?: number;
  days?: number;
  limit?: number;
}): Promise<MarketIntelligence[]> => {
  const response = await apiClient.get('/athena/intelligence', { params });
  return response.data;
};

export const toggleIntelligenceBookmark = async (id: string) => {
  const response = await apiClient.post(`/athena/intelligence/${id}/bookmark`);
  return response.data;
};

export const getTrendingTopics = async (days?: number) => {
  const response = await apiClient.get('/athena/intelligence/trending', { params: { days } });
  return response.data;
};

// ============== Recommendations API ==============

export const listRecommendations = async (params?: {
  status?: string;
  category?: string;
  priority?: string;
  limit?: number;
}): Promise<StrategicRecommendation[]> => {
  const response = await apiClient.get('/athena/recommendations', { params });
  return response.data;
};

export const updateRecommendationStatus = async (id: string, status: string, dismissedReason?: string) => {
  const response = await apiClient.patch(`/athena/recommendations/${id}/status`, {
    status,
    dismissed_reason: dismissedReason
  });
  return response.data;
};

// ============== Executive Summaries API ==============

export const generateExecutiveSummary = async (data: {
  period_type: string;
  include_competitors?: boolean;
  include_market_intel?: boolean;
  include_scenarios?: boolean;
}): Promise<ExecutiveSummary> => {
  const response = await apiClient.post('/athena/summaries/generate', data);
  return response.data;
};

export const getLatestSummary = async (periodType?: string): Promise<ExecutiveSummary | null> => {
  const response = await apiClient.get('/athena/summaries/latest', {
    params: { period_type: periodType }
  });
  return response.data;
};

export const listSummaries = async (params?: {
  period_type?: string;
  limit?: number;
}): Promise<ExecutiveSummary[]> => {
  const response = await apiClient.get('/athena/summaries', { params });
  return response.data;
};

// ============== Dashboard API ==============

export const getAthenaDashboard = async (): Promise<AthenaDashboard> => {
  const response = await apiClient.get('/athena/dashboard');
  return response.data;
};
