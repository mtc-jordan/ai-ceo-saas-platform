import { useState } from 'react';
import { Link } from 'react-router-dom';

// Enhanced OKR Dashboard
export default function OKRDashboard() {
  const [selectedCycle, setSelectedCycle] = useState('Q4 2024');
  const [viewMode, setViewMode] = useState('objectives');

  // OKR Statistics
  const stats = [
    { label: 'Total Objectives', value: '12', icon: '🎯', change: '3 company, 9 team' },
    { label: 'Key Results', value: '48', icon: '📊', change: '38 on track' },
    { label: 'Avg Progress', value: '67%', icon: '📈', change: '+12% this month' },
    { label: 'Team Alignment', value: '94%', icon: '🔗', change: 'All aligned' },
  ];

  // Company Objectives
  const objectives = [
    {
      id: 1,
      title: 'Achieve $5M ARR by Q4 2024',
      level: 'company',
      owner: 'CEO',
      progress: 78,
      status: 'on_track',
      keyResults: [
        { id: 1, title: 'Increase MRR to $420K', progress: 85, target: '$420K', current: '$357K' },
        { id: 2, title: 'Acquire 50 new enterprise customers', progress: 72, target: '50', current: '36' },
        { id: 3, title: 'Reduce churn to <3%', progress: 90, target: '<3%', current: '2.8%' },
      ]
    },
    {
      id: 2,
      title: 'Launch 3 new product features',
      level: 'company',
      owner: 'CPO',
      progress: 66,
      status: 'on_track',
      keyResults: [
        { id: 4, title: 'Ship AI Analytics feature', progress: 100, target: 'Shipped', current: 'Done' },
        { id: 5, title: 'Launch mobile app v1', progress: 60, target: 'Dec 31', current: 'In Progress' },
        { id: 6, title: 'Implement SSO integration', progress: 40, target: 'Dec 31', current: 'Development' },
      ]
    },
    {
      id: 3,
      title: 'Achieve 95% customer satisfaction',
      level: 'company',
      owner: 'CCO',
      progress: 88,
      status: 'ahead',
      keyResults: [
        { id: 7, title: 'NPS score > 70', progress: 95, target: '70', current: '72' },
        { id: 8, title: 'Response time < 2 hours', progress: 85, target: '<2h', current: '1.8h' },
        { id: 9, title: 'Resolution rate > 90%', progress: 82, target: '>90%', current: '88%' },
      ]
    },
  ];

  // Team Objectives
  const teamObjectives = [
    { team: 'Engineering', objectives: 4, progress: 72, status: 'on_track' },
    { team: 'Sales', objectives: 3, progress: 65, status: 'at_risk' },
    { team: 'Marketing', objectives: 2, progress: 81, status: 'on_track' },
    { team: 'Customer Success', objectives: 2, progress: 90, status: 'ahead' },
  ];

  // Recent updates
  const recentUpdates = [
    { objective: 'Achieve $5M ARR', update: 'MRR increased to $357K', user: 'John Smith', time: '2 hours ago', type: 'progress' },
    { objective: 'Launch mobile app', update: 'Beta testing started', user: 'Sarah Johnson', time: '1 day ago', type: 'milestone' },
    { objective: 'NPS score > 70', update: 'Score reached 72!', user: 'Michael Chen', time: '2 days ago', type: 'achieved' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'bg-green-500/20 text-green-400';
      case 'on_track': return 'bg-blue-500/20 text-blue-400';
      case 'at_risk': return 'bg-amber-500/20 text-amber-400';
      case 'behind': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'progress': return '📈';
      case 'milestone': return '🏆';
      case 'achieved': return '✅';
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
              <span className="text-4xl">🎯</span>
              <span>Goals & OKRs</span>
            </h1>
            <p className="text-slate-400">Track objectives and key results across your organization</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm"
            >
              <option value="Q4 2024">Q4 2024</option>
              <option value="Q3 2024">Q3 2024</option>
              <option value="Q2 2024">Q2 2024</option>
              <option value="Q1 2024">Q1 2024</option>
            </select>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors">
              New Objective
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-sm text-slate-400">{stat.change}</span>
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => setViewMode('objectives')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              viewMode === 'objectives' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Objectives
          </button>
          <button
            onClick={() => setViewMode('teams')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              viewMode === 'teams' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Teams
          </button>
          <Link
            to="/app/okr/alignment"
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Alignment View
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {viewMode === 'objectives' ? (
              <>
                {objectives.map((objective) => (
                  <div
                    key={objective.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(objective.status)}`}>
                            {objective.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-500">{objective.level}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{objective.title}</h3>
                        <p className="text-sm text-slate-400">Owner: {objective.owner}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{objective.progress}%</p>
                        <p className="text-xs text-slate-500">Progress</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
                      <div
                        className={`h-full ${getProgressColor(objective.progress)} rounded-full transition-all`}
                        style={{ width: `${objective.progress}%` }}
                      ></div>
                    </div>

                    {/* Key Results */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-400">Key Results</h4>
                      {objective.keyResults.map((kr) => (
                        <div key={kr.id} className="bg-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">{kr.title}</p>
                            <span className="text-sm font-bold">{kr.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
                            <div
                              className={`h-full ${getProgressColor(kr.progress)} rounded-full`}
                              style={{ width: `${kr.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Current: {kr.current}</span>
                            <span>Target: {kr.target}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6">Team Progress</h2>
                <div className="space-y-4">
                  {teamObjectives.map((team, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{team.team}</h3>
                          <p className="text-sm text-slate-400">{team.objectives} objectives</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(team.status)}`}>
                            {team.status.replace('_', ' ')}
                          </span>
                          <span className="text-xl font-bold">{team.progress}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(team.progress)} rounded-full`}
                          style={{ width: `${team.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Cycle Progress */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">{selectedCycle} Progress</h3>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Overall</span>
                  <span className="text-lg font-bold">67%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '67%' }}></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>Start: Oct 1</span>
                  <span>45 days left</span>
                  <span>End: Dec 31</span>
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Recent Updates</h3>
              <div className="space-y-3">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-lg">{getUpdateIcon(update.type)}</span>
                    <div>
                      <p className="text-sm font-medium">{update.objective}</p>
                      <p className="text-xs text-slate-400">{update.update}</p>
                      <p className="text-xs text-slate-500">{update.user} • {update.time}</p>
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
                  <span>➕</span>
                  <span className="text-sm">Add Objective</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>📊</span>
                  <span className="text-sm">Update Progress</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>📄</span>
                  <span className="text-sm">Export Report</span>
                </button>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <span>🤖</span>
                <span>AI Suggestions</span>
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-sm text-amber-400">Sales team may miss Q4 target. Consider resource reallocation.</p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-sm text-green-400">Customer Success exceeding goals. Document best practices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
