import axios from 'axios';

const API_BASE = '/api/v1/okr';

// Types
export interface KeyResult {
  id: number;
  title: string;
  description?: string;
  result_type: 'percentage' | 'number' | 'currency' | 'boolean' | 'milestone';
  start_value: number;
  target_value: number;
  current_value: number;
  unit?: string;
  progress: number;
  weight: number;
  owner?: { id: number; name: string; role?: string };
  is_completed: boolean;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  level: 'company' | 'department' | 'team' | 'individual';
  status: 'draft' | 'active' | 'on_track' | 'at_risk' | 'behind' | 'completed' | 'cancelled';
  owner: { id: number; name: string; avatar?: string; role?: string };
  progress: number;
  confidence: number;
  start_date: string;
  end_date: string;
  tags: string[];
  priority: number;
  key_results: KeyResult[];
  child_goals?: Goal[];
  check_ins?: CheckIn[];
}

export interface CheckIn {
  id: number;
  status: string;
  confidence: number;
  notes?: string;
  blockers?: string;
  next_steps?: string;
  checked_in_by: string;
  created_at: string;
}

export interface OKRDashboard {
  summary: {
    total_goals: number;
    company_goals: number;
    department_goals: number;
    team_goals: number;
    average_progress: number;
    on_track: number;
    at_risk: number;
    behind: number;
    completed: number;
  };
  current_cycle: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    days_remaining: number;
    progress_expected: number;
  };
  company_goals: Goal[];
  recent_updates: any[];
}

// API functions
export const okrApi = {
  // Dashboard
  getDashboard: async (cycleId?: number): Promise<OKRDashboard> => {
    const params = cycleId ? { cycle_id: cycleId } : {};
    const response = await axios.get(`${API_BASE}/dashboard`, { params });
    return response.data;
  },

  // Goals
  listGoals: async (filters?: {
    level?: string;
    status?: string;
    owner_id?: number;
    cycle_id?: number;
  }) => {
    const response = await axios.get(`${API_BASE}/goals`, { params: filters });
    return response.data;
  },

  getGoal: async (goalId: number): Promise<Goal> => {
    const response = await axios.get(`${API_BASE}/goals/${goalId}`);
    return response.data;
  },

  createGoal: async (goalData: Partial<Goal>) => {
    const response = await axios.post(`${API_BASE}/goals`, goalData);
    return response.data;
  },

  updateGoal: async (goalId: number, goalData: Partial<Goal>) => {
    const response = await axios.put(`${API_BASE}/goals/${goalId}`, goalData);
    return response.data;
  },

  deleteGoal: async (goalId: number) => {
    const response = await axios.delete(`${API_BASE}/goals/${goalId}`);
    return response.data;
  },

  // Key Results
  updateKeyResult: async (keyResultId: number, newValue: number, note?: string) => {
    const response = await axios.put(`${API_BASE}/key-results/${keyResultId}`, {
      new_value: newValue,
      note
    });
    return response.data;
  },

  // Progress History
  getProgressHistory: async (goalId: number) => {
    const response = await axios.get(`${API_BASE}/goals/${goalId}/progress-history`);
    return response.data;
  },

  // Check-ins
  createCheckIn: async (goalId: number, checkInData: {
    status: string;
    confidence: number;
    notes?: string;
    blockers?: string;
    next_steps?: string;
  }) => {
    const response = await axios.post(`${API_BASE}/goals/${goalId}/check-in`, checkInData);
    return response.data;
  },

  getCheckIns: async (goalId: number) => {
    const response = await axios.get(`${API_BASE}/goals/${goalId}/check-ins`);
    return response.data;
  },

  // AI Recommendations
  getRecommendations: async (goalId: number) => {
    const response = await axios.get(`${API_BASE}/goals/${goalId}/recommendations`);
    return response.data;
  },

  // Alignment
  getAlignmentTree: async () => {
    const response = await axios.get(`${API_BASE}/alignment`);
    return response.data;
  },

  // My Goals
  getMyGoals: async () => {
    const response = await axios.get(`${API_BASE}/my-goals`);
    return response.data;
  },

  // Cycles
  listCycles: async () => {
    const response = await axios.get(`${API_BASE}/cycles`);
    return response.data;
  },

  createCycle: async (name: string, startDate: string, endDate: string) => {
    const response = await axios.post(`${API_BASE}/cycles`, null, {
      params: { name, start_date: startDate, end_date: endDate }
    });
    return response.data;
  }
};

export default okrApi;
