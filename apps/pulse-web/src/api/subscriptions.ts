import { apiClient } from './client';

export interface PlanLimits {
  users: number;
  data_sources: number;
  scenarios: number;
  competitors: number;
  ai_queries: number;
}

export interface Plan {
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: PlanLimits;
}

export interface PlansResponse {
  plans: {
    free: Plan;
    pro: Plan;
    enterprise: Plan;
  };
  currency: string;
  trial_days: number;
}

export interface SubscriptionInfo {
  id: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: string;
  billing_interval: 'monthly' | 'yearly';
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  max_users: number;
  max_data_sources: number;
  max_scenarios: number;
  max_competitors: number;
  max_ai_queries: number;
}

export interface SubscriptionUsage {
  users: number;
  data_sources: number;
  scenarios: number;
  competitors: number;
  ai_queries_this_month: number;
  max_users: number;
  max_data_sources: number;
  max_scenarios: number;
  max_competitors: number;
  max_ai_queries: number;
}

export interface CheckoutResponse {
  session_id: string;
  checkout_url: string;
}

// Get all subscription plans
export const getPlans = async (): Promise<PlansResponse> => {
  const response = await apiClient.get('/subscriptions/plans');
  return response.data;
};

// Get current subscription
export const getCurrentSubscription = async (): Promise<SubscriptionInfo> => {
  const response = await apiClient.get('/subscriptions/current');
  return response.data;
};

// Get subscription usage
export const getSubscriptionUsage = async (): Promise<SubscriptionUsage> => {
  const response = await apiClient.get('/subscriptions/usage');
  return response.data;
};

// Create checkout session
export const createCheckout = async (
  plan: 'pro' | 'enterprise',
  billingInterval: 'monthly' | 'yearly' = 'monthly'
): Promise<CheckoutResponse> => {
  const response = await apiClient.post('/subscriptions/checkout', {
    plan,
    billing_interval: billingInterval
  });
  return response.data;
};

// Create customer portal session
export const createPortalSession = async (): Promise<{ portal_url: string }> => {
  const response = await apiClient.post('/subscriptions/portal', {});
  return response.data;
};

// Update subscription
export const updateSubscription = async (
  plan: 'free' | 'pro' | 'enterprise',
  billingInterval: 'monthly' | 'yearly' = 'monthly'
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/subscriptions/update', {
    plan,
    billing_interval: billingInterval
  });
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async (
  cancelAtPeriodEnd: boolean = true,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/subscriptions/cancel', {
    cancel_at_period_end: cancelAtPeriodEnd,
    reason
  });
  return response.data;
};

// Get payment history
export const getPaymentHistory = async (): Promise<{
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    invoice_url: string | null;
    created_at: string;
  }>;
  total_count: number;
}> => {
  const response = await apiClient.get('/subscriptions/history');
  return response.data;
};
