import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Enhanced Nova Pulse Dashboard - Real-time Business Intelligence
export default function PulseAIDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [askAIQuery, setAskAIQuery] = useState('');
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'ai' | 'alerts'>('overview');
  const [showVoiceBriefing, setShowVoiceBriefing] = useState(false);
  const [realTimeData, setRealTimeData] = useState({
    revenue: 2400000,
    activeUsers: 12847,
    oeeScore: 87.2,
    npsScore: 72,
    customerSatisfaction: 94.5
  });
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        revenue: prev.revenue + Math.random() * 1000 - 500,
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 20 - 10)),
        oeeScore: Math.min(100, Math.max(0, prev.oeeScore + (Math.random() * 0.4 - 0.2))),
        npsScore: Math.min(100, Math.max(0, prev.npsScore + Math.floor(Math.random() * 2 - 1))),
        customerSatisfaction: Math.min(100, Math.max(0, prev.customerSatisfaction + (Math.random() * 0.2 - 0.1)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Daily briefing data
  const dailyBriefing = {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    summary: "Revenue is up 12% week-over-week with strong performance in the enterprise segment. Customer satisfaction remains high at 94.5%. Three key action items require your attention today.",
    keyMetrics: [
      { label: 'Revenue', value: `$${(realTimeData.revenue / 1000000).toFixed(2)}M`, change: '+12.5%', trend: 'up', icon: '💰' },
      { label: 'Active Users', value: realTimeData.activeUsers.toLocaleString(), change: '+8.3%', trend: 'up', icon: '👥' },
      { label: 'OEE Score', value: `${realTimeData.oeeScore.toFixed(1)}%`, change: '+3.1%', trend: 'up', icon: '⚡' },
      { label: 'Customer Satisfaction', value: `${realTimeData.customerSatisfaction.toFixed(1)}%`, change: '-0.5%', trend: 'down', icon: '😊' },
    ],
    priorities: [
      { title: 'Review Q4 budget proposal', urgency: 'high', deadline: 'Today', progress: 75 },
      { title: 'Approve marketing campaign', urgency: 'medium', deadline: 'Tomorrow', progress: 40 },
      { title: 'Board meeting preparation', urgency: 'high', deadline: 'Dec 30', progress: 60 },
      { title: 'Team performance reviews', urgency: 'low', deadline: 'Jan 5', progress: 20 },
    ],
    opportunities: [
      { text: 'European market expansion could increase revenue by 23%', confidence: 87, impact: 'high' },
      { text: 'New product launch timing optimal for Q1', confidence: 92, impact: 'high' },
      { text: 'Partnership with TechCorp showing positive signals', confidence: 78, impact: 'medium' },
      { text: 'AI automation could reduce costs by 15%', confidence: 85, impact: 'high' },
    ],
    risks: [
      { text: '3 enterprise customers showing disengagement signals', severity: 'high', probability: 65 },
      { text: 'Supply chain delays may impact Q1 deliveries', severity: 'medium', probability: 45 },
      { text: 'Competitor launching similar product in February', severity: 'high', probability: 80 },
    ]
  };

  // Executive Alerts
  const alerts = [
    { id: 1, type: 'critical', title: 'Revenue anomaly detected', message: 'Unusual spike in enterprise sales - up 45% in last 2 hours', time: '5 min ago', read: false },
    { id: 2, type: 'warning', title: 'Customer churn risk', message: 'Acme Corp engagement dropped 60% this week', time: '1 hour ago', read: false },
    { id: 3, type: 'info', title: 'Goal milestone reached', message: 'Q4 revenue target achieved 2 weeks early', time: '3 hours ago', read: true },
    { id: 4, type: 'success', title: 'Integration complete', message: 'Salesforce sync completed successfully', time: '5 hours ago', read: true },
  ];

  // Revenue trend data for chart
  const revenueTrend = [
    { month: 'Jul', actual: 1.8, predicted: 1.75 },
    { month: 'Aug', actual: 1.9, predicted: 1.85 },
    { month: 'Sep', actual: 2.0, predicted: 1.95 },
    { month: 'Oct', actual: 2.1, predicted: 2.05 },
    { month: 'Nov', actual: 2.3, predicted: 2.2 },
    { month: 'Dec', actual: 2.4, predicted: 2.35 },
    { month: 'Jan', actual: null, predicted: 2.5 },
    { month: 'Feb', actual: null, predicted: 2.65 },
  ];

  // Data sources
  const dataSources = [
    { name: 'Salesforce', status: 'connected', lastSync: '5 min ago', icon: '☁️', health: 98 },
    { name: 'Google Analytics', status: 'connected', lastSync: '10 min ago', icon: '📊', health: 100 },
    { name: 'Stripe', status: 'connected', lastSync: '2 min ago', icon: '💳', health: 100 },
    { name: 'HubSpot', status: 'syncing', lastSync: 'In progress', icon: '🔶', health: 85 },
    { name: 'Slack', status: 'connected', lastSync: '1 min ago', icon: '💬', health: 100 },
  ];

  // AI conversation handler
  const handleAskAI = async () => {
    if (!askAIQuery.trim()) return;
    
    const userMessage = { role: 'user' as const, content: askAIQuery, timestamp: new Date() };
    setAiMessages(prev => [...prev, userMessage]);
    setAskAIQuery('');
    setIsAiTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        'revenue': `Based on current trends, your revenue is performing exceptionally well. Here's my analysis:\n\n📈 **Current Status**: $${(realTimeData.revenue / 1000000).toFixed(2)}M (+12.5% MoM)\n\n**Key Drivers:**\n• Enterprise segment up 23%\n• New customer acquisition +15%\n• Upsell revenue +8%\n\n**Forecast**: Projected to hit $2.8M by end of Q1 2025 if current trends continue.`,
        'churn': `I've analyzed your customer churn patterns:\n\n⚠️ **At-Risk Customers**: 3 enterprise accounts\n\n**Warning Signs Detected:**\n• Acme Corp: Login frequency down 60%\n• TechStart Inc: Support tickets up 200%\n• GlobalTech: Feature usage declining\n\n**Recommended Actions:**\n1. Schedule executive check-in with Acme Corp\n2. Assign dedicated CSM to TechStart\n3. Offer GlobalTech a product training session`,
        'default': `I've analyzed your query about "${askAIQuery}". Here's what I found:\n\n📊 **Analysis Summary**\nBased on your current data, I can provide insights across revenue, customer behavior, and operational metrics.\n\n**Key Findings:**\n• Overall business health is strong (87.2% OEE)\n• Customer satisfaction remains high at ${realTimeData.customerSatisfaction.toFixed(1)}%\n• ${realTimeData.activeUsers.toLocaleString()} active users currently\n\nWould you like me to dive deeper into any specific area?`
      };

      const responseKey = askAIQuery.toLowerCase().includes('revenue') ? 'revenue' : 
                         askAIQuery.toLowerCase().includes('churn') ? 'churn' : 'default';
      
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: responses[responseKey], 
        timestamp: new Date() 
      };
      setAiMessages(prev => [...prev, assistantMessage]);
      setIsAiTyping(false);
    }, 1500);
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiMessages]);

  const handleGenerateBriefing = () => {
    setIsGeneratingBriefing(true);
    setTimeout(() => setIsGeneratingBriefing(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center space-x-3">
                <span className="text-4xl animate-pulse">💫</span>
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Nova Pulse
                </span>
              </h1>
              <p className="text-slate-400">Real-time Business Intelligence • AI-Powered Insights</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Live Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm backdrop-blur-sm"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={() => setShowVoiceBriefing(!showVoiceBriefing)}
                className={`p-2.5 rounded-xl transition-all ${showVoiceBriefing ? 'bg-indigo-500 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
                title="Voice Briefing"
              >
                🔊
              </button>
              <button
                onClick={handleGenerateBriefing}
                disabled={isGeneratingBriefing}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25"
              >
                {isGeneratingBriefing ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <span>Generating...</span>
                  </span>
                ) : '✨ Generate Briefing'}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 mb-6 p-1 bg-slate-900/50 rounded-xl w-fit backdrop-blur-sm border border-slate-800">
            {[
              { id: 'overview', label: '📊 Overview', count: null },
              { id: 'metrics', label: '📈 Metrics', count: null },
              { id: 'ai', label: '🤖 AI Assistant', count: aiMessages.length > 0 ? aiMessages.length : null },
              { id: 'alerts', label: '🔔 Alerts', count: alerts.filter(a => !a.read).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id 
                    ? 'bg-indigo-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-indigo-500/50 text-indigo-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Main Content */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Real-time Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dailyBriefing.keyMetrics.map((metric, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{metric.icon}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          metric.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mb-1">{metric.label}</p>
                      <p className="text-2xl font-bold group-hover:text-indigo-400 transition-colors">
                        {metric.value}
                      </p>
                      {/* Mini sparkline placeholder */}
                      <div className="mt-2 h-8 flex items-end space-x-0.5">
                        {[40, 55, 45, 60, 50, 70, 65, 80].map((h, i) => (
                          <div 
                            key={i} 
                            className={`flex-1 rounded-t ${metric.trend === 'up' ? 'bg-green-500/30' : 'bg-red-500/30'}`}
                            style={{ height: `${h}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Daily Briefing Card */}
                <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center space-x-2">
                        <span>✨</span>
                        <span>Today's Executive Briefing</span>
                      </h2>
                      <p className="text-sm text-slate-400">{dailyBriefing.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors" title="Download PDF">
                        📥
                      </button>
                      <button className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors" title="Listen">
                        🔊
                      </button>
                      <button className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors" title="Share">
                        📤
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mb-6 p-4 bg-slate-900/30 rounded-xl border border-slate-800/50">
                    <p className="text-slate-300 leading-relaxed">{dailyBriefing.summary}</p>
                  </div>

                  {/* Revenue Trend Chart */}
                  <div className="mb-6 p-4 bg-slate-900/30 rounded-xl border border-slate-800/50">
                    <h3 className="font-semibold mb-4 flex items-center space-x-2">
                      <span>📈</span>
                      <span>Revenue Trend & Forecast</span>
                    </h3>
                    <div className="h-48 flex items-end justify-between space-x-2">
                      {revenueTrend.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex flex-col items-center space-y-1 mb-2">
                            {/* Predicted bar */}
                            <div 
                              className={`w-full rounded-t transition-all ${data.actual ? 'bg-indigo-500/30' : 'bg-cyan-500/30 border border-dashed border-cyan-500/50'}`}
                              style={{ height: `${data.predicted * 60}px` }}
                            ></div>
                            {/* Actual bar overlay */}
                            {data.actual && (
                              <div 
                                className="w-full bg-indigo-500 rounded-t -mt-1 transition-all hover:bg-indigo-400"
                                style={{ height: `${data.actual * 60}px`, marginTop: `-${data.predicted * 60}px` }}
                              ></div>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{data.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                        <span className="text-slate-400">Actual</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-cyan-500/30 border border-dashed border-cyan-500/50 rounded"></div>
                        <span className="text-slate-400">Forecast</span>
                      </div>
                    </div>
                  </div>

                  {/* Priorities, Opportunities, Risks */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Priorities */}
                    <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-800/50">
                      <h3 className="font-semibold mb-3 flex items-center space-x-2">
                        <span>🎯</span>
                        <span>Priorities</span>
                      </h3>
                      <div className="space-y-3">
                        {dailyBriefing.priorities.map((item, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="truncate flex-1">{item.title}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ml-2 ${
                                item.urgency === 'high' ? 'bg-red-500/20 text-red-400' : 
                                item.urgency === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {item.deadline}
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  item.urgency === 'high' ? 'bg-red-500' : 
                                  item.urgency === 'medium' ? 'bg-amber-500' : 'bg-slate-500'
                                }`}
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Opportunities */}
                    <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-800/50">
                      <h3 className="font-semibold mb-3 flex items-center space-x-2">
                        <span>💡</span>
                        <span>Opportunities</span>
                      </h3>
                      <div className="space-y-3">
                        {dailyBriefing.opportunities.map((item, index) => (
                          <div key={index} className="p-2 bg-green-500/5 border border-green-500/20 rounded-lg">
                            <p className="text-sm text-slate-300 mb-1">{item.text}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-400">{item.confidence}% confidence</span>
                              <span className={`px-1.5 py-0.5 rounded ${
                                item.impact === 'high' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {item.impact} impact
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-800/50">
                      <h3 className="font-semibold mb-3 flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>Risks</span>
                      </h3>
                      <div className="space-y-3">
                        {dailyBriefing.risks.map((item, index) => (
                          <div key={index} className="p-2 bg-red-500/5 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-slate-300 mb-1">{item.text}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className={`${
                                item.severity === 'high' ? 'text-red-400' : 'text-amber-400'
                              }`}>
                                {item.severity} severity
                              </span>
                              <span className="text-slate-400">{item.probability}% probability</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Data Sources Health */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Data Sources</h3>
                    <Link to="/app/pulse/data-sources" className="text-indigo-400 text-sm hover:text-indigo-300">
                      Manage →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {dataSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{source.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{source.name}</p>
                            <p className="text-xs text-slate-500">{source.lastSync}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${source.health >= 95 ? 'bg-green-500' : source.health >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${source.health}%` }}
                            ></div>
                          </div>
                          <span className={`w-2 h-2 rounded-full ${
                            source.status === 'connected' ? 'bg-green-500' : 
                            source.status === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                          }`}></span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2.5 border border-dashed border-slate-700 rounded-xl text-sm text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-all hover:bg-indigo-500/5">
                    + Add Data Source
                  </button>
                </div>

                {/* Quick AI Insights */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-5">
                  <h3 className="font-semibold mb-4 flex items-center space-x-2">
                    <span>🤖</span>
                    <span>Quick AI Insights</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { query: 'Why is revenue up?', icon: '📈' },
                      { query: 'Who are at-risk customers?', icon: '⚠️' },
                      { query: 'What should I focus on today?', icon: '🎯' },
                      { query: 'Summarize this week', icon: '📋' },
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setAskAIQuery(item.query);
                          setActiveTab('ai');
                        }}
                        className="w-full flex items-center space-x-3 p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl text-left transition-colors group"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm text-slate-300 group-hover:text-white">{item.query}</span>
                        <span className="ml-auto text-slate-600 group-hover:text-indigo-400">→</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-5">
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: '📊', label: 'Generate Report', color: 'indigo' },
                      { icon: '📧', label: 'Email Briefing', color: 'cyan' },
                      { icon: '📅', label: 'Schedule', color: 'purple' },
                      { icon: '🔔', label: 'Set Alert', color: 'amber' },
                    ].map((action, index) => (
                      <button 
                        key={index}
                        className={`p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-${action.color}-500/10`}
                      >
                        <span className="text-xl block mb-1">{action.icon}</span>
                        <span className="text-xs text-slate-400">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Assistant Tab */}
          {activeTab === 'ai' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold flex items-center space-x-2">
                      <span>🤖</span>
                      <span>Nova AI Assistant</span>
                    </h2>
                    <p className="text-sm text-slate-400">Ask anything about your business data</p>
                  </div>

                  {/* Chat Messages */}
                  <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {aiMessages.length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🤖</div>
                        <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
                        <p className="text-slate-400 text-sm mb-6">Ask me anything about your business metrics, trends, or insights</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {['What are our top customers?', 'Show revenue trends', 'Analyze churn risk', 'Compare Q3 vs Q4'].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => setAskAIQuery(suggestion)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {aiMessages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.role === 'user' 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-slate-800 text-slate-200'
                        }`}>
                          <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                          <p className="text-xs mt-2 opacity-60">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800 p-4 rounded-2xl">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={askAIQuery}
                        onChange={(e) => setAskAIQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                        placeholder="Ask anything about your business..."
                        className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <button
                        onClick={handleAskAI}
                        disabled={!askAIQuery.trim() || isAiTyping}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-5">
                  <h3 className="font-semibold mb-4">Suggested Questions</h3>
                  <div className="space-y-2">
                    {[
                      'What drove revenue growth this month?',
                      'Which customers are at risk of churning?',
                      'What are the top opportunities?',
                      'Compare performance vs last quarter',
                      'What should I prioritize today?',
                      'Show me anomalies in the data',
                    ].map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setAskAIQuery(question)}
                        className="w-full text-left p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-5">
                  <h3 className="font-semibold mb-4">AI Capabilities</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { icon: '📊', label: 'Data Analysis', desc: 'Analyze trends and patterns' },
                      { icon: '🔮', label: 'Predictions', desc: 'Forecast future metrics' },
                      { icon: '⚠️', label: 'Anomaly Detection', desc: 'Spot unusual patterns' },
                      { icon: '💡', label: 'Recommendations', desc: 'Get actionable insights' },
                    ].map((cap, index) => (
                      <div key={index} className="flex items-start space-x-3 p-2">
                        <span className="text-lg">{cap.icon}</span>
                        <div>
                          <p className="font-medium">{cap.label}</p>
                          <p className="text-slate-500 text-xs">{cap.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="max-w-4xl">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Executive Alerts</h2>
                  <button className="text-sm text-indigo-400 hover:text-indigo-300">Mark all as read</button>
                </div>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                        alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                        alert.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                        'bg-slate-800/50 border-slate-700'
                      } ${!alert.read ? 'ring-2 ring-indigo-500/30' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">
                            {alert.type === 'critical' ? '🚨' : 
                             alert.type === 'warning' ? '⚠️' : 
                             alert.type === 'success' ? '✅' : 'ℹ️'}
                          </span>
                          <div>
                            <h3 className="font-semibold">{alert.title}</h3>
                            <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500">{alert.time}</span>
                          {!alert.read && <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Metrics */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <span>💰</span>
                  <span>Revenue Metrics</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">Monthly Recurring Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(realTimeData.revenue)}</p>
                    </div>
                    <span className="text-green-400 text-sm">+12.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">Annual Run Rate</p>
                      <p className="text-2xl font-bold">{formatCurrency(realTimeData.revenue * 12)}</p>
                    </div>
                    <span className="text-green-400 text-sm">+15.2%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">Average Revenue Per User</p>
                      <p className="text-2xl font-bold">{formatCurrency(realTimeData.revenue / realTimeData.activeUsers)}</p>
                    </div>
                    <span className="text-green-400 text-sm">+3.8%</span>
                  </div>
                </div>
              </div>

              {/* Customer Metrics */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <span>👥</span>
                  <span>Customer Metrics</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">Active Users</p>
                      <p className="text-2xl font-bold">{realTimeData.activeUsers.toLocaleString()}</p>
                    </div>
                    <span className="text-green-400 text-sm">+8.3%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">NPS Score</p>
                      <p className="text-2xl font-bold">{realTimeData.npsScore}</p>
                    </div>
                    <span className="text-green-400 text-sm">+5</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">Customer Satisfaction</p>
                      <p className="text-2xl font-bold">{realTimeData.customerSatisfaction.toFixed(1)}%</p>
                    </div>
                    <span className="text-red-400 text-sm">-0.5%</span>
                  </div>
                </div>
              </div>

              {/* Operational Metrics */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <span>⚡</span>
                  <span>Operational Metrics</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">OEE Score</p>
                      <p className="text-2xl font-bold">{realTimeData.oeeScore.toFixed(1)}%</p>
                    </div>
                    <span className="text-green-400 text-sm">+3.1%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">System Uptime</p>
                      <p className="text-2xl font-bold">99.97%</p>
                    </div>
                    <span className="text-green-400 text-sm">+0.02%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">Response Time</p>
                      <p className="text-2xl font-bold">142ms</p>
                    </div>
                    <span className="text-green-400 text-sm">-12ms</span>
                  </div>
                </div>
              </div>

              {/* Growth Metrics */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <span>📈</span>
                  <span>Growth Metrics</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">New Customers (MTD)</p>
                      <p className="text-2xl font-bold">247</p>
                    </div>
                    <span className="text-green-400 text-sm">+18%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">Churn Rate</p>
                      <p className="text-2xl font-bold">2.1%</p>
                    </div>
                    <span className="text-green-400 text-sm">-0.3%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-slate-400 text-sm">Net Revenue Retention</p>
                      <p className="text-2xl font-bold">118%</p>
                    </div>
                    <span className="text-green-400 text-sm">+4%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
