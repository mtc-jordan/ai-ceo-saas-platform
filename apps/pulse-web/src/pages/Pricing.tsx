import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPlans, createCheckout } from '../api/subscriptions';
import type { Plan } from '../api/subscriptions';
import { useAuthStore } from '../store/authStore';

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<{ free: Plan; pro: Plan; enterprise: Plan } | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'canceled') {
      // Show canceled message
    }
  }, [searchParams]);

  const loadPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data.plans);
    } catch (error) {
      // Use default plans
      setPlans({
        free: {
          name: 'Free',
          price_monthly: 0,
          price_yearly: 0,
          features: ['1 User', 'Basic Dashboard', '5 Data Sources', 'Daily Briefings', 'Email Support'],
          limits: { users: 1, data_sources: 5, scenarios: 3, competitors: 5, ai_queries: 50 }
        },
        pro: {
          name: 'Pro',
          price_monthly: 99,
          price_yearly: 990,
          features: ['5 Users', 'Full Pulse AI Dashboard', 'Unlimited Data Sources', 'Real-time Briefings', 'Athena Strategic Planning', 'Scenario Analysis', 'Competitor Tracking', 'Priority Support'],
          limits: { users: 5, data_sources: -1, scenarios: 20, competitors: 50, ai_queries: 500 }
        },
        enterprise: {
          name: 'Enterprise',
          price_monthly: 499,
          price_yearly: 4990,
          features: ['Unlimited Users', 'Full Platform Access', 'Pulse AI + Athena + GovernAI', 'Custom Integrations', 'Board Intelligence', 'ESG Reporting', 'Investment Analysis', 'Dedicated Account Manager', 'SLA Guarantee', 'Custom AI Training'],
          limits: { users: -1, data_sources: -1, scenarios: -1, competitors: -1, ai_queries: -1 }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: 'free' | 'pro' | 'enterprise') => {
    if (planId === 'free') {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/register');
      }
      return;
    }

    if (!isAuthenticated) {
      navigate(`/register?plan=${planId}&interval=${billingInterval}`);
      return;
    }

    setCheckoutLoading(planId);
    try {
      const { checkout_url } = await createCheckout(planId, billingInterval);
      if (checkout_url.startsWith('http')) {
        window.location.href = checkout_url;
      } else {
        // Demo mode - show success
        navigate('/settings?checkout=demo');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getPrice = (plan: Plan) => {
    if (billingInterval === 'yearly') {
      return plan.price_yearly / 12;
    }
    return plan.price_monthly;
  };

  const getSavings = (plan: Plan) => {
    if (plan.price_monthly === 0) return 0;
    const yearlyMonthly = plan.price_yearly / 12;
    return Math.round((1 - yearlyMonthly / plan.price_monthly) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3">
              <img src="/novaverse-logo.png" alt="NovaVerse" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">NovaVerse</span>
            </a>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your business. Start with a 14-day free trial on any paid plan.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <span className={`text-sm ${billingInterval === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingInterval === 'yearly' ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingInterval === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingInterval === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
              Yearly
              <span className="ml-1 text-green-400 text-xs">(Save up to 17%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-slate-600 transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{plans?.free.name}</h3>
              <p className="text-slate-400 text-sm">Perfect for trying out NovaVerse</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-400">/month</span>
            </div>
            <button
              onClick={() => handleSelectPlan('free')}
              className="w-full py-3 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors mb-8"
            >
              Get Started Free
            </button>
            <ul className="space-y-3">
              {plans?.free.features.map((feature, index) => (
                <li key={index} className="flex items-center text-slate-300">
                  <CheckIcon />
                  <span className="ml-3">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan - Most Popular */}
          <div className="bg-gradient-to-b from-blue-600/20 to-slate-800/50 rounded-2xl p-8 border-2 border-blue-500 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{plans?.pro.name}</h3>
              <p className="text-slate-400 text-sm">For growing businesses</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">${getPrice(plans?.pro!)}</span>
              <span className="text-slate-400">/month</span>
              {billingInterval === 'yearly' && getSavings(plans?.pro!) > 0 && (
                <span className="ml-2 text-green-400 text-sm">Save {getSavings(plans?.pro!)}%</span>
              )}
            </div>
            <button
              onClick={() => handleSelectPlan('pro')}
              disabled={checkoutLoading === 'pro'}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-8 disabled:opacity-50"
            >
              {checkoutLoading === 'pro' ? 'Loading...' : 'Start 14-Day Trial'}
            </button>
            <ul className="space-y-3">
              {plans?.pro.features.map((feature, index) => (
                <li key={index} className="flex items-center text-slate-300">
                  <CheckIcon />
                  <span className="ml-3">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-slate-600 transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{plans?.enterprise.name}</h3>
              <p className="text-slate-400 text-sm">For large organizations</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">${getPrice(plans?.enterprise!)}</span>
              <span className="text-slate-400">/month</span>
              {billingInterval === 'yearly' && getSavings(plans?.enterprise!) > 0 && (
                <span className="ml-2 text-green-400 text-sm">Save {getSavings(plans?.enterprise!)}%</span>
              )}
            </div>
            <button
              onClick={() => handleSelectPlan('enterprise')}
              disabled={checkoutLoading === 'enterprise'}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors mb-8 disabled:opacity-50"
            >
              {checkoutLoading === 'enterprise' ? 'Loading...' : 'Contact Sales'}
            </button>
            <ul className="space-y-3">
              {plans?.enterprise.features.map((feature, index) => (
                <li key={index} className="flex items-center text-slate-300">
                  <CheckIcon />
                  <span className="ml-3">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-2">Can I switch plans later?</h3>
              <p className="text-slate-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing.</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-2">What happens after my trial ends?</h3>
              <p className="text-slate-400">After your 14-day trial, you'll be automatically charged for your selected plan. You can cancel anytime before the trial ends.</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
              <p className="text-slate-400">Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-400">We accept all major credit cards (Visa, MasterCard, American Express) and can arrange invoicing for Enterprise customers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2024 NovaVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
