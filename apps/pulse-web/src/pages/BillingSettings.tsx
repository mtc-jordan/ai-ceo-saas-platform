import { useState } from 'react';

// Billing & Subscription Management Page
export default function BillingSettings() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  // Current subscription data
  const subscription = {
    plan: 'voyager',
    planName: 'Voyager',
    status: 'active',
    billingInterval: 'monthly',
    amount: 149,
    currentPeriodStart: '2024-12-01',
    currentPeriodEnd: '2025-01-01',
    cancelAtPeriodEnd: false,
    trialEnd: null
  };

  // NovaVerse subscription plans
  const plans = [
    {
      id: 'explorer',
      name: 'Explorer',
      monthlyPrice: 49,
      yearlyPrice: 39,
      features: ['Nova Pulse Dashboard', 'Basic AI Insights', '5 Team Members', 'Email Support', '1 Data Source'],
      popular: false
    },
    {
      id: 'voyager',
      name: 'Voyager',
      monthlyPrice: 149,
      yearlyPrice: 119,
      features: ['All Explorer features', 'Nova Mind Strategic AI', 'Nova Shield Governance', '25 Team Members', 'Priority Support', '10 Data Sources', 'Custom Reports'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 499,
      yearlyPrice: 399,
      features: ['All Voyager features', 'Nova Forge Process Optimization', 'Unlimited Team Members', 'Dedicated Account Manager', 'Unlimited Data Sources', 'White-Label Options', 'API Access', 'SSO/SAML'],
      popular: false
    }
  ];

  // Invoices
  const invoices = [
    { id: 'inv_001', date: '2024-12-01', amount: 299, status: 'paid', pdfUrl: '#' },
    { id: 'inv_002', date: '2024-11-01', amount: 299, status: 'paid', pdfUrl: '#' },
    { id: 'inv_003', date: '2024-10-01', amount: 299, status: 'paid', pdfUrl: '#' },
    { id: 'inv_004', date: '2024-09-01', amount: 299, status: 'paid', pdfUrl: '#' },
  ];

  // Payment methods
  const paymentMethods = [
    { id: 'pm_001', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025, isDefault: true },
    { id: 'pm_002', brand: 'mastercard', last4: '5555', expMonth: 6, expYear: 2026, isDefault: false },
  ];

  // Usage data
  const usage = {
    users: { current: 12, limit: 50 },
    aiQueries: { current: 847, limit: -1 },
    storage: { current: 23.5, limit: 100 },
    apiCalls: { current: 15420, limit: -1 }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'plans', label: 'Plans', icon: '📦' },
    { id: 'invoices', label: 'Invoices', icon: '📄' },
    { id: 'payment', label: 'Payment Methods', icon: '💳' },
    { id: 'usage', label: 'Usage', icon: '📈' },
  ];

  const getCardIcon = (brand: string) => {
    switch (brand) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      default: return '💳';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-slate-400">Manage your subscription, payment methods, and view invoices</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 mb-6 border-b border-slate-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
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
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold">{subscription.planName} Plan</h2>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-slate-400 mb-4">
                    ${subscription.amount}/month • Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      Upgrade Plan
                    </button>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold">${subscription.amount}</p>
                  <p className="text-slate-400">per month</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Next Invoice</p>
                <p className="text-xl font-bold">${subscription.amount}</p>
                <p className="text-xs text-slate-500">Due {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Users</p>
                <p className="text-xl font-bold">{usage.users.current} / {usage.users.limit}</p>
                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(usage.users.current / usage.users.limit) * 100}%` }}></div>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Storage Used</p>
                <p className="text-xl font-bold">{usage.storage.current} GB</p>
                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(usage.storage.current / usage.storage.limit) * 100}%` }}></div>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">AI Queries</p>
                <p className="text-xl font-bold">{usage.aiQueries.current.toLocaleString()}</p>
                <p className="text-xs text-green-400">Unlimited</p>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Invoices</h3>
                <button onClick={() => setActiveTab('invoices')} className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {invoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">📄</div>
                      <div>
                        <p className="font-medium">{new Date(invoice.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        <p className="text-sm text-slate-500">{invoice.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Paid</span>
                      <span className="font-medium">${invoice.amount}</span>
                      <button className="text-indigo-400 hover:text-indigo-300 text-sm">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Billing Interval Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={billingInterval === 'monthly' ? 'text-white' : 'text-slate-400'}>Monthly</span>
              <button
                onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-7 bg-slate-700 rounded-full relative"
              >
                <span className={`absolute top-1 w-5 h-5 bg-indigo-500 rounded-full transition-all ${
                  billingInterval === 'yearly' ? 'right-1' : 'left-1'
                }`}></span>
              </button>
              <span className={billingInterval === 'yearly' ? 'text-white' : 'text-slate-400'}>
                Yearly <span className="text-green-400 text-sm">(Save 20%)</span>
              </span>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-slate-900/50 border rounded-2xl p-6 transition-all ${
                    plan.id === subscription.plan
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : plan.popular
                      ? 'border-purple-500/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-medium">
                      Most Popular
                    </div>
                  )}
                  {plan.id === subscription.plan && (
                    <div className="absolute -top-3 right-4 px-3 py-1 bg-indigo-500 rounded-full text-xs font-medium">
                      Current Plan
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">
                      ${billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-slate-400">/month</span>
                    {billingInterval === 'yearly' && (
                      <p className="text-sm text-slate-500">Billed annually</p>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setShowUpgradeModal(true);
                    }}
                    disabled={plan.id === subscription.plan}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      plan.id === subscription.plan
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : plan.id === 'enterprise'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-indigo-500 hover:bg-indigo-600'
                    }`}
                  >
                    {plan.id === subscription.plan ? 'Current Plan' : 
                     plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === subscription.plan) ? 'Upgrade' : 'Downgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold">Invoice History</h3>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm">
                Download All
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Invoice</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono text-sm">{invoice.id}</td>
                    <td className="px-6 py-4">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">${invoice.amount}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-400 hover:text-indigo-300 text-sm">Download PDF</button>
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
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Payment Methods</h3>
              <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium">
                Add Payment Method
              </button>
            </div>
            
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className={`bg-slate-900/50 border rounded-xl p-4 flex items-center justify-between ${
                  method.isDefault ? 'border-indigo-500' : 'border-slate-800'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-xl">
                      {getCardIcon(method.brand)}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{method.brand} •••• {method.last4}</p>
                      <p className="text-sm text-slate-400">Expires {method.expMonth}/{method.expYear}</p>
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs">Default</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm">
                        Set Default
                      </button>
                    )}
                    <button className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Users */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Users</h3>
                  <span className="text-2xl font-bold">{usage.users.current} / {usage.users.limit}</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(usage.users.current / usage.users.limit) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-400">{usage.users.limit - usage.users.current} seats remaining</p>
              </div>

              {/* Storage */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Storage</h3>
                  <span className="text-2xl font-bold">{usage.storage.current} GB / {usage.storage.limit} GB</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${(usage.storage.current / usage.storage.limit) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-400">{(usage.storage.limit - usage.storage.current).toFixed(1)} GB remaining</p>
              </div>

              {/* AI Queries */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">AI Queries This Month</h3>
                  <span className="text-2xl font-bold">{usage.aiQueries.current.toLocaleString()}</span>
                </div>
                <p className="text-sm text-green-400">✓ Unlimited on your plan</p>
              </div>

              {/* API Calls */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">API Calls This Month</h3>
                  <span className="text-2xl font-bold">{usage.apiCalls.current.toLocaleString()}</span>
                </div>
                <p className="text-sm text-green-400">✓ Unlimited on your plan</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Plan Change</h3>
            <p className="text-slate-400 mb-6">
              You are about to change your plan. Your new billing will be prorated.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600">
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Cancel Subscription</h3>
            <p className="text-slate-400 mb-4">
              Are you sure you want to cancel? You'll lose access to premium features at the end of your billing period.
            </p>
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">Tell us why you're leaving (optional)</label>
              <textarea 
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg resize-none"
                rows={3}
                placeholder="Your feedback helps us improve..."
              ></textarea>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                Keep Subscription
              </button>
              <button className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
