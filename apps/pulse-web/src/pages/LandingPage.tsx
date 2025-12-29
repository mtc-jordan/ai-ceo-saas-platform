import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// NovaVerse Landing Page - Cosmic Theme 2025
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
      icon: '🌟',
      title: 'Stellar Insights',
      description: 'Navigate your business universe with AI-powered recommendations and predictive analytics that illuminate the path forward.',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: '🚀',
      title: 'Command Center',
      description: 'Your mission control for business metrics - real-time KPIs, financial data, and health indicators in one cosmic dashboard.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: '🎯',
      title: 'Orbit Tracking',
      description: 'Keep your goals in perfect orbit with automated OKR tracking and alignment visualization across your organization.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: '🔮',
      title: 'Future Vision',
      description: 'See beyond the horizon with revenue forecasting, churn prediction, and anomaly detection before challenges arise.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: '🤖',
      title: 'AI Companion',
      description: 'Your intelligent co-pilot for meetings - automatic transcription, smart summaries, and action item extraction.',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: '🛡️',
      title: 'Governance Shield',
      description: 'Protect your enterprise with streamlined board meetings, compliance tracking, and ESG reporting automation.',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: '⚙️',
      title: 'Process Forge',
      description: 'Forge operational excellence with DMAIC projects, waste tracking, OEE monitoring, and continuous improvement.',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      icon: '⚡',
      title: 'Automation Engine',
      description: 'Power your workflows with intelligent automation - rules, triggers, and scheduled tasks that work while you sleep.',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  const testimonials = [
    {
      quote: "NovaVerse opened up a whole new dimension of business intelligence for us. It's like having a crystal ball for executive decisions.",
      author: "Sarah Chen",
      role: "CEO, Stellar Dynamics",
      avatar: "SC",
      rating: 5
    },
    {
      quote: "The predictive analytics are like having a time machine. We caught a major churn risk weeks before it would have hit us.",
      author: "Michael Roberts",
      role: "COO, Quantum Solutions",
      avatar: "MR",
      rating: 5
    },
    {
      quote: "Finally, a platform that thinks at the speed of business. Nova Shield transformed our governance from burden to breeze.",
      author: "Jennifer Walsh",
      role: "CFO, Nebula Corp",
      avatar: "JW",
      rating: 5
    },
    {
      quote: "Nova Pulse saves our team 15+ hours weekly. The AI briefings are so accurate, it's like having a genius assistant.",
      author: "David Kim",
      role: "VP Operations, Cosmos Tech",
      avatar: "DK",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Explorer',
      description: 'Perfect for startups beginning their journey',
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        'Up to 10 users',
        'Nova Pulse Dashboard',
        'Basic Analytics',
        'OKR Tracking',
        'Email Support',
        '5GB Storage'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Voyager',
      description: 'For growing companies exploring new frontiers',
      monthlyPrice: 299,
      annualPrice: 249,
      features: [
        'Up to 50 users',
        'Everything in Explorer',
        'AI Meeting Companion',
        'Future Vision Analytics',
        'Nova Shield Governance',
        'Nova Forge Operations',
        'Priority Support',
        '50GB Storage',
        'Custom Integrations'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For organizations conquering the universe',
      monthlyPrice: null,
      annualPrice: null,
      features: [
        'Unlimited users',
        'Everything in Voyager',
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
      answer: 'Start with a 14-day free trial with full access to all NovaVerse modules. No credit card required. At the end of your trial, choose the plan that fits your mission.'
    },
    {
      question: 'Can I change plans later?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate your billing accordingly.'
    },
    {
      question: 'What integrations do you support?',
      answer: 'NovaVerse integrates with 50+ popular tools including Slack, Microsoft Teams, Salesforce, HubSpot, Google Workspace, Zoom, and many more. Enterprise plans include custom integration support.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Security is at the core of NovaVerse. We use bank-level encryption, are SOC 2 Type II certified, and comply with GDPR. Your data is protected like a fortress in space.'
    },
    {
      question: 'Do you offer training and onboarding?',
      answer: 'Yes! All plans include access to our knowledge base and video tutorials. Voyager and Enterprise plans include personalized onboarding sessions with our customer success team.'
    },
    {
      question: 'What AI models power NovaVerse?',
      answer: 'We use a combination of proprietary models and leading AI providers including OpenAI and advanced language models. Our AI is continuously trained on business intelligence data to provide the most relevant insights.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Companies Exploring' },
    { value: '50M+', label: 'Decisions Powered' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '4.9/5', label: 'Stellar Rating' }
  ];

  const logos = ['Microsoft', 'Google', 'Amazon', 'Salesforce', 'HubSpot', 'Slack'];

  const modules = [
    { name: 'Nova Pulse', desc: 'Real-time Business Heartbeat', icon: '💫', color: 'from-cyan-400 to-blue-500' },
    { name: 'Nova Mind', desc: 'Strategic Intelligence Engine', icon: '🧠', color: 'from-purple-400 to-pink-500' },
    { name: 'Nova Shield', desc: 'Governance & Compliance', icon: '🛡️', color: 'from-green-400 to-emerald-500' },
    { name: 'Nova Forge', desc: 'Process Optimization', icon: '⚙️', color: 'from-orange-400 to-red-500' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Animated Star Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

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
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
                >
                  Enter NovaVerse
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
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
                  >
                    Start Exploring
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
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/4 left-1/2 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-ping"></span>
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 absolute"></span>
              Step Into the NovaVerse
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Where{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                AI Meets Executive
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Excellence
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Navigate your business universe with AI-powered clarity. Explore new dimensions of intelligence, automate your orbit, and discover insights beyond the horizon.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5 group"
              >
                <span className="flex items-center justify-center gap-2">
                  Begin Your Journey
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all group">
                <svg className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Demo
              </button>
            </div>

            <p className="text-slate-500 text-sm mb-16">✨ No credit card required • Cancel anytime • Full universe access</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 pt-8 border-t border-slate-800/50">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
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
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-2xl border border-cyan-500/20 p-1.5 sm:p-2 shadow-2xl shadow-purple-500/10">
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 text-center text-sm text-slate-500">NovaVerse Command Center</div>
                </div>
                <div className="p-4 sm:p-6">
                  {/* Dashboard mockup */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    {[
                      { label: 'Revenue', value: '$2.4M', change: '+12.5%', color: 'text-green-400' },
                      { label: 'Active Users', value: '8,432', change: '+8.2%', color: 'text-green-400' },
                      { label: 'OEE Score', value: '87%', change: '+3.1%', color: 'text-green-400' },
                      { label: 'NPS Score', value: '72', change: '+5', color: 'text-green-400' }
                    ].map((metric, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-700/50">
                        <div className="text-slate-400 text-xs mb-1">{metric.label}</div>
                        <div className="text-lg sm:text-xl font-bold">{metric.value}</div>
                        <div className={`text-xs ${metric.color}`}>{metric.change}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-sm font-medium mb-3 flex items-center gap-2">
                        <span className="text-cyan-400">✨</span> AI Daily Briefing
                      </div>
                      <div className="space-y-2 text-xs text-slate-400">
                        <div className="flex items-center gap-2"><span className="text-cyan-400">💡</span> Revenue up 12.5% vs last month</div>
                        <div className="flex items-center gap-2"><span className="text-purple-400">📈</span> User acquisition trending positive</div>
                        <div className="flex items-center gap-2"><span className="text-yellow-400">⚠️</span> 3 action items need attention</div>
                        <div className="flex items-center gap-2"><span className="text-pink-400">🎯</span> Q4 OKRs at 78% completion</div>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-sm font-medium mb-3">Revenue Trend</div>
                      <div className="flex items-end gap-1 h-16">
                        {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t opacity-80" style={{ height: `${h}%` }}></div>
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

      {/* Logos Section */}
      <section className="py-12 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 text-sm mb-8">TRUSTED BY LEADING COMPANIES ACROSS THE UNIVERSE</p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-50">
            {logos.map((logo, index) => (
              <div key={index} className="text-slate-400 font-semibold text-lg hover:text-white transition-colors">{logo}</div>
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
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Nova Modules
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              A complete constellation of tools designed to illuminate every corner of your business universe.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <div key={index} className="group relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all hover:-translate-y-2 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                <div className="relative">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{module.icon}</div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-purple-400 transition-all">{module.name}</h3>
                  <p className="text-slate-400 text-sm">{module.desc}</p>
                </div>
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
              Explore New Dimensions of{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Business Intelligence
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Powerful features designed to help you navigate the cosmos of modern business leadership.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all hover:-translate-y-1">
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
              Launch in{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Three Steps
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Your journey to the NovaVerse begins with a simple countdown.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { step: '01', title: 'Connect Your Systems', description: 'Link your existing tools and data sources in just a few clicks. We support 50+ integrations across the business galaxy.' },
              { step: '02', title: 'Configure Your Universe', description: 'Customize your command center with the metrics, KPIs, and insights that matter most to your mission.' },
              { step: '03', title: 'Explore & Discover', description: 'Receive AI-powered insights, predictions, and automated briefings that illuminate the path forward.' }
            ].map((item, index) => (
              <div key={index} className="relative text-center md:text-left group">
                <div className="text-6xl lg:text-7xl font-bold bg-gradient-to-b from-slate-700 to-slate-800 bg-clip-text text-transparent mb-4 group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 text-cyan-500/50">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Leaders Everywhere
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              See what explorers are saying about their NovaVerse journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 lg:p-8 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-slate-400 text-sm">{testimonial.role}</div>
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
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Simple,{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Choose the plan that fits your mission. All plans include a 14-day free trial.
            </p>
            
            <div className="inline-flex items-center bg-slate-800/50 rounded-xl p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'monthly' ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'annual' ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual <span className="text-cyan-400 ml-1">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 border rounded-2xl p-8 ${
                plan.popular ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'border-slate-700/50'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
                <div className="mb-6">
                  {plan.monthlyPrice ? (
                    <>
                      <span className="text-4xl font-bold">${billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice}</span>
                      <span className="text-slate-400">/month</span>
                      {billingCycle === 'annual' && <div className="text-cyan-400 text-sm mt-1">Billed annually</div>}
                    </>
                  ) : (
                    <span className="text-4xl font-bold">Custom</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-cyan-400">✓</span>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(plan.cta === 'Contact Sales' ? '/contact' : '/register')}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white'
                      : 'border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50'
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
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  <svg className={`w-5 h-5 text-cyan-400 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 text-slate-400">
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
          <div className="relative bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-3xl p-8 sm:p-12 lg:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            {/* Floating particles */}
            <div className="absolute top-10 left-10 w-3 h-3 bg-white/30 rounded-full animate-bounce"></div>
            <div className="absolute top-20 right-20 w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
            <div className="relative text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-6">
                Ready to Explore the NovaVerse?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of leaders who are navigating their business universe with AI-powered clarity.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto bg-white text-purple-600 hover:bg-slate-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Begin Your Journey
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full sm:w-auto border-2 border-white/30 hover:border-white/50 hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                >
                  Talk to Mission Control
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
                Navigate your business universe with AI-powered clarity. Where executive excellence meets infinite possibilities.
              </p>
              <div className="flex items-center gap-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                  <a key={social} href="#" className="w-9 h-9 bg-slate-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-white text-xs">
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
                      <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 NovaVerse. All rights reserved. 🚀
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS for star animation */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .stars, .stars2, .stars3 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .stars {
          background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="1" fill="white" opacity="0.3"/></svg>') repeat;
          background-size: 50px 50px;
          animation: animStar 50s linear infinite;
        }
        .stars2 {
          background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="0.5" fill="white" opacity="0.2"/></svg>') repeat;
          background-size: 100px 100px;
          animation: animStar 100s linear infinite;
        }
        .stars3 {
          background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="1.5" fill="white" opacity="0.1"/></svg>') repeat;
          background-size: 150px 150px;
          animation: animStar 150s linear infinite;
        }
        @keyframes animStar {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
}
