import { useState } from 'react';
import { Link } from 'react-router-dom';

// Enhanced Executive Dashboard with Modern Design
export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  // Executive metrics
  const metrics = [
    {
      label: 'Revenue',
      value: '$2.4M',
      change: '+12.5%',
      trend: 'up',
      sparkline: [65, 72, 68, 75, 82, 78, 85],
      icon: '💰'
    },
    {
      label: 'Active Users',
      value: '12,847',
      change: '+8.3%',
      trend: 'up',
      sparkline: [45, 52, 48, 55, 60, 58, 65],
      icon: '👥'
    },
    {
      label: 'OEE Score',
      value: '87.2%',
      change: '+3.1%',
      trend: 'up',
      sparkline: [78, 80, 82, 81, 84, 85, 87],
      icon: '⚙️'
    },
    {
      label: 'Customer Satisfaction',
      value: '94.5%',
      change: '-0.5%',
      trend: 'down',
      sparkline: [95, 94, 95, 94, 95, 94, 94],
      icon: '😊'
    }
  ];

  // AI Insights
  const aiInsights = [
    {
      type: 'opportunity',
      title: 'Revenue Growth Opportunity',
      description: 'Based on current trends, expanding to European markets could increase revenue by 23%.',
      confidence: 87,
      action: 'View Analysis'
    },
    {
      type: 'warning',
      title: 'Churn Risk Detected',
      description: '3 enterprise customers showing signs of disengagement. Immediate action recommended.',
      confidence: 92,
      action: 'View Customers'
    },
    {
      type: 'insight',
      title: 'Operational Efficiency',
      description: 'Production line 3 is underperforming. Implementing suggested changes could save $45K/month.',
      confidence: 78,
      action: 'View Details'
    }
  ];

  // Upcoming meetings
  const upcomingMeetings = [
    { title: 'Board Meeting', time: '10:00 AM', duration: '2h', attendees: 8, type: 'board' },
    { title: 'Q4 Strategy Review', time: '2:00 PM', duration: '1h', attendees: 5, type: 'strategy' },
    { title: 'Product Demo', time: '4:30 PM', duration: '30m', attendees: 12, type: 'demo' },
  ];

  // Action items
  const actionItems = [
    { title: 'Review Q4 budget proposal', priority: 'high', due: 'Today', status: 'pending' },
    { title: 'Approve marketing campaign', priority: 'medium', due: 'Tomorrow', status: 'pending' },
    { title: 'Sign partnership agreement', priority: 'high', due: 'Dec 30', status: 'in_progress' },
    { title: 'Review hiring plan', priority: 'low', due: 'Jan 2', status: 'pending' },
  ];

  // OKR Progress
  const okrProgress = [
    { objective: 'Increase Revenue by 25%', progress: 78, keyResults: 4 },
    { objective: 'Launch 3 New Products', progress: 67, keyResults: 3 },
    { objective: 'Improve NPS to 70+', progress: 92, keyResults: 5 },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '💡';
      case 'warning': return '⚠️';
      case 'insight': return '📊';
      default: return '💡';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'warning': return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
      case 'insight': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      default: return 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Good morning, John 👋</h1>
            <p className="text-slate-400">Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors">
              Generate Report
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{metric.icon}</span>
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
              {/* Mini Sparkline */}
              <div className="flex items-end space-x-1 mt-3 h-8">
                {metric.sparkline.map((value, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${
                      metric.trend === 'up' ? 'bg-green-500/50' : 'bg-red-500/50'
                    }`}
                    style={{ height: `${value}%` }}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Insights - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <span>🤖</span>
                <span>AI Insights</span>
              </h2>
              <Link to="/app/lean/ai-insights" className="text-indigo-400 text-sm hover:text-indigo-300">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-r ${getInsightColor(insight.type)} border rounded-2xl p-5`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                      <div>
                        <h3 className="font-semibold mb-1">{insight.title}</h3>
                        <p className="text-sm text-slate-300">{insight.description}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-xs text-slate-400">
                            Confidence: {insight.confidence}%
                          </span>
                          <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                            {insight.action} →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* OKR Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>🎯</span>
                  <span>OKR Progress</span>
                </h2>
                <Link to="/app/okr" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <div className="space-y-4">
                  {okrProgress.map((okr, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{okr.objective}</p>
                        <span className="text-sm text-slate-400">{okr.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            okr.progress >= 80 ? 'bg-green-500' :
                            okr.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${okr.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{okr.keyResults} Key Results</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>📅</span>
                  <span>Today's Schedule</span>
                </h2>
                <Link to="/app/meetings" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                        <span className="text-indigo-400 font-medium text-sm">{meeting.time.split(' ')[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{meeting.title}</p>
                        <p className="text-xs text-slate-400">{meeting.duration} • {meeting.attendees} attendees</p>
                      </div>
                      <button className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs hover:bg-indigo-500/30">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>✅</span>
                  <span>Action Items</span>
                </h2>
                <Link to="/app/meetings/action-items" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                <div className="space-y-2">
                  {actionItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-2 border-slate-600 bg-transparent checked:bg-indigo-500 checked:border-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-slate-500">Due: {item.due}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <span>⚡</span>
                <span>Quick Actions</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-center">
                  <span className="text-2xl mb-2 block">📊</span>
                  <span className="text-sm">Generate Report</span>
                </button>
                <button className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-center">
                  <span className="text-2xl mb-2 block">🤖</span>
                  <span className="text-sm">Ask AI</span>
                </button>
                <button className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-center">
                  <span className="text-2xl mb-2 block">📅</span>
                  <span className="text-sm">Schedule Meeting</span>
                </button>
                <button className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-center">
                  <span className="text-2xl mb-2 block">🎯</span>
                  <span className="text-sm">Add Goal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
