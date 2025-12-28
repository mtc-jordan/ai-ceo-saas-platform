import { useState } from 'react';
import { Link } from 'react-router-dom';

// Enhanced AI Meeting Assistant Dashboard
export default function MeetingsDashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isUploading, setIsUploading] = useState(false);

  // Meeting statistics
  const stats = [
    { label: 'Total Meetings', value: '156', change: '+12 this month', icon: '📅' },
    { label: 'Action Items', value: '47', change: '23 pending', icon: '✅' },
    { label: 'Hours Saved', value: '42h', change: 'By AI summaries', icon: '⏱️' },
    { label: 'Transcriptions', value: '89%', change: 'Accuracy rate', icon: '📝' },
  ];

  // Upcoming meetings
  const upcomingMeetings = [
    {
      id: 1,
      title: 'Q4 Board Review',
      date: 'Today',
      time: '10:00 AM',
      duration: '2h',
      attendees: [
        { name: 'John Smith', avatar: 'JS' },
        { name: 'Sarah Johnson', avatar: 'SJ' },
        { name: 'Michael Chen', avatar: 'MC' },
      ],
      platform: 'Zoom',
      status: 'upcoming',
      hasTranscription: true
    },
    {
      id: 2,
      title: 'Product Strategy Session',
      date: 'Today',
      time: '2:00 PM',
      duration: '1h',
      attendees: [
        { name: 'Emily Davis', avatar: 'ED' },
        { name: 'Robert Wilson', avatar: 'RW' },
      ],
      platform: 'Google Meet',
      status: 'upcoming',
      hasTranscription: true
    },
    {
      id: 3,
      title: 'Engineering Standup',
      date: 'Tomorrow',
      time: '9:00 AM',
      duration: '30m',
      attendees: [
        { name: 'Team', avatar: '👥' },
      ],
      platform: 'Teams',
      status: 'scheduled',
      hasTranscription: false
    },
  ];

  // Recent meetings with AI analysis
  const recentMeetings = [
    {
      id: 101,
      title: 'Weekly Leadership Sync',
      date: 'Dec 27, 2024',
      duration: '45m',
      summary: 'Discussed Q4 targets, approved marketing budget, reviewed hiring plan.',
      actionItems: 5,
      keyDecisions: 3,
      sentiment: 'positive',
      participants: 6
    },
    {
      id: 102,
      title: 'Client Presentation - TechCorp',
      date: 'Dec 26, 2024',
      duration: '1h 15m',
      summary: 'Presented new product features, addressed concerns about timeline.',
      actionItems: 8,
      keyDecisions: 2,
      sentiment: 'neutral',
      participants: 8
    },
    {
      id: 103,
      title: 'Budget Planning Session',
      date: 'Dec 24, 2024',
      duration: '2h',
      summary: 'Finalized Q1 2025 budget allocations across departments.',
      actionItems: 12,
      keyDecisions: 7,
      sentiment: 'positive',
      participants: 5
    },
  ];

  // Action items
  const actionItems = [
    { id: 1, task: 'Send revised proposal to TechCorp', assignee: 'John Smith', due: 'Today', priority: 'high', meeting: 'Client Presentation' },
    { id: 2, task: 'Schedule follow-up with legal team', assignee: 'Sarah Johnson', due: 'Tomorrow', priority: 'medium', meeting: 'Weekly Leadership Sync' },
    { id: 3, task: 'Prepare Q1 budget presentation', assignee: 'Michael Chen', due: 'Dec 30', priority: 'high', meeting: 'Budget Planning Session' },
    { id: 4, task: 'Review hiring candidates', assignee: 'Emily Davis', due: 'Jan 2', priority: 'medium', meeting: 'Weekly Leadership Sync' },
  ];

  // Connected integrations
  const integrations = [
    { name: 'Zoom', status: 'connected', icon: '📹', meetings: 45 },
    { name: 'Google Meet', status: 'connected', icon: '🎥', meetings: 32 },
    { name: 'Microsoft Teams', status: 'connected', icon: '💬', meetings: 28 },
    { name: 'Webex', status: 'disconnected', icon: '🌐', meetings: 0 },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center space-x-3">
              <span className="text-4xl">🎙️</span>
              <span>AI Meeting Assistant</span>
            </h1>
            <p className="text-slate-400">Automatic transcription, summaries, and action items</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleFileUpload}
              disabled={isUploading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <span>📤</span>
              <span>{isUploading ? 'Uploading...' : 'Upload Recording'}</span>
            </button>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors">
              Schedule Meeting
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Meetings */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>📅</span>
                  <span>Upcoming Meetings</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      activeTab === 'upcoming' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      activeTab === 'past' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Past
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-xs text-slate-400">{meeting.date}</span>
                          <span className="text-sm font-bold text-indigo-400">{meeting.time.split(' ')[0]}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <p className="text-sm text-slate-400">{meeting.duration} • {meeting.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          {meeting.attendees.slice(0, 3).map((attendee, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-slate-900"
                            >
                              {attendee.avatar}
                            </div>
                          ))}
                          {meeting.attendees.length > 3 && (
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs border-2 border-slate-900">
                              +{meeting.attendees.length - 3}
                            </div>
                          )}
                        </div>
                        <button className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm">
                          Join
                        </button>
                      </div>
                    </div>
                    {meeting.hasTranscription && (
                      <div className="flex items-center space-x-2 text-xs text-green-400">
                        <span>✓</span>
                        <span>Auto-transcription enabled</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Meetings with AI Analysis */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>🤖</span>
                  <span>Recent Meetings (AI Analyzed)</span>
                </h2>
                <Link to="/app/meetings/list" className="text-indigo-400 text-sm hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentMeetings.map((meeting) => (
                  <Link
                    key={meeting.id}
                    to={`/app/meetings/${meeting.id}`}
                    className="block bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{meeting.title}</h3>
                      <span className="text-sm text-slate-400">{meeting.date}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{meeting.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="flex items-center space-x-1">
                          <span>✅</span>
                          <span>{meeting.actionItems} actions</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>📋</span>
                          <span>{meeting.keyDecisions} decisions</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>👥</span>
                          <span>{meeting.participants} participants</span>
                        </span>
                      </div>
                      <span className={`text-xs ${getSentimentColor(meeting.sentiment)}`}>
                        {meeting.sentiment === 'positive' ? '😊' : meeting.sentiment === 'negative' ? '😟' : '😐'} {meeting.sentiment}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Action Items */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center space-x-2">
                  <span>✅</span>
                  <span>Action Items</span>
                </h3>
                <Link to="/app/meetings/action-items" className="text-indigo-400 text-xs hover:text-indigo-300">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {actionItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="bg-slate-900/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className="text-xs text-slate-500">{item.due}</span>
                    </div>
                    <p className="text-sm font-medium mb-1">{item.task}</p>
                    <p className="text-xs text-slate-500">{item.assignee} • {item.meeting}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Integrations */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Integrations</h3>
                <Link to="/app/meetings/integrations" className="text-indigo-400 text-xs hover:text-indigo-300">
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {integrations.map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{integration.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-slate-500">{integration.meetings} meetings</p>
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${
                      integration.status === 'connected' ? 'bg-green-500' : 'bg-slate-500'
                    }`}></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>📤</span>
                  <span className="text-sm">Upload Recording</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>📊</span>
                  <span className="text-sm">Meeting Analytics</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                  <span>⚙️</span>
                  <span className="text-sm">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
