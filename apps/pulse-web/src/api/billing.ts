/**
 * Billing API Client for NovaVerse
 * Handles subscription management, payments, and billing operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface Plan {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  features: string[];
  limits: {
    users: number;
    ai_queries: number;
    storage_gb: number;
  };
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  billing_interval: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  amount: number;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  date: string;
  pdf_url: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

interface CheckoutSession {
  session_id: string;
  checkout_url: string;
}

interface BillingPortal {
  portal_url: string;
}

class BillingApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/billing`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<{ success: boolean; plans: Record<string, Plan> }> {
    return this.request('/plans');
  }

  /**
   * Get a specific plan by ID
   */
  async getPlan(planId: string): Promise<{ success: boolean; plan: Plan }> {
    return this.request(`/plans/${planId}`);
  }

  /**
   * Get current subscription details
   */
  async getSubscription(): Promise<{ success: boolean; subscription: Subscription }> {
    return this.request('/subscription');
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckout(
    plan: string,
    billingInterval: 'monthly' | 'yearly' = 'monthly'
  ): Promise<{ success: boolean; session_id: string; checkout_url: string }> {
    const successUrl = `${window.location.origin}/app/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/app/billing?canceled=true`;

    return this.request('/checkout', {
      method: 'POST',
      body: JSON.stringify({
        plan,
        billing_interval: billingInterval,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });
  }

  /**
   * Update subscription plan
   */
  async updateSubscription(
    newPlan?: string,
    newBillingInterval?: 'monthly' | 'yearly'
  ): Promise<{ success: boolean; subscription: Subscription }> {
    return this.request('/subscription', {
      method: 'PUT',
      body: JSON.stringify({
        new_plan: newPlan,
        new_billing_interval: newBillingInterval,
      }),
    });
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    immediately: boolean = false,
    feedback?: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request('/subscription/cancel', {
      method: 'POST',
      body: JSON.stringify({
        immediately,
        feedback,
      }),
    });
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(): Promise<{ success: boolean; message: string }> {
    return this.request('/subscription/reactivate', {
      method: 'POST',
    });
  }

  /**
   * Get Stripe Billing Portal URL
   */
  async getBillingPortal(): Promise<{ success: boolean; portal_url: string }> {
    const returnUrl = `${window.location.origin}/app/billing`;
    return this.request(`/portal?return_url=${encodeURIComponent(returnUrl)}`);
  }

  /**
   * Get invoices
   */
  async getInvoices(limit: number = 10): Promise<{ success: boolean; invoices: Invoice[] }> {
    return this.request(`/invoices?limit=${limit}`);
  }

  /**
   * Get upcoming invoice
   */
  async getUpcomingInvoice(): Promise<{ success: boolean; invoice: any }> {
    return this.request('/invoices/upcoming');
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<{ success: boolean; payment_methods: PaymentMethod[] }> {
    return this.request('/payment-methods');
  }

  /**
   * Add a payment method
   */
  async addPaymentMethod(
    paymentMethodId: string,
    setDefault: boolean = true
  ): Promise<{ success: boolean; payment_method: PaymentMethod }> {
    return this.request('/payment-methods', {
      method: 'POST',
      body: JSON.stringify({
        payment_method_id: paymentMethodId,
        set_default: setDefault,
      }),
    });
  }

  /**
   * Remove a payment method
   */
  async removePaymentMethod(paymentMethodId: string): Promise<{ success: boolean }> {
    return this.request(`/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<{ success: boolean }> {
    return this.request(`/payment-methods/${paymentMethodId}/default`, {
      method: 'POST',
    });
  }

  /**
   * Apply a coupon code
   */
  async applyCoupon(couponCode: string): Promise<{ success: boolean; coupon: any }> {
    return this.request('/coupon/apply', {
      method: 'POST',
      body: JSON.stringify({
        coupon_code: couponCode,
      }),
    });
  }

  /**
   * Get usage statistics
   */
  async getUsage(): Promise<{ success: boolean; usage: any }> {
    return this.request('/usage');
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(plan: string, billingInterval: 'monthly' | 'yearly' = 'monthly'): Promise<void> {
    const { checkout_url } = await this.createCheckout(plan, billingInterval);
    window.location.href = checkout_url;
  }

  /**
   * Redirect to Stripe Billing Portal
   */
  async redirectToBillingPortal(): Promise<void> {
    const { portal_url } = await this.getBillingPortal();
    window.location.href = portal_url;
  }
}

export const billingApi = new BillingApi();
export default billingApi;
