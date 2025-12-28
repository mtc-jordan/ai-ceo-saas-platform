import { useState } from 'react';
import { Link } from 'react-router-dom';

// Enhanced Workflow Automation Dashboard
export default function WorkflowDashboard() {
  const [activeTab, setActiveTab] = useState('workflows');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Statistics
  const stats = [
    { label: 'Active Workflows', value: '12', icon: '⚙️', change: '+2 this week' },
    { label: 'Executions Today', value: '156', icon: '▶️', change: '98% success' },
    { label: 'Time Saved', value: '24h', icon: '⏱️', change: 'This month' },
    { label: 'Scheduled Tasks', value: '8', icon: '📅', change: '3 pending' },
  ];

  // Workflows
  const workflows = [
    {
      id: 1,
      name: 'Daily Executive Briefing',
      description: 'Generate and send daily briefing to executives at 7 AM',
      trigger: 'Schedule',
      triggerDetails: 'Daily at 7:00 AM',
      status: 'active',
      lastRun: '7:00 AM today',
      nextRun: '7:00 AM tomorrow',
      executions: 156,
      successRate: 99.4,
      actions: ['Gather metrics', 'Generate AI summary', 'Send email']
    },
    {
      id: 2,
      name: 'Meeting Follow-up Automation',
      description: 'Automatically send meeting summaries and action items after meetings',
      trigger: 'Event',
      triggerDetails: 'Meeting ends',
      status: 'active',
      lastRun: '2 hours ago',
      nextRun: 'On trigger',
      executions: 89,
      successRate: 97.8,
      actions: ['Extract summary', 'Create action items', 'Notify participants']
    },
    {
      id: 3,
      name: 'OKR Progress Reminder',
      description: 'Send weekly OKR update reminders to team leads',
      trigger: 'Schedule',
      triggerDetails: 'Every Friday at 9:00 AM',
      status: 'active',
      lastRun: 'Last Friday',
      nextRun: 'This Friday',
      executions: 24,
      successRate: 100,
      actions: ['Check OKR status', 'Generate report', 'Send reminders']
    },
    {
      id: 4,
      name: 'Revenue Alert',
      description: 'Alert when daily revenue drops below threshold',
      trigger: 'Condition',
      triggerDetails: 'Revenue < $10K',
      status: 'active',
      lastRun: '3 days ago',
      nextRun: 'On trigger',
      executions: 5,
      successRate: 100,
      actions: ['Check revenue', 'Analyze cause', 'Send alert']
    },
    {
      id: 5,
      name: 'New Customer Onboarding',
      description: 'Automated onboarding sequence for new customers',
      trigger: 'Event',
      triggerDetails: 'New customer signup',
      status: 'paused',
      lastRun: '1 week ago',
      nextRun: 'Paused',
      executions: 45,
      successRate: 95.6,
      actions: ['Send welcome email', 'Create account', 'Schedule call']
    },
  ];

  // Recent executions
  const recentExecutions = [
    { workflow: 'Daily Executive Briefing', status: 'success', time: '7:00 AM', duration: '45s' },
    { workflow: 'Meeting Follow-up Automation', status: 'success', time: '10:30 AM', duration: '1m 12s' },
    { workflow: 'Revenue Alert', status: 'skipped', time: '11:00 AM', duration: '5s' },
    { workflow: 'OKR Progress Reminder', status: 'success', time: 'Yesterday', duration: '2m 30s' },
    { workflow: 'New Customer Onboarding', status: 'failed', time: '2 days ago', duration: '30s' },
  ];

  // Trigger types
  const triggerTypes = [
    { type: 'Schedule', icon: '⏰', description: 'Run at specific times' },
    { type: 'Event', icon: '⚡', description: 'Triggered by events' },
    { type: 'Condition', icon: '🔍', description: 'When conditions are met' },
    { type: 'Webhook', icon: '🔗', description: 'External API triggers' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'paused': return 'bg-amber-500/20 text-amber-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'skipped': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'Schedule': return '⏰';
      case 'Event': return '⚡';
      case 'Condition': return '🔍';
      case 'Webhook': return '🔗';
      default: return '⚙️';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center space-x-3">
              <span className="text-4xl">⚙️</span>
              <span>Workflow Automation</span>
            </h1>
            <p className="text-slate-400">Automate repetitive tasks and streamline your operations</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/app/scheduled-tasks"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              📅 Scheduled Tasks
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors"
            >
              + Create Workflow
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
                <span className="text-sm text-green-400">{stat.change}</span>
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-6 border-b border-slate-800 pb-4">
          {[
            { id: 'workflows', label: 'My Workflows', icon: '⚙️' },
            { id: 'templates', label: 'Templates', icon: '📋' },
            { id: 'history', label: 'Execution History', icon: '📜' },
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
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'workflows' && (
              <>
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-2xl">
                          {getTriggerIcon(workflow.trigger)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{workflow.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(workflow.status)}`}>
                              {workflow.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{workflow.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                          ▶️
                        </button>
                        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                          ⚙️
                        </button>
                      </div>
                    </div>

                    {/* Workflow Details */}
                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-slate-500">Trigger</p>
                        <p className="font-medium">{workflow.triggerDetails}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Last Run</p>
                        <p className="font-medium">{workflow.lastRun}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Executions</p>
                        <p className="font-medium">{workflow.executions}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Success Rate</p>
                        <p className="font-medium text-green-400">{workflow.successRate}%</p>
                      </div>
                    </div>

                    {/* Actions Flow */}
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      {workflow.actions.map((action, i) => (
                        <div key={i} className="flex items-center">
                          <span className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs whitespace-nowrap">
                            {action}
                          </span>
                          {i < workflow.actions.length - 1 && (
                            <span className="mx-2 text-slate-600">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'templates' && (
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Daily Report', description: 'Generate and send daily reports', icon: '📊', category: 'Reporting' },
                  { name: 'Lead Notification', description: 'Alert sales team on new leads', icon: '🔔', category: 'Sales' },
                  { name: 'Data Backup', description: 'Automated data backup routine', icon: '💾', category: 'System' },
                  { name: 'Customer Follow-up', description: 'Automated customer check-ins', icon: '👥', category: 'Customer Success' },
                  { name: 'Invoice Reminder', description: 'Send payment reminders', icon: '💰', category: 'Finance' },
                  { name: 'Social Media Post', description: 'Schedule social media content', icon: '📱', category: 'Marketing' },
                ].map((template, index) => (
                  <div
                    key={index}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl">{template.icon}</span>
                      <div>
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <p className="text-sm text-slate-400 mb-2">{template.description}</p>
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs">{template.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-500 border-b border-slate-800">
                      <th className="p-4">Workflow</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Time</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {recentExecutions.map((execution, index) => (
                      <tr key={index} className="hover:bg-slate-800/30">
                        <td className="p-4 font-medium">{execution.workflow}</td>
                        <td className="p-4">
                          <span className={`flex items-center space-x-2 ${getExecutionStatusColor(execution.status)}`}>
                            <span>{execution.status === 'success' ? '✓' : execution.status === 'failed' ? '✗' : '○'}</span>
                            <span className="capitalize">{execution.status}</span>
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{execution.time}</td>
                        <td className="p-4 text-slate-400">{execution.duration}</td>
                        <td className="p-4">
                          <button className="text-indigo-400 hover:text-indigo-300 text-sm">View Logs</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Trigger Types */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Trigger Types</h3>
              <div className="space-y-3">
                {triggerTypes.map((trigger, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-xl">{trigger.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{trigger.type}</p>
                      <p className="text-xs text-slate-500">{trigger.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Executions</span>
                  <span className="font-bold">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Success Rate</span>
                  <span className="font-bold text-green-400">98.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Time Saved</span>
                  <span className="font-bold">72 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cost Savings</span>
                  <span className="font-bold text-green-400">$4,500</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentExecutions.slice(0, 4).map((execution, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${
                      execution.status === 'success' ? 'bg-green-500' :
                      execution.status === 'failed' ? 'bg-red-500' : 'bg-slate-500'
                    }`}></span>
                    <div>
                      <p className="text-sm font-medium">{execution.workflow}</p>
                      <p className="text-xs text-slate-500">{execution.time}</p>
                    </div>
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
