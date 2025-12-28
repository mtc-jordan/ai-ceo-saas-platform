import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const features = [
    {
      icon: '📊',
      title: 'Pulse AI Dashboard',
      description: 'Real-time business intelligence with AI-powered daily briefings and predictive analytics.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🎯',
      title: 'Athena Strategic Planning',
      description: 'Scenario planning, competitor tracking, and market intelligence for strategic decisions.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🏛️',
      title: 'GovernAI Board Intelligence',
      description: 'Board meeting management, investment analysis, ESG reporting, and compliance tracking.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Insights',
      description: 'Get instant answers to complex business questions with our advanced AI assistant.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '🔗',
      title: 'Seamless Integrations',
      description: 'Connect Stripe, Google Analytics, HubSpot, and more for unified data insights.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '📈',
      title: 'Predictive Analytics',
      description: 'Forecast revenue, identify risks, and discover growth opportunities before they happen.',
      color: 'from-teal-500 to-green-500'
    }
  ];

  const testimonials = [
    {
      quote: "AI CEO transformed how we make strategic decisions. The daily briefings save me hours every week.",
      author: "Sarah Chen",
      role: "CEO, TechStart Inc.",
      avatar: "SC"
    },
    {
      quote: "The scenario planning feature helped us navigate market uncertainty with confidence.",
      author: "Michael Rodriguez",
      role: "CFO, Growth Dynamics",
      avatar: "MR"
    },
    {
      quote: "GovernAI made our board meetings 10x more efficient. Essential for any growing company.",
      author: "Emily Watson",
      role: "Board Director, Innovate Corp",
      avatar: "EW"
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Active Users' },
    { value: '500+', label: 'Companies' },
    { value: '2M+', label: 'Decisions Supported' },
    { value: '99.9%', label: 'Uptime' }
  ];

  const logos = ['Stripe', 'HubSpot', 'Google', 'Salesforce', 'Slack', 'AWS'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">✦</span>
              </div>
              <span className="text-xl font-bold text-white">AI CEO</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Testimonials</a>
            </div>
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
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
              <span className="text-blue-400 text-sm font-medium">🚀 Now with DeepSeek AI Integration</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Executive Assistant
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
              Transform your business decisions with AI-powered insights. Get real-time briefings, 
              strategic planning, and board intelligence all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="px-8 py-4 bg-slate-800 text-white rounded-xl text-lg font-semibold hover:bg-slate-700 transition-all border border-slate-700"
              >
                View Pricing
              </button>
            </div>
            <p className="mt-4 text-slate-500 text-sm">No credit card required • 14-day free trial</p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-2 shadow-2xl">
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total Revenue', value: '$328.5K', change: '+12.5%', color: 'text-green-400' },
                      { label: 'Active Users', value: '2,147', change: '+8.2%', color: 'text-green-400' },
                      { label: 'Orders', value: '1,823', change: '-2.4%', color: 'text-red-400' },
                      { label: 'Conversion', value: '3.2%', change: '+0.8%', color: 'text-green-400' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-400 text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                        <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 h-48">
                      <p className="text-white font-semibold mb-4">Revenue vs Target</p>
                      <div className="flex items-end justify-between h-32 gap-2">
                        {[40, 55, 45, 60, 75, 65, 80].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-blue-500/30 rounded-t" style={{ height: `${h}%` }}>
                              <div className="w-full bg-blue-500 rounded-t" style={{ height: '70%' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 h-48">
                      <p className="text-white font-semibold mb-4">AI Daily Briefing</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-300">✨ Revenue up 12.5% vs last month</p>
                        <p className="text-slate-300">📈 User acquisition trending positive</p>
                        <p className="text-slate-300">⚠️ Order volume needs attention</p>
                        <p className="text-slate-300">🎯 Focus: Improve conversion rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 border-y border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 text-sm mb-8">INTEGRATES WITH YOUR FAVORITE TOOLS</p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            {logos.map((logo, i) => (
              <div key={i} className="text-slate-500 text-xl font-semibold opacity-50 hover:opacity-100 transition-opacity">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Lead Smarter
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Three powerful platforms working together to give you complete business intelligence.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all hover:transform hover:scale-105"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Start free, upgrade when you're ready.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4">
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
                Yearly <span className="text-green-400">(Save 17%)</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
              <p className="text-slate-400 text-sm mb-4">For individuals</p>
              <p className="text-4xl font-bold text-white mb-6">$0<span className="text-lg text-slate-400">/mo</span></p>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors mb-6"
              >
                Get Started
              </button>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li>✓ 1 User</li>
                <li>✓ Basic Dashboard</li>
                <li>✓ 5 Data Sources</li>
                <li>✓ Daily Briefings</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-b from-blue-600/20 to-slate-800/50 rounded-2xl p-8 border-2 border-blue-500 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <p className="text-slate-400 text-sm mb-4">For growing teams</p>
              <p className="text-4xl font-bold text-white mb-6">
                ${billingInterval === 'yearly' ? '82' : '99'}
                <span className="text-lg text-slate-400">/mo</span>
              </p>
              <button
                onClick={() => navigate('/register?plan=pro')}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
              >
                Start Free Trial
              </button>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li>✓ 5 Users</li>
                <li>✓ Full Pulse AI</li>
                <li>✓ Athena Strategic Planning</li>
                <li>✓ Unlimited Data Sources</li>
                <li>✓ Priority Support</li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
              <p className="text-slate-400 text-sm mb-4">For large organizations</p>
              <p className="text-4xl font-bold text-white mb-6">
                ${billingInterval === 'yearly' ? '415' : '499'}
                <span className="text-lg text-slate-400">/mo</span>
              </p>
              <button
                onClick={() => navigate('/register?plan=enterprise')}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors mb-6"
              >
                Contact Sales
              </button>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li>✓ Unlimited Users</li>
                <li>✓ Full Platform Access</li>
                <li>✓ GovernAI Board Intelligence</li>
                <li>✓ Custom Integrations</li>
                <li>✓ Dedicated Account Manager</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-slate-400">
              See what executives are saying about AI CEO
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50"
              >
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-blue-500/20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join thousands of executives making smarter decisions with AI CEO.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Start Your Free Trial
            </button>
            <p className="mt-4 text-slate-500 text-sm">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">✦</span>
                </div>
                <span className="text-xl font-bold text-white">AI CEO</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered executive intelligence for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 mt-12 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 AI CEO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
