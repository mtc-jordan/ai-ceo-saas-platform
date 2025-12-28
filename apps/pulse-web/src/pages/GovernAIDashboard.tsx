import { useState } from 'react';
import { Link } from 'react-router-dom';

// Enhanced GovernAI Board Governance Dashboard
export default function GovernAIDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Governance metrics
  const governanceMetrics = [
    { label: 'Board Meetings', value: '4', change: 'This Quarter', icon: '📅', color: 'indigo' },
    { label: 'Compliance Score', value: '94%', change: '+2%', icon: '✅', color: 'green' },
    { label: 'Open Resolutions', value: '7', change: '3 pending', icon: '📋', color: 'amber' },
    { label: 'ESG Rating', value: 'A+', change: 'Excellent', icon: '🌱', color: 'emerald' },
  ];

  // Upcoming meetings
  const upcomingMeetings = [
    {
      id: 1,
      title: 'Q4 Board Meeting',
      date: 'Dec 30, 2024',
      time: '10:00 AM',
      type: 'Regular',
      attendees: 8,
      agenda: ['Financial Review', 'Strategic Plan', 'CEO Report'],
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Audit Committee',
      date: 'Jan 5, 2025',
      time: '2:00 PM',
      type: 'Committee',
      attendees: 5,
      agenda: ['Annual Audit', 'Risk Assessment'],
      status: 'scheduled'
    },
    {
      id: 3,
      title: 'Compensation Committee',
      date: 'Jan 10, 2025',
      time: '11:00 AM',
      type: 'Committee',
      attendees: 4,
      agenda: ['Executive Compensation', 'Bonus Structure'],
      status: 'draft'
    },
  ];

  // Compliance items
  const complianceItems = [
    { item: 'Annual Report Filing', deadline: 'Mar 31, 2025', status: 'on_track', progress: 45 },
    { item: 'SOX Compliance Audit', deadline: 'Feb 28, 2025', status: 'on_track', progress: 60 },
    { item: 'Board Diversity Report', deadline: 'Jan 31, 2025', status: 'at_risk', progress: 30 },
    { item: 'ESG Disclosure', deadline: 'Apr 15, 2025', status: 'on_track', progress: 25 },
  ];

  // Board members
  const boardMembers = [
    { name: 'John Smith', role: 'Chairman', attendance: '100%', committees: ['Audit', 'Compensation'] },
    { name: 'Sarah Johnson', role: 'Independent Director', attendance: '92%', committees: ['Audit'] },
    { name: 'Michael Chen', role: 'Independent Director', attendance: '100%', committees: ['Compensation', 'Governance'] },
    { name: 'Emily Davis', role: 'CEO', attendance: '100%', committees: [] },
    { name: 'Robert Wilson', role: 'CFO', attendance: '96%', committees: ['Audit'] },
  ];

  // Recent resolutions
  const recentResolutions = [
    { id: 'RES-2024-042', title: 'Q4 Budget Approval', status: 'approved', date: 'Dec 15, 2024', votes: '8-0' },
    { id: 'RES-2024-041', title: 'Executive Compensation Plan', status: 'approved', date: 'Dec 10, 2024', votes: '7-1' },
    { id: 'RES-2024-040', title: 'Strategic Partnership', status: 'pending', date: 'Dec 20, 2024', votes: '-' },
    { id: 'RES-2024-039', title: 'Dividend Declaration', status: 'approved', date: 'Dec 5, 2024', votes: '8-0' },
  ];

  // ESG metrics
  const esgMetrics = {
    environmental: { score: 85, trend: 'up', items: ['Carbon Neutral by 2030', 'Renewable Energy: 65%'] },
    social: { score: 92, trend: 'up', items: ['Diversity Index: 4.2/5', 'Employee Satisfaction: 88%'] },
    governance: { score: 94, trend: 'stable', items: ['Board Independence: 75%', 'Audit Quality: A+'] },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-amber-500/20 text-amber-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'draft': return 'bg-slate-500/20 text-slate-400';
      case 'on_track': return 'bg-green-500/20 text-green-400';
      case 'at_risk': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center space-x-3">
              <span className="text-4xl">⚖️</span>
              <span>GovernAI</span>
            </h1>
            <p className="text-slate-400">AI-powered board governance and compliance management</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors">
              Compliance Report
            </button>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors">
              Schedule Meeting
            </button>
          </div>
        </div>

        {/* Governance Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {governanceMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{metric.icon}</span>
                <span className="text-sm text-slate-400">{metric.change}</span>
              </div>
              <p className="text-slate-400 text-sm mb-1">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Meetings */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>📅</span>
                  <span>Upcoming Board Meetings</span>
                </h2>
                <Link to="/app/governai/meetings" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-indigo-400 font-bold">{meeting.date.split(' ')[1].replace(',', '')}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <p className="text-sm text-slate-400">{meeting.date} at {meeting.time}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-400">
                          <span className="text-slate-500">Type:</span> {meeting.type}
                        </span>
                        <span className="text-slate-400">
                          <span className="text-slate-500">Attendees:</span> {meeting.attendees}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {meeting.agenda.slice(0, 2).map((item, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-700/50 rounded text-xs">{item}</span>
                        ))}
                        {meeting.agenda.length > 2 && (
                          <span className="text-xs text-slate-500">+{meeting.agenda.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Tracker */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>✅</span>
                  <span>Compliance Tracker</span>
                </h2>
                <Link to="/app/governai/compliance" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {complianceItems.map((item, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{item.item}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Deadline: {item.deadline}</span>
                      <span className="text-slate-400">{item.progress}% complete</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === 'at_risk' ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ESG Dashboard */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>🌱</span>
                  <span>ESG Performance</span>
                </h2>
                <Link to="/app/governai/esg" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View Details
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(esgMetrics).map(([key, data]) => (
                  <div key={key} className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium capitalize">{key}</h3>
                      <span className={`text-sm ${
                        data.trend === 'up' ? 'text-green-400' : 'text-slate-400'
                      }`}>
                        {data.trend === 'up' ? '↑' : '→'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-slate-700"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={`${data.score * 1.76} 176`}
                            className={
                              key === 'environmental' ? 'text-emerald-500' :
                              key === 'social' ? 'text-blue-500' : 'text-purple-500'
                            }
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-bold">
                          {data.score}
                        </span>
                      </div>
                      <div className="flex-1">
                        {data.items.map((item, i) => (
                          <p key={i} className="text-xs text-slate-400">{item}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Board Members */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Board Members</h3>
                <span className="text-xs text-slate-500">{boardMembers.length} members</span>
              </div>
              <div className="space-y-3">
                {boardMembers.slice(0, 4).map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                    <span className="text-xs text-green-400">{member.attendance}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 text-sm text-indigo-400 hover:text-indigo-300">
                View All Members →
              </button>
            </div>

            {/* Recent Resolutions */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Resolutions</h3>
                <Link to="/app/governai/resolutions" className="text-indigo-400 text-xs hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentResolutions.map((resolution) => (
                  <div key={resolution.id} className="p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">{resolution.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(resolution.status)}`}>
                        {resolution.status}
                      </span>
                    </div>
                    <p className="font-medium text-sm mb-1">{resolution.title}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{resolution.date}</span>
                      <span>Votes: {resolution.votes}</span>
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
                  <span>📅</span>
                  <span className="text-sm">Schedule Meeting</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>📋</span>
                  <span className="text-sm">Create Resolution</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>📊</span>
                  <span className="text-sm">Generate Report</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>📁</span>
                  <span className="text-sm">Board Documents</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
