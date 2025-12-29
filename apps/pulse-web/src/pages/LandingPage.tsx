import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Modern Landing Page for NovaVerse SaaS Platform - Redesigned 2025
export default function LandingPageNew() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '🧠',
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations and predictive analytics powered by advanced AI to make better business decisions.',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: '📊',
      title: 'Executive Dashboard',
      description: 'Real-time KPIs, financial metrics, and business health indicators all in one beautiful, customizable dashboard.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: '🎯',
      title: 'OKR & Goal Tracking',
      description: 'Set company, team, and individual goals with automated progress tracking and alignment visualization.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: '📈',
      title: 'Predictive Analytics',
      description: 'Revenue forecasting, churn prediction, and anomaly detection to stay ahead of business challenges.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: '🤖',
      title: 'Meeting Assistant',
      description: 'AI-powered meeting transcription, summarization, and automatic action item extraction.',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: '📋',
      title: 'Board Governance',
      description: 'Streamline board meetings, compliance tracking, and ESG reporting with intelligent automation.',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: '🏭',
      title: 'Lean Six Sigma',
      description: 'DMAIC projects, waste tracking, OEE monitoring, and continuous improvement tools.',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      icon: '⚡',
      title: 'Workflow Automation',
      description: 'Create if-then rules, scheduled tasks, and integration triggers to automate repetitive work.',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  const testimonials = [
    {
      quote: "NovaVerse has transformed how we run our executive team. The insights are invaluable and the time savings are incredible.",
      author: "Sarah Chen",
      role: "CEO, TechVentures Inc.",
      avatar: "SC",
      rating: 5
    },
    {
      quote: "The predictive analytics helped us identify a potential churn issue before it became a crisis. Worth every penny.",
      author: "Michael Roberts",
      role: "COO, ScaleUp Solutions",
      avatar: "MR",
      rating: 5
    },
    {
      quote: "Finally, a platform that understands what executives actually need. The board governance features are exceptional.",
      author: "Jennifer Walsh",
      role: "CFO, GlobalTech Corp",
      avatar: "JW",
      rating: 5
    },
    {
      quote: "The meeting assistant alone saves our team 10+ hours per week. The AI summaries are remarkably accurate.",
      author: "David Kim",
      role: "VP Operations, InnovateCo",
      avatar: "DK",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        'Up to 10 users',
        'Executive Dashboard',
        'Basic Analytics',
        'OKR Tracking',
        'Email Support',
        '5GB Storage'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      description: 'For growing companies with advanced needs',
      monthlyPrice: 299,
      annualPrice: 249,
      features: [
        'Up to 50 users',
        'Everything in Starter',
        'AI Meeting Assistant',
        'Predictive Analytics',
        'Board Governance',
        'Lean Six Sigma',
        'Priority Support',
        '50GB Storage',
        'Custom Integrations'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with custom requirements',
      monthlyPrice: null,
      annualPrice: null,
      features: [
        'Unlimited users',
        'Everything in Professional',
        'White-label Options',
        'SSO & Advanced Security',
        'Dedicated Account Manager',
        'Custom AI Training',
        'Unlimited Storage',
        'SLA Guarantee',
        'On-premise Option'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'Start with a 14-day free trial with full access to all features. No credit card required. At the end of your trial, choose the plan that works best for your team.'
    },
    {
      question: 'Can I change plans later?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate your billing accordingly.'
    },
    {
      question: 'What integrations do you support?',
      answer: 'We integrate with popular tools like Slack, Microsoft Teams, Salesforce, HubSpot, Google Workspace, Zoom, and many more. Enterprise plans include custom integration support.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Security is our top priority. We use bank-level encryption, are SOC 2 Type II certified, and comply with GDPR. Your data is never shared with third parties.'
    },
    {
      question: 'Do you offer training and onboarding?',
      answer: 'Yes! All plans include access to our knowledge base and video tutorials. Professional and Enterprise plans include personalized onboarding sessions with our customer success team.'
    },
    {
      question: 'What AI models power the platform?',
      answer: 'We use a combination of proprietary models and leading AI providers including OpenAI and DeepSeek. Our AI is continuously trained on business intelligence data to provide the most relevant insights.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Companies Trust Us' },
    { value: '50M+', label: 'Decisions Powered' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '4.9/5', label: 'Customer Rating' }
  ];

  const logos = ['Microsoft', 'Google', 'Amazon', 'Salesforce', 'HubSpot', 'Slack'];

  const modules = [
    { name: 'Pulse AI', desc: 'Executive Dashboard & Briefings', icon: '📊' },
    { name: 'Athena', desc: 'Strategic Planning & Scenarios', icon: '🎯' },
    { name: 'GovernAI', desc: 'Board Governance & Compliance', icon: '🏛️' },
    { name: 'Lean Six Sigma', desc: 'Process Improvement & OEE', icon: '🏭' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-950/95 backdrop-blur-lg shadow-lg shadow-black/10' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-3">
              <img src="/novaverse-logo.png" alt="NovaVerse" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">NovaVerse</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Features</a>
              <a href="#modules" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Modules</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Pricing</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Testimonials</a>
              <a href="#faq" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">FAQ</a>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="hidden sm:block text-slate-300 hover:text-white transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25"
                  >
                    Get Started Free
                  </button>
                </>
              )}
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
                <a href="#modules" className="text-slate-300 hover:text-white transition-colors">Modules</a>
                <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
                <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Testimonials</a>
                <a href="#faq" className="text-slate-300 hover:text-white transition-colors">FAQ</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/4 left-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              New: AI Meeting Assistant with Auto-Transcription
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
              The AI-Powered Business Platform for{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Modern Executives
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transform your executive operations with intelligent insights, automated workflows, and predictive analytics. Make better decisions, faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5"
              >
                Start Free 14-Day Trial
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 transition-all">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Demo
              </button>
            </div>

            <p className="text-slate-500 text-sm mb-16">No credit card required • Cancel anytime • Full feature access</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 pt-8 border-t border-slate-800/50">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none"></div>
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-1.5 sm:p-2 shadow-2xl shadow-black/50">
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 text-center text-sm text-slate-500">NovaVerse Executive Dashboard</div>
                </div>
                <div className="p-4 sm:p-6">
                  {/* Dashboard mockup */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    {[
                      { label: 'Revenue', value: '$2.4M', change: '+12.5%', positive: true },
                      { label: 'Active Users', value: '8,432', change: '+8.2%', positive: true },
                      { label: 'OEE Score', value: '87%', change: '+3.1%', positive: true },
                      { label: 'NPS Score', value: '72', change: '+5', positive: true }
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-700/50">
                        <p className="text-slate-400 text-xs sm:text-sm">{item.label}</p>
                        <p className="text-lg sm:text-2xl font-bold text-white mt-1">{item.value}</p>
                        <p className={`text-xs sm:text-sm ${item.positive ? 'text-green-400' : 'text-red-400'}`}>{item.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-700/50">
                      <p className="text-white font-semibold mb-3 text-sm sm:text-base">AI Daily Briefing</p>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <p className="text-slate-300 flex items-start gap-2"><span>✨</span> Revenue up 12.5% vs last month</p>
                        <p className="text-slate-300 flex items-start gap-2"><span>📈</span> User acquisition trending positive</p>
                        <p className="text-slate-300 flex items-start gap-2"><span>⚠️</span> 3 action items need attention</p>
                        <p className="text-slate-300 flex items-start gap-2"><span>🎯</span> Q4 OKRs at 78% completion</p>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-700/50">
                      <p className="text-white font-semibold mb-3 text-sm sm:text-base">Revenue Trend</p>
                      <div className="flex items-end justify-between h-24 sm:h-32 gap-1 sm:gap-2">
                        {[40, 55, 45, 60, 75, 65, 80, 85, 78, 90, 88, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t opacity-80" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 sm:py-16 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 text-sm mb-8">TRUSTED BY LEADING COMPANIES WORLDWIDE</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-16">
            {logos.map((logo, index) => (
              <div key={index} className="text-xl sm:text-2xl font-bold text-slate-600 hover:text-slate-400 transition-colors">{logo}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Four Powerful{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Integrated Modules
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              A complete suite of tools designed specifically for executive teams and business leaders.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <div key={index} className="group bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/50 transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">{module.icon}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{module.name}</h3>
                <p className="text-slate-400 text-sm">{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Lead Smarter
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Powerful features designed to transform how you make decisions and run your business.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Get Started in{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Minutes
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Simple setup, powerful results. Here's how it works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { step: '01', title: 'Connect Your Data', description: 'Integrate with your existing tools and data sources in just a few clicks. We support 50+ integrations.' },
              { step: '02', title: 'Configure Your Dashboard', description: 'Customize your executive dashboard with the metrics, KPIs, and insights that matter most to you.' },
              { step: '03', title: 'Get AI Insights', description: 'Receive intelligent recommendations, predictions, and automated briefings to drive better decisions.' }
            ].map((item, index) => (
              <div key={index} className="relative text-center md:text-left">
                <div className="text-6xl lg:text-7xl font-bold text-slate-800 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 text-slate-700">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-28 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Loved by{' '}
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                Leaders Everywhere
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              See what executives are saying about NovaVerse.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{testimonial.author}</div>
                    <div className="text-xs text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Simple,{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Choose the plan that's right for your team. All plans include a 14-day free trial.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-slate-800/50 rounded-full p-1 border border-slate-700/50">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                  billingCycle === 'monthly' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                  billingCycle === 'annual' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual <span className="text-green-400 text-xs ml-1">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-slate-900 border rounded-2xl p-6 lg:p-8 ${
                plan.popular ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105' : 'border-slate-800'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>
                <div className="mb-6">
                  {plan.monthlyPrice ? (
                    <>
                      <span className="text-4xl lg:text-5xl font-bold">
                        ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                      </span>
                      <span className="text-slate-400">/month</span>
                      {billingCycle === 'annual' && (
                        <div className="text-xs text-slate-500 mt-1">Billed annually</div>
                      )}
                    </>
                  ) : (
                    <span className="text-3xl lg:text-4xl font-bold">Custom</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3 text-sm">
                      <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(plan.cta === 'Contact Sales' ? '/contact' : '/register')}
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-28 bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-semibold pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === index ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeFaq === index && (
                  <div className="px-5 pb-5 text-slate-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 lg:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            <div className="relative text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-6">
                Ready to Transform Your Executive Operations?
              </h2>
              <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                Join thousands of leaders who are making smarter decisions with NovaVerse.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg"
                >
                  Start Your Free Trial
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full sm:w-auto border-2 border-white/30 hover:border-white/50 hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                >
                  Talk to Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/novaverse-logo.png" alt="NovaVerse" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">NovaVerse</span>
              </div>
              <p className="text-slate-400 text-sm mb-6 max-w-sm">
                The AI-powered platform for modern executives. Make better decisions, faster.
              </p>
              <div className="flex items-center gap-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                  <a key={social} href="#" className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors text-slate-400 hover:text-white text-xs">
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Partners'] },
              { title: 'Resources', links: ['Documentation', 'Help Center', 'API Reference', 'Status', 'Security'] }
            ].map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4 text-sm">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 NovaVerse. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
