import { useState } from 'react';
import {
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  
  ArrowTrendingDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Mock data
const mockDashboard = {
  summary: {
    total_meetings: 24,
    total_hours: 18.5,
    total_action_items: 45,
    completion_rate: 73,
    efficiency_score: 78,
    unique_participants: 12
  },
  time_trends: {
    weekly_data: [
      { week: '2024-W49', total_hours: 4.2, meeting_count: 5, unique_participants: 8 },
      { week: '2024-W50', total_hours: 5.1, meeting_count: 6, unique_participants: 10 },
      { week: '2024-W51', total_hours: 4.8, meeting_count: 5, unique_participants: 9 },
      { week: '2024-W52', total_hours: 4.4, meeting_count: 5, unique_participants: 8 }
    ],
    summary: { week_over_week_change: -8.3, trend: 'stable' }
  },
  top_topics: [
    { topic: 'Sprint Progress', frequency: 12, percentage: 18.5 },
    { topic: 'Product Roadmap', frequency: 8, percentage: 12.3 },
    { topic: 'Customer Feedback', frequency: 7, percentage: 10.8 },
    { topic: 'Financial Review', frequency: 6, percentage: 9.2 },
    { topic: 'Team Updates', frequency: 5, percentage: 7.7 }
  ],
  action_item_summary: {
    completed: 33,
    pending: 8,
    overdue: 4,
    completion_rate: 73
  },
  efficiency: {
    score: 78,
    grade: 'B',
    recommendations: [
      'Create agendas for meetings to improve focus and outcomes',
      'Ensure meetings conclude with clear action items and owners'
    ]
  }
};

const mockParticipation = {
  participants: [
    { name: 'John Smith', meetings_attended: 18, total_hours: 14.5, meetings_organized: 8, engagement_score: 95, primary_role: 'Organizer' },
    { name: 'Sarah Johnson', meetings_attended: 15, total_hours: 12.0, meetings_organized: 5, engagement_score: 82, primary_role: 'Attendee' },
    { name: 'Mike Chen', meetings_attended: 12, total_hours: 9.5, meetings_organized: 3, engagement_score: 68, primary_role: 'Attendee' },
    { name: 'Emily Davis', meetings_attended: 10, total_hours: 8.0, meetings_organized: 2, engagement_score: 55, primary_role: 'Attendee' },
    { name: 'Lisa Wang', meetings_attended: 8, total_hours: 6.5, meetings_organized: 1, engagement_score: 45, primary_role: 'Attendee' }
  ],
  average_meeting_size: 4.2
};

const mockInsights = [
  { type: 'success', category: 'efficiency', title: 'Strong Meeting Efficiency', description: 'Meeting efficiency score of 78% is good. Keep up the good practices!', impact: 'positive' },
  { type: 'warning', category: 'action_items', title: '4 Overdue Action Items', description: 'There are overdue action items that need attention. Review and reassign if necessary.', impact: 'high' },
  { type: 'info', category: 'topics', title: 'Most Discussed: Sprint Progress', description: "'Sprint Progress' was discussed in 12 meetings (18.5% of all topics).", impact: 'low' },
  { type: 'suggestion', category: 'participation', title: 'Meeting Size Optimal', description: 'Average meeting has 4.2 participants, which is optimal for productivity.', impact: 'positive' }
];

const mockActionItems = [
  { id: 1, title: 'Review PR #123', assignee: 'Mike Chen', status: 'completed', due_date: '2024-12-17', meeting: 'Weekly Standup' },
  { id: 2, title: 'Update documentation', assignee: 'Emily Davis', status: 'pending', due_date: '2024-12-20', meeting: 'Weekly Standup' },
  { id: 3, title: 'Draft Q1 roadmap', assignee: 'John Smith', status: 'in_progress', due_date: '2024-12-23', meeting: 'Product Strategy' },
  { id: 4, title: 'Contact at-risk accounts', assignee: 'Tom Wilson', status: 'overdue', due_date: '2024-12-20', meeting: 'Customer Success' },
  { id: 5, title: 'Finalize board deck', assignee: 'John Smith', status: 'in_progress', due_date: '2024-12-23', meeting: 'Board Prep' }
];

export default function MeetingAnalytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'time' | 'topics' | 'actions' | 'participation'>('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'time', name: 'Time Analysis', icon: ClockIcon },
    { id: 'topics', name: 'Topics', icon: ChatBubbleLeftRightIcon },
    { id: 'actions', name: 'Action Items', icon: CheckCircleIcon },
    { id: 'participation', name: 'Participation', icon: UserGroupIcon }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meeting Analytics</h1>
            <p className="text-gray-600 mt-1">Insights into meeting patterns, topics, and team participation</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This quarter</option>
              <option>This year</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Meetings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{mockDashboard.summary.total_meetings}</p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Meeting Hours</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{mockDashboard.summary.total_hours}h</p>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <ArrowTrendingDownIcon className="w-4 h-4" />
                      8.3% less than last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Action Items</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{mockDashboard.summary.total_action_items}</p>
                    <p className="text-sm text-gray-500 mt-1">{mockDashboard.action_item_summary.completion_rate}% completed</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Efficiency Score</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{mockDashboard.efficiency.score}%</p>
                    <p className="text-sm text-gray-500 mt-1">Grade: {mockDashboard.efficiency.grade}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Meeting Hours */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Meeting Hours</h3>
                <div className="h-48 flex items-end gap-4">
                  {mockDashboard.time_trends.weekly_data.map((week, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-indigo-500 rounded-t"
                        style={{ height: `${(week.total_hours / 6) * 180}px` }}
                      />
                      <span className="text-xs text-gray-500 mt-2">W{week.week.split('W')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Topics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Discussion Topics</h3>
                <div className="space-y-3">
                  {mockDashboard.top_topics.map((topic, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{topic.topic}</span>
                        <span className="text-sm text-gray-500">{topic.frequency} mentions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${topic.percentage * 4}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockInsights.map((insight, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {insight.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                      {insight.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />}
                      {insight.type === 'info' && <LightBulbIcon className="w-5 h-5 text-blue-600" />}
                      {insight.type === 'suggestion' && <LightBulbIcon className="w-5 h-5 text-purple-600" />}
                      <span className="font-medium text-gray-900">{insight.title}</span>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Time Analysis Tab */}
        {activeTab === 'time' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Time Distribution</h3>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {mockDashboard.time_trends.weekly_data.map((week, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Week {week.week.split('W')[1]}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{week.total_hours}h</p>
                    <p className="text-sm text-gray-500">{week.meeting_count} meetings</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-700">
                  <strong>Trend:</strong> Meeting time is {mockDashboard.time_trends.summary.trend}. 
                  {mockDashboard.time_trends.summary.week_over_week_change < 0 
                    ? ` Decreased by ${Math.abs(mockDashboard.time_trends.summary.week_over_week_change)}% this week.`
                    : ` Increased by ${mockDashboard.time_trends.summary.week_over_week_change}% this week.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Analysis</h3>
              <div className="space-y-4">
                {mockDashboard.top_topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                      <p className="text-sm text-gray-500">Discussed in {topic.frequency} meetings</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{topic.percentage}%</p>
                      <p className="text-sm text-gray-500">of all topics</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Items Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{mockDashboard.action_item_summary.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{mockDashboard.action_item_summary.pending}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{mockDashboard.action_item_summary.overdue}</p>
                <p className="text-sm text-gray-500">Overdue</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-3xl font-bold text-gray-900">{mockDashboard.action_item_summary.completion_rate}%</p>
                <p className="text-sm text-gray-500">Completion Rate</p>
              </div>
            </div>

            {/* Action Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Action Items</h3>
              <div className="space-y-3">
                {mockActionItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <CheckCircleIcon className={`w-6 h-6 ${item.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">From: {item.meeting}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{item.assignee}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Participation Tab */}
        {activeTab === 'participation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Participation</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Meetings</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Hours</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Organized</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockParticipation.participants.map((participant, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm">
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{participant.name}</p>
                              <p className="text-xs text-gray-500">{participant.primary_role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 text-gray-900">{participant.meetings_attended}</td>
                        <td className="text-center py-3 px-4 text-gray-900">{participant.total_hours}h</td>
                        <td className="text-center py-3 px-4 text-gray-900">{participant.meetings_organized}</td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  participant.engagement_score >= 70 ? 'bg-green-500' :
                                  participant.engagement_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${participant.engagement_score}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{participant.engagement_score}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
