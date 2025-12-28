import { useState } from 'react';
import { Link } from 'react-router-dom';

// Enhanced Pulse AI Dashboard
export default function PulseAIDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [askAIQuery, setAskAIQuery] = useState('');
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);

  // Daily briefing data
  const dailyBriefing = {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    summary: "Revenue is up 12% week-over-week with strong performance in the enterprise segment. Customer satisfaction remains high at 94.5%. Three key action items require your attention today.",
    keyMetrics: [
      { label: 'Revenue', value: '$2.4M', change: '+12%', trend: 'up' },
      { label: 'New Customers', value: '47', change: '+8%', trend: 'up' },
      { label: 'Churn Rate', value: '2.1%', change: '-0.3%', trend: 'down' },
      { label: 'NPS Score', value: '72', change: '+5', trend: 'up' },
    ],
    priorities: [
      { title: 'Review Q4 budget proposal', urgency: 'high', deadline: 'Today' },
      { title: 'Approve marketing campaign', urgency: 'medium', deadline: 'Tomorrow' },
      { title: 'Board meeting preparation', urgency: 'high', deadline: 'Dec 30' },
    ],
    opportunities: [
      'European market expansion could increase revenue by 23%',
      'New product launch timing optimal for Q1',
      'Partnership with TechCorp showing positive signals',
    ],
    risks: [
      '3 enterprise customers showing disengagement signals',
      'Supply chain delays may impact Q1 deliveries',
      'Competitor launching similar product in February',
    ]
  };

  // Recent briefings
  const recentBriefings = [
    { id: 1, date: 'Dec 27, 2024', title: 'Daily Executive Briefing', status: 'read' },
    { id: 2, date: 'Dec 26, 2024', title: 'Daily Executive Briefing', status: 'read' },
    { id: 3, date: 'Dec 25, 2024', title: 'Weekly Summary', status: 'unread' },
    { id: 4, date: 'Dec 24, 2024', title: 'Daily Executive Briefing', status: 'read' },
  ];

  // Data sources
  const dataSources = [
    { name: 'Salesforce', status: 'connected', lastSync: '5 min ago', icon: '☁️' },
    { name: 'Google Analytics', status: 'connected', lastSync: '10 min ago', icon: '📊' },
    { name: 'Stripe', status: 'connected', lastSync: '2 min ago', icon: '💳' },
    { name: 'HubSpot', status: 'pending', lastSync: 'Never', icon: '🔶' },
  ];

  // AI conversation history
  const aiConversations = [
    { question: 'What are our top performing products?', time: '2 hours ago' },
    { question: 'Show me customer churn trends', time: 'Yesterday' },
    { question: 'Compare Q3 vs Q4 revenue', time: '2 days ago' },
  ];

  const handleGenerateBriefing = () => {
    setIsGeneratingBriefing(true);
    setTimeout(() => setIsGeneratingBriefing(false), 2000);
  };

  const handleAskAI = () => {
    if (askAIQuery.trim()) {
      console.log('Asking AI:', askAIQuery);
      setAskAIQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center space-x-3">
              <span className="text-4xl">⚡</span>
              <span>Pulse AI</span>
            </h1>
            <p className="text-slate-400">Your AI-powered executive intelligence assistant</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <button
              onClick={handleGenerateBriefing}
              disabled={isGeneratingBriefing}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isGeneratingBriefing ? 'Generating...' : 'Generate Briefing'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Briefing Card */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Today's Executive Briefing</h2>
                  <p className="text-sm text-slate-400">{dailyBriefing.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800">📥</button>
                  <button className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800">🔊</button>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <p className="text-slate-300 leading-relaxed">{dailyBriefing.summary}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {dailyBriefing.keyMetrics.map((metric, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs mb-1">{metric.label}</p>
                    <p className="text-xl font-bold">{metric.value}</p>
                    <p className={`text-xs ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* Priorities, Opportunities, Risks */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Priorities */}
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <span>🎯</span>
                    <span>Priorities</span>
                  </h3>
                  <div className="space-y-2">
                    {dailyBriefing.priorities.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate">{item.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          item.urgency === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {item.deadline}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opportunities */}
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <span>💡</span>
                    <span>Opportunities</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dailyBriefing.opportunities.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>Risks</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dailyBriefing.risks.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Ask AI Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <span>🤖</span>
                <span>Ask AI</span>
              </h2>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="text"
                  value={askAIQuery}
                  onChange={(e) => setAskAIQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                  placeholder="Ask anything about your business..."
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAskAI}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium transition-colors"
                >
                  Ask
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Revenue trends', 'Top customers', 'Churn analysis', 'Market insights'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setAskAIQuery(suggestion)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-400"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Recent Conversations */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Questions</h3>
                <div className="space-y-2">
                  {aiConversations.map((conv, index) => (
                    <button
                      key={index}
                      onClick={() => setAskAIQuery(conv.question)}
                      className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-left"
                    >
                      <span className="text-sm">{conv.question}</span>
                      <span className="text-xs text-slate-500">{conv.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Data Sources */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Data Sources</h3>
                <Link to="/app/pulse/data-sources" className="text-indigo-400 text-sm hover:text-indigo-300">
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {dataSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{source.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{source.name}</p>
                        <p className="text-xs text-slate-500">Synced {source.lastSync}</p>
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${
                      source.status === 'connected' ? 'bg-green-500' : 'bg-amber-500'
                    }`}></span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 border border-dashed border-slate-700 rounded-xl text-sm text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors">
                + Add Data Source
              </button>
            </div>

            {/* Recent Briefings */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Briefings</h3>
                <Link to="/app/pulse/briefings" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {recentBriefings.map((briefing) => (
                  <div
                    key={briefing.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-sm">{briefing.title}</p>
                      <p className="text-xs text-slate-500">{briefing.date}</p>
                    </div>
                    {briefing.status === 'unread' && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-center transition-colors">
                  <span className="text-xl block mb-1">📊</span>
                  <span className="text-xs">Generate Report</span>
                </button>
                <button className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-center transition-colors">
                  <span className="text-xl block mb-1">📧</span>
                  <span className="text-xs">Email Briefing</span>
                </button>
                <button className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-center transition-colors">
                  <span className="text-xl block mb-1">📅</span>
                  <span className="text-xs">Schedule</span>
                </button>
                <button className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-center transition-colors">
                  <span className="text-xl block mb-1">⚙️</span>
                  <span className="text-xs">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
