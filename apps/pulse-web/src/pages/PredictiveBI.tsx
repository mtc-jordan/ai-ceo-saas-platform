import { useState } from 'react';

// Enhanced Predictive Business Intelligence Dashboard
export default function PredictiveBI() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [activeTab, setActiveTab] = useState('forecast');

  // Key metrics
  const metrics = [
    { label: 'Predicted Revenue', value: '$4.2M', change: '+18%', confidence: '94%', icon: '📈' },
    { label: 'Churn Risk', value: '3.2%', change: '-0.8%', confidence: '91%', icon: '⚠️' },
    { label: 'Growth Score', value: '87', change: '+5', confidence: '89%', icon: '🚀' },
    { label: 'Market Fit', value: '92%', change: '+3%', confidence: '86%', icon: '🎯' },
  ];

  // Revenue forecast data
  const forecastData = [
    { month: 'Jan', actual: 2.1, predicted: 2.15, lower: 2.0, upper: 2.3 },
    { month: 'Feb', actual: 2.3, predicted: 2.35, lower: 2.2, upper: 2.5 },
    { month: 'Mar', actual: 2.5, predicted: 2.55, lower: 2.4, upper: 2.7 },
    { month: 'Apr', actual: 2.8, predicted: 2.85, lower: 2.7, upper: 3.0 },
    { month: 'May', actual: 3.1, predicted: 3.15, lower: 3.0, upper: 3.3 },
    { month: 'Jun', actual: null, predicted: 3.5, lower: 3.3, upper: 3.7 },
    { month: 'Jul', actual: null, predicted: 3.8, lower: 3.5, upper: 4.1 },
    { month: 'Aug', actual: null, predicted: 4.2, lower: 3.9, upper: 4.5 },
  ];

  // Anomaly alerts
  const anomalies = [
    { id: 1, metric: 'Customer Acquisition Cost', severity: 'high', change: '+45%', detected: '2 hours ago', description: 'CAC increased significantly above normal range' },
    { id: 2, metric: 'Website Traffic', severity: 'medium', change: '-22%', detected: '1 day ago', description: 'Unusual drop in organic traffic' },
    { id: 3, metric: 'Support Tickets', severity: 'low', change: '+35%', detected: '3 days ago', description: 'Higher than expected support volume' },
  ];

  // Churn risk customers
  const churnRiskCustomers = [
    { id: 1, name: 'TechCorp Industries', risk: 85, mrr: '$12,500', lastActivity: '14 days ago', signals: ['No login 14d', 'Support tickets up', 'Usage down 60%'] },
    { id: 2, name: 'Global Solutions Inc', risk: 72, mrr: '$8,200', lastActivity: '7 days ago', signals: ['Contract ending', 'Feature requests denied'] },
    { id: 3, name: 'StartupXYZ', risk: 68, mrr: '$3,500', lastActivity: '5 days ago', signals: ['Downgraded plan', 'Low engagement'] },
  ];

  // AI insights
  const aiInsights = [
    { type: 'opportunity', title: 'Upsell Opportunity', description: '15 customers showing expansion signals. Potential $45K MRR increase.', confidence: 92 },
    { type: 'risk', title: 'Seasonal Dip Expected', description: 'Historical data suggests 12% revenue dip in Q1. Plan mitigation strategies.', confidence: 88 },
    { type: 'trend', title: 'Product Feature Adoption', description: 'New analytics feature seeing 340% higher engagement. Consider premium tier.', confidence: 95 },
  ];

  // Model performance
  const modelPerformance = [
    { model: 'Revenue Forecast', accuracy: 94.2, lastTrained: '2 days ago', status: 'active' },
    { model: 'Churn Prediction', accuracy: 91.5, lastTrained: '1 day ago', status: 'active' },
    { model: 'Lead Scoring', accuracy: 87.8, lastTrained: '3 days ago', status: 'active' },
    { model: 'Anomaly Detection', accuracy: 89.3, lastTrained: '12 hours ago', status: 'active' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'text-red-400';
    if (risk >= 60) return 'text-amber-400';
    return 'text-green-400';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '💡';
      case 'risk': return '⚠️';
      case 'trend': return '📊';
      default: return '📌';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center space-x-3">
              <span className="text-4xl">🔮</span>
              <span>Predictive Business Intelligence</span>
            </h1>
            <p className="text-slate-400">ML-powered forecasting, anomaly detection, and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm"
            >
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
              <option value="12months">12 Months</option>
            </select>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors">
              Refresh Models
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{metric.icon}</span>
                <span className={`text-sm ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">{metric.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold">{metric.value}</p>
                <span className="text-xs text-indigo-400">{metric.confidence} confidence</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-6 border-b border-slate-800 pb-4">
          {[
            { id: 'forecast', label: 'Revenue Forecast', icon: '📈' },
            { id: 'anomalies', label: 'Anomaly Detection', icon: '🔍' },
            { id: 'churn', label: 'Churn Prediction', icon: '⚠️' },
            { id: 'models', label: 'Model Performance', icon: '🤖' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'forecast' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <span>📈</span>
                  <span>Revenue Forecast</span>
                </h2>
                
                {/* Chart Visualization */}
                <div className="h-64 mb-6 relative">
                  <div className="absolute inset-0 flex items-end justify-between px-4">
                    {forecastData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center" style={{ width: '10%' }}>
                        {/* Confidence interval */}
                        <div
                          className="w-full bg-indigo-500/10 rounded-t"
                          style={{ height: `${(data.upper - data.lower) * 40}px`, marginBottom: '-2px' }}
                        ></div>
                        {/* Predicted value */}
                        <div
                          className={`w-3 h-3 rounded-full ${data.actual ? 'bg-green-500' : 'bg-indigo-500'} z-10`}
                        ></div>
                        {/* Bar */}
                        <div
                          className={`w-full ${data.actual ? 'bg-green-500/30' : 'bg-indigo-500/30'} rounded-b`}
                          style={{ height: `${(data.predicted || data.actual) * 50}px` }}
                        ></div>
                        <span className="text-xs text-slate-500 mt-2">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-400">Actual</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-slate-400">Predicted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-3 bg-indigo-500/20 rounded"></div>
                    <span className="text-slate-400">Confidence Interval</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'anomalies' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <span>🔍</span>
                  <span>Detected Anomalies</span>
                </h2>
                <div className="space-y-4">
                  {anomalies.map((anomaly) => (
                    <div
                      key={anomaly.id}
                      className={`border rounded-xl p-4 ${getSeverityColor(anomaly.severity)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{anomaly.metric}</h3>
                        <span className="text-sm">{anomaly.change}</span>
                      </div>
                      <p className="text-sm opacity-80 mb-2">{anomaly.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="opacity-60">Detected {anomaly.detected}</span>
                        <button className="px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                          Investigate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'churn' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>Churn Risk Customers</span>
                </h2>
                <div className="space-y-4">
                  {churnRiskCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{customer.name}</h3>
                          <p className="text-sm text-slate-400">MRR: {customer.mrr}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getRiskColor(customer.risk)}`}>
                            {customer.risk}%
                          </p>
                          <p className="text-xs text-slate-500">Risk Score</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {customer.signals.map((signal, i) => (
                          <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">
                            {signal}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Last activity: {customer.lastActivity}</span>
                        <button className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs transition-colors">
                          Take Action
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'models' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <span>🤖</span>
                  <span>ML Model Performance</span>
                </h2>
                <div className="space-y-4">
                  {modelPerformance.map((model, index) => (
                    <div
                      key={index}
                      className="bg-slate-800/50 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{model.model}</h3>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          {model.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-400">Accuracy</span>
                            <span className="font-medium">{model.accuracy}%</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${model.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Last trained</p>
                          <p className="text-sm">{model.lastTrained}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - AI Insights */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <span>🧠</span>
                <span>AI Insights</span>
              </h3>
              <div className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span>{getInsightIcon(insight.type)}</span>
                      <span className="font-medium text-sm">{insight.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-400">{insight.confidence}% confidence</span>
                      <button className="text-xs text-indigo-400 hover:text-indigo-300">
                        Learn more →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Prediction Accuracy</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Last 30 days</span>
                    <span className="text-green-400">94.2%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '94.2%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Last 90 days</span>
                    <span className="text-green-400">91.8%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '91.8%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Data Sources</h3>
              <div className="space-y-2">
                {['CRM Data', 'Financial Systems', 'Product Analytics', 'Support Tickets'].map((source, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                    <span className="text-sm">{source}</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
