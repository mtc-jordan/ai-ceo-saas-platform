import apiClient from './client';

// ============ BOARD MEETINGS ============

export const getMeetings = async (params?: {
  status?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
}) => {
  const response = await apiClient.get('/governai/meetings', { params });
  return response.data;
};

export const getMeeting = async (meetingId: string) => {
  const response = await apiClient.get(`/governai/meetings/${meetingId}`);
  return response.data;
};

export const createMeeting = async (data: {
  title: string;
  meeting_type: string;
  scheduled_date: string;
  scheduled_end_date?: string;
  location?: string;
  virtual_link?: string;
  is_virtual?: boolean;
  description?: string;
  objectives?: string[];
  agenda_items?: Array<{
    order: number;
    title: string;
    description?: string;
    duration_minutes?: number;
    presenter_name?: string;
  }>;
}) => {
  const response = await apiClient.post('/governai/meetings', data);
  return response.data;
};

export const updateMeeting = async (meetingId: string, data: any) => {
  const response = await apiClient.put(`/governai/meetings/${meetingId}`, data);
  return response.data;
};

export const getMeetingStats = async () => {
  const response = await apiClient.get('/governai/meetings/stats/summary');
  return response.data;
};

// ============ BOARD MEMBERS ============

export const getBoardMembers = async (activeOnly: boolean = true) => {
  const response = await apiClient.get('/governai/members', {
    params: { active_only: activeOnly }
  });
  return response.data;
};

export const createBoardMember = async (data: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  role?: string;
  company?: string;
  position?: string;
  bio?: string;
  expertise?: string[];
  committee_memberships?: string[];
  is_independent?: boolean;
}) => {
  const response = await apiClient.post('/governai/members', data);
  return response.data;
};

// ============ DOCUMENTS ============

export const getDocuments = async (params?: {
  meeting_id?: string;
  document_type?: string;
  limit?: number;
}) => {
  const response = await apiClient.get('/governai/documents', { params });
  return response.data;
};

export const createDocument = async (data: {
  title: string;
  document_type: string;
  meeting_id?: string;
  description?: string;
  content?: string;
  is_confidential?: boolean;
}) => {
  const response = await apiClient.post('/governai/documents', data);
  return response.data;
};

// ============ RESOLUTIONS ============

export const getResolutions = async (params?: {
  status?: string;
  limit?: number;
}) => {
  const response = await apiClient.get('/governai/resolutions', { params });
  return response.data;
};

export const createResolution = async (data: {
  title: string;
  description: string;
  resolution_type?: string;
  meeting_id?: string;
  approval_threshold?: number;
  voting_deadline?: string;
}) => {
  const response = await apiClient.post('/governai/resolutions', data);
  return response.data;
};

export const castVote = async (resolutionId: string, data: {
  vote: 'for' | 'against' | 'abstain';
  comments?: string;
}) => {
  const response = await apiClient.post(`/governai/resolutions/${resolutionId}/vote`, data);
  return response.data;
};

export const getResolutionStats = async () => {
  const response = await apiClient.get('/governai/resolutions/stats/summary');
  return response.data;
};

// ============ INVESTMENTS ============

export const getInvestments = async (params?: {
  status?: string;
  investment_type?: string;
  limit?: number;
}) => {
  const response = await apiClient.get('/governai/investments', { params });
  return response.data;
};

export const createInvestment = async (data: {
  name: string;
  investment_type: string;
  target_company?: string;
  industry?: string;
  description?: string;
  investment_amount?: number;
  ownership_percentage?: number;
  valuation?: number;
  expected_irr?: number;
  risk_level?: string;
}) => {
  const response = await apiClient.post('/governai/investments', data);
  return response.data;
};

export const getPortfolioSummary = async () => {
  const response = await apiClient.get('/governai/investments/portfolio/summary');
  return response.data;
};

export const analyzeInvestment = async (investmentId: string, options?: {
  include_comparables?: boolean;
  include_risks?: boolean;
  include_projections?: boolean;
}) => {
  const response = await apiClient.post(`/governai/investments/${investmentId}/analyze`, options);
  return response.data;
};

// ============ COMPLIANCE ============

export const getComplianceItems = async (params?: {
  status?: string;
  category?: string;
  limit?: number;
}) => {
  const response = await apiClient.get('/governai/compliance', { params });
  return response.data;
};

export const createComplianceItem = async (data: {
  title: string;
  category: string;
  regulation?: string;
  description?: string;
  risk_level?: string;
  due_date?: string;
  responsible_party?: string;
}) => {
  const response = await apiClient.post('/governai/compliance', data);
  return response.data;
};

export const getComplianceSummary = async () => {
  const response = await apiClient.get('/governai/compliance/summary');
  return response.data;
};

// ============ ESG ============

export const getESGMetrics = async (category?: string) => {
  const response = await apiClient.get('/governai/esg/metrics', {
    params: category ? { category } : undefined
  });
  return response.data;
};

export const createESGMetric = async (data: {
  category: string;
  metric_name: string;
  current_value?: number;
  target_value?: number;
  unit?: string;
}) => {
  const response = await apiClient.post('/governai/esg/metrics', data);
  return response.data;
};

export const getESGScores = async () => {
  const response = await apiClient.get('/governai/esg/scores');
  return response.data;
};

export const generateESGReport = async (data: {
  title: string;
  reporting_period: string;
  report_type?: string;
}) => {
  const response = await apiClient.post('/governai/esg/reports', data);
  return response.data;
};

// ============ DASHBOARD ============

export const getGovernAIDashboard = async () => {
  const response = await apiClient.get('/governai/dashboard');
  return response.data;
};
