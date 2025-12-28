import React, { useState } from 'react';
import {
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  PencilIcon,
  SparklesIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Mock data
const mockDashboard = {
  summary: {
    total_reports_generated: 47,
    reports_this_month: 12,
    active_schedules: 3,
    total_schedules: 3,
    storage_used_mb: 125.6
  },
  recent_reports: [
    { title: 'Monthly Executive Report', type: 'executive', generated_at: '2024-12-23T09:00:00Z', format: 'pdf' },
    { title: 'Weekly Sales Dashboard', type: 'sales', generated_at: '2024-12-22T07:00:00Z', format: 'excel' }
  ],
  upcoming_scheduled: [
    { name: 'Weekly Executive Summary', next_run: '2024-12-30T09:00:00Z', type: 'executive' },
    { name: 'Monthly Board Report', next_run: '2025-01-01T08:00:00Z', type: 'board' }
  ]
};

const mockReportTypes = [
  { id: 'executive', name: 'Executive Summary', description: 'High-level overview of key metrics and performance', sections: ['KPIs', 'Highlights', 'Concerns', 'Recommendations'], formats: ['pdf', 'excel'] },
  { id: 'board', name: 'Board Report', description: 'Comprehensive report for board meetings', sections: ['Financial Overview', 'Strategic Initiatives', 'Risk Assessment', 'Outlook'], formats: ['pdf', 'excel', 'pptx'] },
  { id: 'sales', name: 'Sales Report', description: 'Sales performance and pipeline analysis', sections: ['Revenue', 'Pipeline', 'Win/Loss Analysis', 'Forecasts'], formats: ['pdf', 'excel'] },
  { id: 'financial', name: 'Financial Report', description: 'Detailed financial analysis and statements', sections: ['P&L', 'Cash Flow', 'Balance Sheet', 'Variance Analysis'], formats: ['pdf', 'excel'] }
];

const mockSchedules = [
  { id: 1, name: 'Weekly Executive Summary', report_type: 'executive', frequency: 'weekly', day_of_week: 1, time: '09:00', timezone: 'America/New_York', recipients: ['ceo@company.com', 'cfo@company.com'], format: ['pdf'], include_ai_insights: true, is_active: true, last_run: '2024-12-23T09:00:00Z', next_run: '2024-12-30T09:00:00Z' },
  { id: 2, name: 'Monthly Board Report', report_type: 'board', frequency: 'monthly', day_of_month: 1, time: '08:00', timezone: 'America/New_York', recipients: ['board@company.com'], format: ['pdf', 'excel'], include_ai_insights: true, is_active: true, last_run: '2024-12-01T08:00:00Z', next_run: '2025-01-01T08:00:00Z' },
  { id: 3, name: 'Daily Sales Dashboard', report_type: 'sales', frequency: 'daily', time: '07:00', timezone: 'America/New_York', recipients: ['sales-team@company.com'], format: ['excel'], include_ai_insights: false, is_active: true, last_run: '2024-12-24T07:00:00Z', next_run: '2024-12-25T07:00:00Z' }
];

const mockHistory = [
  { id: 1, report_type: 'executive', title: 'Monthly Executive Report - December 2024', format: 'pdf', filename: 'executive_report_20241223.pdf', size: 245678, generated_by: 'John Smith', generated_at: '2024-12-23T09:00:00Z', status: 'completed' },
  { id: 2, report_type: 'board', title: 'Q4 2024 Board Report', format: 'pdf', filename: 'board_report_20241220.pdf', size: 567890, generated_by: 'Sarah Johnson', generated_at: '2024-12-20T08:00:00Z', status: 'completed' },
  { id: 3, report_type: 'sales', title: 'Weekly Sales Report', format: 'excel', filename: 'sales_report_20241222.xlsx', size: 123456, generated_by: 'System (Scheduled)', generated_at: '2024-12-22T07:00:00Z', status: 'completed' },
  { id: 4, report_type: 'financial', title: 'November Financial Report', format: 'pdf', filename: 'financial_report_20241201.pdf', size: 456789, generated_by: 'Mike Chen', generated_at: '2024-12-01T10:00:00Z', status: 'completed' }
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFrequencyLabel = (schedule: any) => {
  switch (schedule.frequency) {
    case 'daily': return `Daily at ${schedule.time}`;
    case 'weekly': return `Weekly on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.day_of_week]} at ${schedule.time}`;
    case 'monthly': return `Monthly on day ${schedule.day_of_month} at ${schedule.time}`;
    default: return schedule.frequency;
  }
};

export default function ExecutiveReports() {
  const [activeTab, setActiveTab] = useState<'generate' | 'schedules' | 'history'>('generate');
  const [selectedReportType, setSelectedReportType] = useState('executive');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  const tabs = [
    { id: 'generate', name: 'Generate Report', icon: DocumentTextIcon },
    { id: 'schedules', name: 'Scheduled Reports', icon: CalendarIcon },
    { id: 'history', name: 'Report History', icon: ClockIcon }
  ];

  const handleGenerateReport = async () => {
    setGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false);
      alert('Report generated successfully!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Executive Reporting</h1>
            <p className="text-gray-600 mt-1">Generate, schedule, and manage executive reports</p>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <PlusIcon className="w-5 h-5" />
            New Schedule
          </button>
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
        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Types */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  {mockReportTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setSelectedReportType(type.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedReportType === type.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {type.formats.map((format) => (
                          <span key={format} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Configuration */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option>Current Month (December 2024)</option>
                      <option>Last Month (November 2024)</option>
                      <option>Current Quarter (Q4 2024)</option>
                      <option>Last Quarter (Q3 2024)</option>
                      <option>Year to Date (2024)</option>
                      <option>Custom Range</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="format" value="pdf" defaultChecked className="text-indigo-600" />
                        <span className="text-sm text-gray-700">PDF</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="format" value="excel" className="text-indigo-600" />
                        <span className="text-sm text-gray-700">Excel</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="format" value="both" className="text-indigo-600" />
                        <span className="text-sm text-gray-700">Both</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="ai-insights" defaultChecked className="rounded border-gray-300 text-indigo-600" />
                    <label htmlFor="ai-insights" className="text-sm text-gray-700 flex items-center gap-1">
                      <SparklesIcon className="w-4 h-4 text-indigo-600" />
                      Include AI-powered insights and recommendations
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="w-5 h-5" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Generated</span>
                    <span className="font-semibold text-gray-900">{mockDashboard.summary.total_reports_generated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">This Month</span>
                    <span className="font-semibold text-gray-900">{mockDashboard.summary.reports_this_month}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Active Schedules</span>
                    <span className="font-semibold text-gray-900">{mockDashboard.summary.active_schedules}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Storage Used</span>
                    <span className="font-semibold text-gray-900">{mockDashboard.summary.storage_used_mb} MB</span>
                  </div>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
                <div className="space-y-3">
                  {mockDashboard.recent_reports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{report.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(report.generated_at)}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded">
                        <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Scheduled */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Scheduled</h3>
                <div className="space-y-3">
                  {mockDashboard.upcoming_scheduled.map((schedule, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{schedule.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <CalendarIcon className="w-3 h-3" />
                        {formatDate(schedule.next_run)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h3>
            <div className="space-y-4">
              {mockSchedules.map((schedule) => (
                <div key={schedule.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${schedule.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{schedule.name}</h4>
                        <p className="text-sm text-gray-500">{getFrequencyLabel(schedule)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded" title="Run Now">
                        <PlayIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded" title={schedule.is_active ? 'Pause' : 'Resume'}>
                        {schedule.is_active ? (
                          <PauseIcon className="w-4 h-4 text-gray-500" />
                        ) : (
                          <PlayIcon className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Edit">
                        <PencilIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Delete">
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Report Type:</span>
                      <span className="ml-2 text-gray-900 capitalize">{schedule.report_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Format:</span>
                      <span className="ml-2 text-gray-900 uppercase">{schedule.format.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Recipients:</span>
                      <span className="ml-2 text-gray-900">{schedule.recipients.length} people</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">
                        Last run: {schedule.last_run ? formatDate(schedule.last_run) : 'Never'}
                      </span>
                      <span className="text-gray-500">
                        Next run: {formatDate(schedule.next_run)}
                      </span>
                    </div>
                    {schedule.include_ai_insights && (
                      <span className="flex items-center gap-1 text-indigo-600">
                        <SparklesIcon className="w-4 h-4" />
                        AI Insights
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Report</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Format</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Generated By</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockHistory.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                        <span className="font-medium text-gray-900">{report.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{report.report_type}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase">{report.format}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(report.size)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.generated_by}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(report.generated_at)}</td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Report Schedule</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name</label>
                <input
                  type="text"
                  placeholder="e.g., Weekly Executive Summary"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {mockReportTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  defaultValue="09:00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients (comma-separated emails)</label>
                <input
                  type="text"
                  placeholder="email1@company.com, email2@company.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="schedule-ai" defaultChecked className="rounded border-gray-300" />
                <label htmlFor="schedule-ai" className="text-sm text-gray-700">Include AI insights</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
