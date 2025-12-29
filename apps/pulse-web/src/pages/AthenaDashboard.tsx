import { useState } from 'react';
import { Link } from 'react-router-dom';

// Enhanced Athena Strategic Intelligence Dashboard
export default function AthenaDashboard() {
  const [_activeTab, _setActiveTab] = useState('overview');

  // Strategic metrics
  const strategicMetrics = [
    { label: 'Market Share', value: '23.4%', change: '+2.1%', trend: 'up', icon: '📊' },
    { label: 'Competitive Position', value: '#2', change: '↑1', trend: 'up', icon: '🏆' },
    { label: 'Strategic Initiatives', value: '12', change: '3 active', trend: 'neutral', icon: '🎯' },
    { label: 'Risk Score', value: 'Low', change: 'Improved', trend: 'up', icon: '🛡️' },
  ];

  // Active scenarios
  const scenarios = [
    {
      id: 1,
      name: 'European Market Expansion',
      status: 'analyzing',
      probability: 78,
      impact: 'high',
      roi: '+23%',
      timeline: 'Q2 2025'
    },
    {
      id: 2,
      name: 'Product Line Extension',
      status: 'recommended',
      probability: 85,
      impact: 'medium',
      roi: '+15%',
      timeline: 'Q1 2025'
    },
    {
      id: 3,
      name: 'Acquisition Target: TechCorp',
      status: 'evaluating',
      probability: 62,
      impact: 'high',
      roi: '+45%',
      timeline: 'Q3 2025'
    },
  ];

  // Competitor intelligence
  const competitors = [
    {
      name: 'CompetitorA',
      marketShare: '28.5%',
      trend: 'stable',
      recentActivity: 'Launched new product line',
      threatLevel: 'high'
    },
    {
      name: 'CompetitorB',
      marketShare: '18.2%',
      trend: 'growing',
      recentActivity: 'Expanding to Asia',
      threatLevel: 'medium'
    },
    {
      name: 'CompetitorC',
      marketShare: '12.8%',
      trend: 'declining',
      recentActivity: 'Leadership changes',
      threatLevel: 'low'
    },
  ];

  // Market intelligence
  const marketIntel = [
    { type: 'trend', title: 'AI adoption accelerating in enterprise', impact: 'positive', confidence: 92 },
    { type: 'news', title: 'New regulations expected in Q2', impact: 'neutral', confidence: 78 },
    { type: 'opportunity', title: 'Emerging market in Southeast Asia', impact: 'positive', confidence: 85 },
    { type: 'risk', title: 'Supply chain disruptions possible', impact: 'negative', confidence: 65 },
  ];

  // Strategic recommendations
  const recommendations = [
    {
      title: 'Accelerate European Expansion',
      description: 'Market conditions are favorable. Recommend increasing investment by 20%.',
      priority: 'high',
      confidence: 87
    },
    {
      title: 'Defensive Move Against CompetitorA',
      description: 'Consider price adjustment in enterprise segment to protect market share.',
      priority: 'medium',
      confidence: 74
    },
    {
      title: 'Strategic Partnership Opportunity',
      description: 'TechPartner Inc. shows strong alignment. Initiate discussions.',
      priority: 'medium',
      confidence: 81
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommended': return 'bg-green-500/20 text-green-400';
      case 'analyzing': return 'bg-blue-500/20 text-blue-400';
      case 'evaluating': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center space-x-3">
              <span className="text-4xl">🦉</span>
              <span>Athena</span>
            </h1>
            <p className="text-slate-400">AI-powered strategic intelligence and scenario planning</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors">
              Export Analysis
            </button>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors">
              New Scenario
            </button>
          </div>
        </div>

        {/* Strategic Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {strategicMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{metric.icon}</span>
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-400' : 
                  metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Scenarios */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Active Scenarios</span>
                </h2>
                <Link to="/app/athena/scenarios" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{scenario.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(scenario.status)}`}>
                        {scenario.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Probability</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${scenario.probability}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{scenario.probability}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Impact</p>
                        <p className={`font-medium capitalize ${
                          scenario.impact === 'high' ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {scenario.impact}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Projected ROI</p>
                        <p className="font-medium text-green-400">{scenario.roi}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Timeline</p>
                        <p className="font-medium">{scenario.timeline}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Intelligence */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>🏢</span>
                  <span>Competitor Intelligence</span>
                </h2>
                <Link to="/app/athena/competitors" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-500">
                      <th className="pb-3">Competitor</th>
                      <th className="pb-3">Market Share</th>
                      <th className="pb-3">Trend</th>
                      <th className="pb-3">Recent Activity</th>
                      <th className="pb-3">Threat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {competitors.map((competitor, index) => (
                      <tr key={index} className="hover:bg-slate-800/30">
                        <td className="py-3 font-medium">{competitor.name}</td>
                        <td className="py-3">{competitor.marketShare}</td>
                        <td className="py-3">
                          <span className={`capitalize ${
                            competitor.trend === 'growing' ? 'text-green-400' :
                            competitor.trend === 'declining' ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {competitor.trend}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-slate-400">{competitor.recentActivity}</td>
                        <td className="py-3">
                          <span className={`font-medium capitalize ${getThreatColor(competitor.threatLevel)}`}>
                            {competitor.threatLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market Intelligence */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>🌍</span>
                  <span>Market Intelligence</span>
                </h2>
                <Link to="/app/athena/market" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {marketIntel.map((intel, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">
                        {intel.type === 'trend' ? '📈' :
                         intel.type === 'news' ? '📰' :
                         intel.type === 'opportunity' ? '💡' : '⚠️'}
                      </span>
                      <div>
                        <p className="font-medium">{intel.title}</p>
                        <p className="text-xs text-slate-500">Confidence: {intel.confidence}%</p>
                      </div>
                    </div>
                    <span className={`font-medium text-sm ${getImpactColor(intel.impact)}`}>
                      {intel.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <span>🤖</span>
                <span>AI Recommendations</span>
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Confidence: {rec.confidence}%</span>
                      <button className="text-xs text-indigo-400 hover:text-indigo-300">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>🎯</span>
                  <span className="text-sm">Create Scenario</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>🏢</span>
                  <span className="text-sm">Add Competitor</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>📊</span>
                  <span className="text-sm">Run Analysis</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>📥</span>
                  <span className="text-sm">Export Report</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm">Scenario analysis completed</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm">New market data available</p>
                    <p className="text-xs text-slate-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 mt-2 bg-amber-500 rounded-full"></div>
                  <div>
                    <p className="text-sm">Competitor alert: CompetitorA</p>
                    <p className="text-xs text-slate-500">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
