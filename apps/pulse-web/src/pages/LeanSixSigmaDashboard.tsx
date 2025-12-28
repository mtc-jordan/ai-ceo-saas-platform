import { useState } from 'react';
import { Link } from 'react-router-dom';

// Enhanced Lean Six Sigma Dashboard
export default function LeanSixSigmaDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');

  // Key metrics
  const metrics = [
    { label: 'Active Projects', value: '12', change: '+3 this month', icon: '📊', color: 'indigo' },
    { label: 'Total Savings', value: '$2.4M', change: '+$450K', icon: '💰', color: 'green' },
    { label: 'Average OEE', value: '87.2%', change: '+4.5%', icon: '⚙️', color: 'blue' },
    { label: 'Kaizen Events', value: '8', change: '2 completed', icon: '🎯', color: 'purple' },
  ];

  // DMAIC Pipeline
  const dmaicPipeline = [
    { phase: 'Define', count: 3, projects: ['Process Optimization', 'Quality Improvement', 'Cost Reduction'] },
    { phase: 'Measure', count: 2, projects: ['Cycle Time Analysis', 'Defect Tracking'] },
    { phase: 'Analyze', count: 4, projects: ['Root Cause Study', 'Variation Analysis', 'Capacity Study', 'Waste Mapping'] },
    { phase: 'Improve', count: 2, projects: ['Line Balancing', 'Setup Reduction'] },
    { phase: 'Control', count: 1, projects: ['SPC Implementation'] },
  ];

  // Waste Elimination (TIMWOODS)
  const wasteData = [
    { type: 'Transportation', eliminated: 85, remaining: 15, savings: '$45K' },
    { type: 'Inventory', eliminated: 72, remaining: 28, savings: '$120K' },
    { type: 'Motion', eliminated: 90, remaining: 10, savings: '$25K' },
    { type: 'Waiting', eliminated: 68, remaining: 32, savings: '$85K' },
    { type: 'Overproduction', eliminated: 78, remaining: 22, savings: '$95K' },
    { type: 'Over-processing', eliminated: 82, remaining: 18, savings: '$55K' },
    { type: 'Defects', eliminated: 91, remaining: 9, savings: '$180K' },
    { type: 'Skills', eliminated: 65, remaining: 35, savings: '$40K' },
  ];

  // OEE by Equipment
  const oeeData = [
    { equipment: 'Production Line A', oee: 92, availability: 95, performance: 98, quality: 99 },
    { equipment: 'Production Line B', oee: 87, availability: 90, performance: 95, quality: 102 },
    { equipment: 'Assembly Station 1', oee: 85, availability: 88, performance: 94, quality: 103 },
    { equipment: 'Packaging Unit', oee: 78, availability: 85, performance: 92, quality: 100 },
  ];

  // Active Kaizen Events
  const kaizenEvents = [
    { id: 1, name: 'Setup Time Reduction', status: 'in_progress', team: 5, savings: '$35K', progress: 65 },
    { id: 2, name: '5S Implementation', status: 'completed', team: 8, savings: '$20K', progress: 100 },
    { id: 3, name: 'Kanban System', status: 'planning', team: 4, savings: '$50K', progress: 15 },
  ];

  // Recent improvements
  const recentImprovements = [
    { title: 'Reduced cycle time by 23%', date: 'Dec 26', impact: 'high' },
    { title: 'Eliminated 3 non-value steps', date: 'Dec 24', impact: 'medium' },
    { title: 'Improved first-pass yield to 98.5%', date: 'Dec 22', impact: 'high' },
    { title: 'Reduced inventory by $85K', date: 'Dec 20', impact: 'high' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'planning': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getOEEColor = (oee: number) => {
    if (oee >= 85) return 'text-green-400';
    if (oee >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center space-x-3">
              <span className="text-4xl">📈</span>
              <span>Lean Six Sigma</span>
            </h1>
            <p className="text-slate-400">Continuous improvement and operational excellence</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors">
              New Project
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
                <span className="text-sm text-green-400">{metric.change}</span>
              </div>
              <p className="text-slate-400 text-sm mb-1">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* DMAIC Pipeline */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>🔄</span>
                  <span>DMAIC Pipeline</span>
                </h2>
                <Link to="/app/lean/dmaic" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All Projects
                </Link>
              </div>
              <div className="flex items-center justify-between mb-4">
                {dmaicPipeline.map((phase, index) => (
                  <div key={index} className="flex-1 text-center relative">
                    <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                      index === 0 ? 'bg-blue-500/20 text-blue-400' :
                      index === 1 ? 'bg-cyan-500/20 text-cyan-400' :
                      index === 2 ? 'bg-amber-500/20 text-amber-400' :
                      index === 3 ? 'bg-green-500/20 text-green-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {phase.count}
                    </div>
                    <p className="mt-2 text-sm font-medium">{phase.phase}</p>
                    {index < dmaicPipeline.length - 1 && (
                      <div className="absolute top-8 left-[60%] w-[80%] h-0.5 bg-slate-700"></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Projects in Analyze Phase</h3>
                <div className="flex flex-wrap gap-2">
                  {dmaicPipeline[2].projects.map((project, i) => (
                    <span key={i} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-sm">
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Waste Elimination */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>🗑️</span>
                  <span>Waste Elimination (TIMWOODS)</span>
                </h2>
                <Link to="/app/lean/waste" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View Details
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {wasteData.map((waste, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{waste.type}</span>
                      <span className="text-xs text-green-400">{waste.savings}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${waste.eliminated}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{waste.eliminated}% eliminated</p>
                  </div>
                ))}
              </div>
            </div>

            {/* OEE Tracking */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>⚙️</span>
                  <span>OEE Performance</span>
                </h2>
                <Link to="/app/lean/oee" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All Equipment
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-500">
                      <th className="pb-3">Equipment</th>
                      <th className="pb-3 text-center">OEE</th>
                      <th className="pb-3 text-center">Availability</th>
                      <th className="pb-3 text-center">Performance</th>
                      <th className="pb-3 text-center">Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {oeeData.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-800/30">
                        <td className="py-3 font-medium">{item.equipment}</td>
                        <td className="py-3 text-center">
                          <span className={`font-bold ${getOEEColor(item.oee)}`}>{item.oee}%</span>
                        </td>
                        <td className="py-3 text-center text-slate-400">{item.availability}%</td>
                        <td className="py-3 text-center text-slate-400">{item.performance}%</td>
                        <td className="py-3 text-center text-slate-400">{item.quality}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Kaizen Events */}
            <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Kaizen Events</span>
                </h3>
                <Link to="/app/lean/kaizen" className="text-indigo-400 text-xs hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {kaizenEvents.map((event) => (
                  <div key={event.id} className="bg-slate-900/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{event.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(event.status)}`}>
                        {event.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>{event.team} team members</span>
                      <span className="text-green-400">{event.savings}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${event.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Improvements */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Recent Improvements</h3>
              <div className="space-y-3">
                {recentImprovements.map((improvement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      improvement.impact === 'high' ? 'bg-green-500' : 'bg-amber-500'
                    }`}></div>
                    <div>
                      <p className="text-sm">{improvement.title}</p>
                      <p className="text-xs text-slate-500">{improvement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/app/lean/dmaic" className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-center transition-colors">
                  <span className="text-xl block mb-1">📊</span>
                  <span className="text-xs">DMAIC</span>
                </Link>
                <Link to="/app/lean/waste" className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-center transition-colors">
                  <span className="text-xl block mb-1">🗑️</span>
                  <span className="text-xs">Waste</span>
                </Link>
                <Link to="/app/lean/oee" className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-center transition-colors">
                  <span className="text-xl block mb-1">⚙️</span>
                  <span className="text-xs">OEE</span>
                </Link>
                <Link to="/app/lean/rca" className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-center transition-colors">
                  <span className="text-xl block mb-1">🔍</span>
                  <span className="text-xs">RCA</span>
                </Link>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <span>🤖</span>
                <span>AI Recommendations</span>
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-sm text-green-400">Focus on Packaging Unit - potential 15% OEE improvement</p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-sm text-amber-400">Inventory waste reduction could save additional $45K</p>
                </div>
              </div>
              <Link to="/app/lean/ai-insights" className="block mt-3 text-center text-sm text-indigo-400 hover:text-indigo-300">
                View All Insights →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
