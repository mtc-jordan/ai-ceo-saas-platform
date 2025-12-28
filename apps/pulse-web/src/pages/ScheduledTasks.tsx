import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  task_type: string;
  schedule_type: 'once' | 'recurring';
  scheduled_at?: string;
  cron_expression?: string;
  cron_description?: string;
  is_active: boolean;
  next_run_at?: string;
  last_run_at?: string;
  last_run_status?: 'completed' | 'failed';
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  created_at: string;
}

const ScheduledTasks: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    // Mock data
    setTasks([
      {
        id: 'task-1',
        name: 'Daily Executive Report',
        description: 'Generate and email daily executive summary',
        task_type: 'generate_report',
        schedule_type: 'recurring',
        cron_expression: '0 9 * * *',
        cron_description: 'Every day at 9:00 AM',
        is_active: true,
        next_run_at: new Date(Date.now() + 12 * 60 * 60000).toISOString(),
        last_run_at: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
        last_run_status: 'completed',
        total_runs: 156,
        successful_runs: 152,
        failed_runs: 4,
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60000).toISOString(),
      },
      {
        id: 'task-2',
        name: 'Weekly OKR Reminder',
        description: 'Send OKR update reminders to all team members',
        task_type: 'send_notification',
        schedule_type: 'recurring',
        cron_expression: '0 10 * * 1',
        cron_description: 'Every Monday at 10:00 AM',
        is_active: true,
        next_run_at: new Date(Date.now() + 3 * 24 * 60 * 60000).toISOString(),
        last_run_at: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
        last_run_status: 'completed',
        total_runs: 24,
        successful_runs: 24,
        failed_runs: 0,
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60000).toISOString(),
      },
      {
        id: 'task-3',
        name: 'Monthly Board Report',
        description: 'Compile and send monthly board report package',
        task_type: 'generate_report',
        schedule_type: 'recurring',
        cron_expression: '0 8 1 * *',
        cron_description: 'First day of every month at 8:00 AM',
        is_active: true,
        next_run_at: new Date(Date.now() + 7 * 24 * 60 * 60000).toISOString(),
        last_run_at: new Date(Date.now() - 23 * 24 * 60 * 60000).toISOString(),
        last_run_status: 'completed',
        total_runs: 6,
        successful_runs: 6,
        failed_runs: 0,
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60000).toISOString(),
      },
      {
        id: 'task-4',
        name: 'Data Backup',
        description: 'Backup all organization data to cloud storage',
        task_type: 'backup',
        schedule_type: 'recurring',
        cron_expression: '0 2 * * *',
        cron_description: 'Every day at 2:00 AM',
        is_active: true,
        next_run_at: new Date(Date.now() + 6 * 60 * 60000).toISOString(),
        last_run_at: new Date(Date.now() - 18 * 60 * 60000).toISOString(),
        last_run_status: 'completed',
        total_runs: 365,
        successful_runs: 363,
        failed_runs: 2,
        created_at: new Date(Date.now() - 365 * 24 * 60 * 60000).toISOString(),
      },
      {
        id: 'task-5',
        name: 'Q4 Planning Review',
        description: 'One-time reminder for Q4 planning session',
        task_type: 'send_notification',
        schedule_type: 'once',
        scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60000).toISOString(),
        is_active: true,
        next_run_at: new Date(Date.now() + 5 * 24 * 60 * 60000).toISOString(),
        last_run_at: undefined,
        total_runs: 0,
        successful_runs: 0,
        failed_runs: 0,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
      },
      {
        id: 'task-6',
        name: 'Quarterly Analytics Export',
        description: 'Export quarterly analytics data to spreadsheet',
        task_type: 'export_data',
        schedule_type: 'recurring',
        cron_expression: '0 6 1 1,4,7,10 *',
        cron_description: 'First day of each quarter at 6:00 AM',
        is_active: false,
        next_run_at: undefined,
        last_run_at: new Date(Date.now() - 60 * 24 * 60 * 60000).toISOString(),
        last_run_status: 'failed',
        total_runs: 4,
        successful_runs: 3,
        failed_runs: 1,
        created_at: new Date(Date.now() - 365 * 24 * 60 * 60000).toISOString(),
      },
    ]);
    setLoading(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'active') return t.is_active;
    return !t.is_active;
  });

  const toggleTaskStatus = async (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, is_active: !t.is_active } : t))
    );
  };

  const deleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const runTaskNow = async (taskId: string) => {
    alert(`Running task ${taskId} now...`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const absDiff = Math.abs(diff);
    const hours = Math.floor(absDiff / 3600000);
    const days = Math.floor(absDiff / 86400000);

    if (diff > 0) {
      // Future
      if (hours < 1) return 'In less than 1 hour';
      if (hours < 24) return `In ${hours} hours`;
      return `In ${days} days`;
    } else {
      // Past
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      generate_report: 'Report Generation',
      send_notification: 'Notification',
      send_email: 'Email',
      backup: 'Backup',
      export_data: 'Data Export',
      sync_data: 'Data Sync',
    };
    return labels[type] || type;
  };

  const getTaskTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      generate_report: 'bg-blue-100 text-blue-800',
      send_notification: 'bg-purple-100 text-purple-800',
      send_email: 'bg-green-100 text-green-800',
      backup: 'bg-orange-100 text-orange-800',
      export_data: 'bg-cyan-100 text-cyan-800',
      sync_data: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Tasks</h1>
            <p className="text-gray-500">Manage recurring and one-time scheduled tasks</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {tasks.filter(t => t.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Paused</p>
          <p className="text-2xl font-bold text-yellow-600">
            {tasks.filter(t => !t.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Executions</p>
          <p className="text-2xl font-bold text-gray-900">
            {tasks.reduce((sum, t) => sum + t.total_runs, 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'active', 'paused'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-gray-500">Create your first scheduled task</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Task</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Schedule</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Next Run</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Last Run</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stats</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{task.name}</p>
                        {task.description && (
                          <p className="text-xs text-gray-500">{task.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskTypeColor(
                        task.task_type
                      )}`}
                    >
                      {getTaskTypeLabel(task.task_type)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      {task.schedule_type === 'recurring' ? (
                        <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                      )}
                      <span>{task.cron_description || formatDate(task.scheduled_at)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {task.is_active ? formatRelativeTime(task.next_run_at) : 'Paused'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {task.last_run_status === 'completed' ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : task.last_run_status === 'failed' ? (
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                      ) : null}
                      <span className="text-sm text-gray-600">
                        {formatRelativeTime(task.last_run_at)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <span className="text-green-600">{task.successful_runs}</span>
                      <span className="text-gray-400"> / </span>
                      <span className="text-red-600">{task.failed_runs}</span>
                      <span className="text-gray-400 text-xs ml-1">
                        ({task.total_runs} total)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => runTaskNow(task.id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Run now"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`p-2 rounded-lg ${
                          task.is_active
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={task.is_active ? 'Pause' : 'Activate'}
                      >
                        {task.is_active ? (
                          <PauseIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-lg w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Create Scheduled Task</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                <input
                  type="text"
                  placeholder="Enter task name"
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Enter task description"
                  rows={2}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                <select className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="generate_report">Report Generation</option>
                  <option value="send_notification">Send Notification</option>
                  <option value="send_email">Send Email</option>
                  <option value="backup">Backup</option>
                  <option value="export_data">Data Export</option>
                  <option value="sync_data">Data Sync</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="schedule_type" value="recurring" defaultChecked />
                    <span>Recurring</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="schedule_type" value="once" />
                    <span>One-time</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule (Cron Expression)
                </label>
                <input
                  type="text"
                  placeholder="0 9 * * *"
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: 0 9 * * * (Every day at 9:00 AM)
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledTasks;
