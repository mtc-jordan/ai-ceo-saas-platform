import { useState, useEffect } from 'react';

interface Insight {
  id: string;
  type: 'prediction' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  actionable: boolean;
  actions?: string[];
  data?: {
    current: number;
    predicted: number;
    change: number;
  };
  timestamp: Date;
}

interface AIInsightsProps {
  onInsightClick?: (insight: Insight) => void;
}

export default function AIInsights({ onInsightClick }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'prediction' | 'anomaly' | 'recommendation' | 'trend'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'impact' | 'recent'>('confidence');

  // Simulate loading insights
  useEffect(() => {
    const mockInsights: Insight[] = [
      {
        id: '1',
        type: 'prediction',
        title: 'Revenue Growth Forecast',
        description: 'Based on current trends, Q1 2025 revenue is projected to increase by 18% compared to Q4 2024. Key drivers include enterprise segment growth and improved retention rates.',
        confidence: 92,
        impact: 'high',
        category: 'Revenue',
        actionable: true,
        actions: ['Review sales pipeline', 'Increase marketing spend', 'Prepare for scaling'],
        data: { current: 2400000, predicted: 2832000, change: 18 },
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'anomaly',
        title: 'Unusual Login Pattern Detected',
        description: 'Login frequency from the APAC region has increased by 340% in the last 48 hours. This could indicate a successful marketing campaign or potential security concern.',
        confidence: 87,
        impact: 'medium',
        category: 'Security',
        actionable: true,
        actions: ['Review APAC marketing activities', 'Check security logs', 'Monitor for suspicious activity'],
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '3',
        type: 'recommendation',
        title: 'Optimize Customer Onboarding',
        description: 'Analysis shows customers who complete onboarding within 3 days have 45% higher retention. Currently, only 62% complete onboarding in this timeframe.',
        confidence: 94,
        impact: 'high',
        category: 'Customer Success',
        actionable: true,
        actions: ['Simplify onboarding steps', 'Add progress indicators', 'Send reminder emails'],
        data: { current: 62, predicted: 85, change: 37 },
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: '4',
        type: 'trend',
        title: 'Mobile Usage Increasing',
        description: 'Mobile app usage has grown 28% month-over-month, now representing 45% of all sessions. Consider prioritizing mobile-first features.',
        confidence: 96,
        impact: 'medium',
        category: 'Product',
        actionable: true,
        actions: ['Review mobile UX', 'Prioritize mobile features', 'Optimize mobile performance'],
        data: { current: 45, predicted: 58, change: 28 },
        timestamp: new Date(Date.now() - 14400000)
      },
      {
        id: '5',
        type: 'prediction',
        title: 'Churn Risk Alert',
        description: '3 enterprise accounts showing early warning signs of churn based on engagement patterns. Combined ARR at risk: $180,000.',
        confidence: 78,
        impact: 'high',
        category: 'Customer Success',
        actionable: true,
        actions: ['Schedule executive check-ins', 'Offer additional training', 'Review feature usage'],
        data: { current: 180000, predicted: 0, change: -100 },
        timestamp: new Date(Date.now() - 21600000)
      },
      {
        id: '6',
        type: 'anomaly',
        title: 'Support Ticket Spike',
        description: 'Support tickets related to API integration increased 200% after yesterday\'s release. May indicate a regression.',
        confidence: 91,
        impact: 'high',
        category: 'Support',
        actionable: true,
        actions: ['Review recent deployments', 'Check API logs', 'Prepare hotfix if needed'],
        timestamp: new Date(Date.now() - 28800000)
      },
      {
        id: '7',
        type: 'recommendation',
        title: 'Pricing Optimization Opportunity',
        description: 'Analysis suggests 23% of customers on the Voyager plan would upgrade to Enterprise with a targeted offer. Potential revenue increase: $45,000/month.',
        confidence: 85,
        impact: 'high',
        category: 'Revenue',
        actionable: true,
        actions: ['Identify upgrade candidates', 'Create targeted campaign', 'Prepare upgrade incentives'],
        data: { current: 0, predicted: 45000, change: 100 },
        timestamp: new Date(Date.now() - 36000000)
      },
      {
        id: '8',
        type: 'trend',
        title: 'Feature Adoption Accelerating',
        description: 'Nova Mind adoption increased 45% this month. Users who adopt Nova Mind have 2.3x higher engagement scores.',
        confidence: 98,
        impact: 'medium',
        category: 'Product',
        actionable: false,
        timestamp: new Date(Date.now() - 43200000)
      }
    ];

    setTimeout(() => {
      setInsights(mockInsights);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredInsights = insights
    .filter(insight => filter === 'all' || insight.type === filter)
    .sort((a, b) => {
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      if (sortBy === 'impact') {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  const getTypeIcon = (type: Insight['type']) => {
    switch (type) {
      case 'prediction': return '🔮';
      case 'anomaly': return '⚠️';
      case 'recommendation': return '💡';
      case 'trend': return '📈';
    }
  };

  const getTypeColor = (type: Insight['type']) => {
    switch (type) {
      case 'prediction': return 'from-purple-500/20 to-indigo-500/20 border-purple-500/30';
      case 'anomaly': return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
      case 'recommendation': return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30';
      case 'trend': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
    }
  };

  const getImpactBadge = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <span>🧠</span>
            <span>AI Insights</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">{insights.length} insights generated</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm"
          >
            <option value="confidence">By Confidence</option>
            <option value="impact">By Impact</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All', count: insights.length },
          { id: 'prediction', label: '🔮 Predictions', count: insights.filter(i => i.type === 'prediction').length },
          { id: 'anomaly', label: '⚠️ Anomalies', count: insights.filter(i => i.type === 'anomaly').length },
          { id: 'recommendation', label: '💡 Recommendations', count: insights.filter(i => i.type === 'recommendation').length },
          { id: 'trend', label: '📈 Trends', count: insights.filter(i => i.type === 'trend').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
              filter === tab.id ? 'bg-white/20' : 'bg-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            onClick={() => onInsightClick?.(insight)}
            className={`p-5 rounded-xl bg-gradient-to-br ${getTypeColor(insight.type)} border cursor-pointer hover:scale-[1.01] transition-all`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(insight.type)}</span>
                <div>
                  <h3 className="font-semibold">{insight.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-slate-400">{insight.category}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{formatTimeAgo(insight.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs border ${getImpactBadge(insight.impact)}`}>
                  {insight.impact} impact
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-4">{insight.description}</p>

            {/* Confidence Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Confidence</span>
                <span className="text-slate-300">{insight.confidence}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    insight.confidence >= 90 ? 'bg-green-500' :
                    insight.confidence >= 75 ? 'bg-cyan-500' :
                    'bg-amber-500'
                  }`}
                  style={{ width: `${insight.confidence}%` }}
                ></div>
              </div>
            </div>

            {/* Data Preview */}
            {insight.data && (
              <div className="flex items-center space-x-4 mb-4 p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-400">Current</p>
                  <p className="font-semibold">
                    {insight.category === 'Revenue' || insight.id === '5' 
                      ? `$${(insight.data.current / 1000).toFixed(0)}K`
                      : `${insight.data.current}%`}
                  </p>
                </div>
                <div className="text-2xl">→</div>
                <div>
                  <p className="text-xs text-slate-400">Predicted</p>
                  <p className="font-semibold">
                    {insight.category === 'Revenue' || insight.id === '5'
                      ? `$${(insight.data.predicted / 1000).toFixed(0)}K`
                      : `${insight.data.predicted}%`}
                  </p>
                </div>
                <div className={`ml-auto text-lg font-bold ${insight.data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {insight.data.change >= 0 ? '+' : ''}{insight.data.change}%
                </div>
              </div>
            )}

            {/* Actions */}
            {insight.actionable && insight.actions && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Suggested Actions</p>
                <div className="flex flex-wrap gap-2">
                  {insight.actions.map((action, index) => (
                    <button
                      key={index}
                      className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-400">No insights found for this filter</p>
        </div>
      )}
    </div>
  );
}
