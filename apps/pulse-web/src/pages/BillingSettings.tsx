import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { billingApi } from '../api/billing';

// Types
interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular: boolean;
  icon: string;
}

interface Subscription {
  plan: string;
  planName: string;
  status: string;
  billingInterval: string;
  amount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  pdfUrl: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

// Billing & Subscription Management Page
export default function BillingSettings() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [_showUpgradeModal, _setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [_selectedPlan, _setSelectedPlan] = useState('');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessModal(true);
    }
    if (searchParams.get('canceled') === 'true') {
      setError('Payment was canceled. Please try again.');
    }
  }, [searchParams]);

  // Current subscription data
  const [subscription, setSubscription] = useState<Subscription>({
    plan: 'voyager',
    planName: 'Voyager',
    status: 'active',
    billingInterval: 'monthly',
    amount: 149,
    currentPeriodStart: '2024-12-01',
    currentPeriodEnd: '2025-01-01',
    cancelAtPeriodEnd: false,
  });

  // NovaVerse subscription plans
  const plans: Plan[] = [
    {
      id: 'explorer',
      name: 'Explorer',
      monthlyPrice: 49,
      yearlyPrice: 39,
      icon: '🚀',
      features: [
        'Nova Pulse Dashboard',
        'Basic AI Insights',
        '5 Team Members',
        'Email Support',
        '1 Data Source',
        '50 AI Queries/month',
        '5GB Storage',
      ],
      popular: false,
    },
    {
      id: 'voyager',
      name: 'Voyager',
      monthlyPrice: 149,
      yearlyPrice: 119,
      icon: '🛸',
      features: [
        'Everything in Explorer',
        'Nova Mind Strategic AI',
        'Nova Shield Governance',
        '25 Team Members',
        'Priority Support',
        '10 Data Sources',
        'Custom Reports',
        'Unlimited AI Queries',
        '50GB Storage',
        'API Access',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 499,
      yearlyPrice: 399,
      icon: '🌌',
      features: [
        'Everything in Voyager',
        'Nova Forge Process Optimization',
        'Unlimited Team Members',
        'Dedicated Account Manager',
        'Unlimited Data Sources',
        'White-Label Options',
        'SSO/SAML Authentication',
        'Custom Integrations',
        'SLA Guarantee',
        'Unlimited Storage',
      ],
      popular: false,
    },
  ];

  // Invoices
  const invoices: Invoice[] = [
    { id: 'inv_001', date: '2024-12-01', amount: 149, status: 'paid', pdfUrl: '#' },
    { id: 'inv_002', date: '2024-11-01', amount: 149, status: 'paid', pdfUrl: '#' },
    { id: 'inv_003', date: '2024-10-01', amount: 149, status: 'paid', pdfUrl: '#' },
    { id: 'inv_004', date: '2024-09-01', amount: 149, status: 'paid', pdfUrl: '#' },
  ];

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    { id: 'pm_001', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025, isDefault: true },
    { id: 'pm_002', brand: 'mastercard', last4: '5555', expMonth: 6, expYear: 2026, isDefault: false },
  ];

  // Usage data
  const usage = {
    users: { current: 12, limit: 25, label: 'Team Members' },
    aiQueries: { current: 847, limit: -1, label: 'AI Queries' },
    storage: { current: 23.5, limit: 50, label: 'Storage (GB)' },
    dataSources: { current: 4, limit: 10, label: 'Data Sources' },
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'plans', label: 'Plans', icon: '📦' },
    { id: 'invoices', label: 'Invoices', icon: '📄' },
    { id: 'payment', label: 'Payment Methods', icon: '💳' },
    { id: 'usage', label: 'Usage', icon: '📈' },
  ];

  // Handle checkout
  const handleCheckout = async (planId: string) => {
    setIsLoading(true);
    setError('');
    try {
      await billingApi.redirectToCheckout(planId, billingInterval);
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
      setIsLoading(false);
    }
  };

  // Handle billing portal
  const handleBillingPortal = async () => {
    setIsLoading(true);
    try {
      await billingApi.redirectToBillingPortal();
    } catch (err: any) {
      setError(err.message || 'Failed to open billing portal');
      setIsLoading(false);
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await billingApi.cancelSubscription(false);
      setSubscription({ ...subscription, cancelAtPeriodEnd: true });
      setShowCancelModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  // Get card brand icon
  const getCardIcon = (brand: string) => {
    const icons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
    };
    return icons[brand] || '💳';
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate usage percentage
  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-slate-400">Manage your NovaVerse subscription, payment methods, and invoices</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-slate-900/50 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Plan Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">
                      {plans.find((p) => p.id === subscription.plan)?.icon || '🚀'}
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{subscription.planName} Plan</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            subscription.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : subscription.status === 'canceled'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </span>
                        {subscription.cancelAtPeriodEnd && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                            Cancels at period end
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 mt-4">
                    <span className="text-3xl font-bold text-white">${subscription.amount}</span>
                    <span className="text-slate-500">/{subscription.billingInterval}</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Next billing date: {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={handleBillingPortal}
                    disabled={isLoading}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all disabled:opacity-50"
                  >
                    Manage Billing
                  </button>
                </div>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-4 border-t border-slate-700">
              {Object.entries(usage).map(([key, value]) => (
                <div key={key} className="p-4 border-r border-slate-700 last:border-r-0">
                  <p className="text-sm text-slate-400">{value.label}</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {value.current}
                    {value.limit !== -1 && <span className="text-slate-500 text-sm font-normal">/{value.limit}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('invoices')}
              className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all text-left"
            >
              <span className="text-2xl">📄</span>
              <h3 className="text-white font-medium mt-2">View Invoices</h3>
              <p className="text-sm text-slate-400">Download past invoices</p>
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all text-left"
            >
              <span className="text-2xl">💳</span>
              <h3 className="text-white font-medium mt-2">Payment Methods</h3>
              <p className="text-sm text-slate-400">Manage your cards</p>
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all text-left"
            >
              <span className="text-2xl">📈</span>
              <h3 className="text-white font-medium mt-2">Usage Stats</h3>
              <p className="text-sm text-slate-400">Monitor your usage</p>
            </button>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Billing Interval Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${billingInterval === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-slate-700 rounded-full transition-colors"
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all ${
                  billingInterval === 'yearly' ? 'left-8' : 'left-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingInterval === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
              Yearly
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                Save 20%
              </span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === subscription.plan;
              const price = billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-slate-900/50 rounded-2xl border transition-all ${
                    plan.popular
                      ? 'border-cyan-500 shadow-lg shadow-cyan-500/20'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-medium rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <span className="text-4xl">{plan.icon}</span>
                      <h3 className="text-xl font-bold text-white mt-2">{plan.name}</h3>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-white">${price}</span>
                        <span className="text-slate-400">/{billingInterval === 'monthly' ? 'mo' : 'mo'}</span>
                        {billingInterval === 'yearly' && (
                          <p className="text-sm text-slate-500 mt-1">
                            Billed ${price * 12}/year
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-cyan-400 mt-0.5">✓</span>
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-3 bg-slate-700 text-slate-400 rounded-xl font-medium cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-xl font-medium transition-all disabled:opacity-50 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                        }`}
                      >
                        {isLoading ? 'Processing...' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cancel Subscription */}
          {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
            <div className="mt-8 p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Cancel Subscription</h4>
                  <p className="text-sm text-slate-400">
                    Your subscription will remain active until {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Billing History</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Invoice</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                  <td className="px-4 py-4 text-white font-medium">{invoice.id}</td>
                  <td className="px-4 py-4 text-slate-300">{formatDate(invoice.date)}</td>
                  <td className="px-4 py-4 text-white">${invoice.amount}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-500/20 text-green-400'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <a
                      href={invoice.pdfUrl}
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      Download PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
              <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-all">
                + Add Card
              </button>
            </div>
            <div className="p-4 space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    method.isDefault ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getCardIcon(method.brand)}</span>
                    <div>
                      <p className="text-white font-medium">
                        {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                      </p>
                      <p className="text-sm text-slate-400">
                        Expires {method.expMonth}/{method.expYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <button className="px-3 py-1 text-sm text-slate-400 hover:text-white transition-all">
                        Set Default
                      </button>
                    )}
                    <button className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-all">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(usage).map(([key, value]) => {
              const percentage = getUsagePercentage(value.current, value.limit);
              const isUnlimited = value.limit === -1;

              return (
                <div key={key} className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">{value.label}</h4>
                    <span className="text-slate-400 text-sm">
                      {value.current} {isUnlimited ? '' : `/ ${value.limit}`}
                    </span>
                  </div>
                  {isUnlimited ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">∞</span>
                      <span className="text-sm text-slate-400">Unlimited</span>
                    </div>
                  ) : (
                    <>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentage > 90
                              ? 'bg-red-500'
                              : percentage > 70
                              ? 'bg-yellow-500'
                              : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-400 mt-2">{percentage.toFixed(0)}% used</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Cancel Subscription?</h3>
            <p className="text-slate-400 mb-6">
              Your subscription will remain active until {formatDate(subscription.currentPeriodEnd)}.
              After that, you'll lose access to premium features.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Canceling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2">Welcome to NovaVerse!</h3>
            <p className="text-slate-400 mb-6">
              Your subscription has been activated. Explore all the new features available to you.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all"
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
