/**
 * Workflow Automation API Client
 */

import api from './axios';

// Types
export interface WorkflowTrigger {
  id: string;
  type: 'schedule' | 'event' | 'webhook' | 'manual' | 'condition';
  name: string;
  cron_expression?: string;
  event_source?: string;
  event_type?: string;
  condition_field?: string;
  condition_operator?: string;
  condition_value?: string;
  is_active: boolean;
}

export interface WorkflowAction {
  id: string;
  type: string;
  name: string;
  order: number;
  config: Record<string, any>;
  condition_enabled: boolean;
}

export interface Workflow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  category: string;
  icon: string;
  color: string;
  status: 'active' | 'paused' | 'draft' | 'archived';
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  last_run_at?: string;
  last_run_status?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  triggered_by: string;
  triggered_at: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  error_message?: string;
  action_results: Array<{
    action: string;
    status: string;
    duration_ms?: number;
    error?: string;
  }>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  triggers: any[];
  actions: any[];
  usage_count: number;
  is_featured: boolean;
}

export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  task_type: string;
  schedule_type: 'once' | 'recurring';
  scheduled_at?: string;
  cron_expression?: string;
  is_active: boolean;
  next_run_at?: string;
  last_run_at?: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
}

export interface WorkflowStats {
  total_workflows: number;
  active_workflows: number;
  paused_workflows: number;
  draft_workflows: number;
  total_executions_today: number;
  successful_executions_today: number;
  failed_executions_today: number;
  total_executions_week: number;
  success_rate: number;
  avg_execution_time_ms: number;
  scheduled_tasks: number;
  upcoming_tasks: number;
}

// API Functions

export const getWorkflows = async (params?: {
  page?: number;
  page_size?: number;
  status?: string;
  category?: string;
}) => {
  const response = await api.get('/workflows', { params });
  return response.data;
};

export const getWorkflowStats = async (): Promise<WorkflowStats> => {
  const response = await api.get('/workflows/stats');
  return response.data;
};

export const getWorkflowTemplates = async (category?: string): Promise<WorkflowTemplate[]> => {
  const response = await api.get('/workflows/templates', {
    params: category ? { category } : undefined
  });
  return response.data;
};

export const createWorkflowFromTemplate = async (templateId: string, name?: string) => {
  const response = await api.post(`/workflows/from-template/${templateId}`, null, {
    params: name ? { name } : undefined
  });
  return response.data;
};

export const getWorkflow = async (workflowId: string): Promise<Workflow> => {
  const response = await api.get(`/workflows/${workflowId}`);
  return response.data;
};

export const createWorkflow = async (workflow: {
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  triggers?: any[];
  actions?: any[];
}) => {
  const response = await api.post('/workflows', workflow);
  return response.data;
};

export const updateWorkflow = async (workflowId: string, updates: Partial<Workflow>) => {
  const response = await api.put(`/workflows/${workflowId}`, updates);
  return response.data;
};

export const deleteWorkflow = async (workflowId: string) => {
  const response = await api.delete(`/workflows/${workflowId}`);
  return response.data;
};

export const activateWorkflow = async (workflowId: string) => {
  const response = await api.post(`/workflows/${workflowId}/activate`);
  return response.data;
};

export const pauseWorkflow = async (workflowId: string) => {
  const response = await api.post(`/workflows/${workflowId}/pause`);
  return response.data;
};

export const executeWorkflow = async (workflowId: string, inputData?: Record<string, any>) => {
  const response = await api.post(`/workflows/${workflowId}/execute`, inputData);
  return response.data;
};

// Executions

export const getExecutions = async (params?: {
  workflow_id?: string;
  page?: number;
  page_size?: number;
  status?: string;
}) => {
  const response = await api.get('/workflows/executions', { params });
  return response.data;
};

export const getExecution = async (executionId: string): Promise<WorkflowExecution> => {
  const response = await api.get(`/workflows/executions/${executionId}`);
  return response.data;
};

export const cancelExecution = async (executionId: string) => {
  const response = await api.post(`/workflows/executions/${executionId}/cancel`);
  return response.data;
};

// Scheduled Tasks

export const getScheduledTasks = async (params?: {
  page?: number;
  page_size?: number;
  task_type?: string;
}) => {
  const response = await api.get('/workflows/scheduled-tasks', { params });
  return response.data;
};

export const createScheduledTask = async (task: {
  name: string;
  description?: string;
  task_type: string;
  schedule_type: 'once' | 'recurring';
  scheduled_at?: string;
  cron_expression?: string;
  config: Record<string, any>;
}) => {
  const response = await api.post('/workflows/scheduled-tasks', task);
  return response.data;
};

export const updateScheduledTask = async (taskId: string, updates: Partial<ScheduledTask>) => {
  const response = await api.put(`/workflows/scheduled-tasks/${taskId}`, updates);
  return response.data;
};

export const deleteScheduledTask = async (taskId: string) => {
  const response = await api.delete(`/workflows/scheduled-tasks/${taskId}`);
  return response.data;
};

// Action and Trigger Types

export const getActionTypes = async () => {
  const response = await api.get('/workflows/action-types');
  return response.data;
};

export const getTriggerTypes = async () => {
  const response = await api.get('/workflows/trigger-types');
  return response.data;
};
