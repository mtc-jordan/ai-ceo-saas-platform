import { useState } from 'react';

interface BriefingSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  metrics?: { label: string; value: string; change: string; trend: 'up' | 'down' }[];
  items?: { text: string; priority?: 'high' | 'medium' | 'low'; status?: string }[];
}

interface ExecutiveBriefingProps {
  onClose?: () => void;
  onExport?: (format: 'pdf' | 'email' | 'slack') => void;
}

export default function ExecutiveBriefing({ onClose, onExport }: ExecutiveBriefingProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'email' | 'slack' | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [scheduleDays, setScheduleDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [isPlaying, setIsPlaying] = useState(false);

  const briefingDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const briefingSections: BriefingSection[] = [
    {
      id: 'summary',
      title: 'Executive Summary',
      icon: '📋',
      content: `Good morning! Here's your business intelligence briefing for ${briefingDate}.\n\nOverall, your business is performing strongly with revenue up 12.5% month-over-month. Customer satisfaction remains high at 94.5%, and your NPS score has improved to 72. There are 3 high-priority items requiring your attention today, and 2 significant opportunities identified by our AI analysis.`,
    },
    {
      id: 'metrics',
      title: 'Key Performance Metrics',
      icon: '📊',
      content: 'Your core business metrics are tracking positively against targets.',
      metrics: [
        { label: 'Monthly Revenue', value: '$2.4M', change: '+12.5%', trend: 'up' },
        { label: 'Active Customers', value: '1,247', change: '+8.3%', trend: 'up' },
        { label: 'Customer Satisfaction', value: '94.5%', change: '-0.5%', trend: 'down' },
        { label: 'Net Promoter Score', value: '72', change: '+5', trend: 'up' },
        { label: 'Churn Rate', value: '2.1%', change: '-0.3%', trend: 'up' },
        { label: 'OEE Score', value: '87.2%', change: '+3.1%', trend: 'up' },
      ]
    },
    {
      id: 'priorities',
      title: 'Today\'s Priorities',
      icon: '🎯',
      content: 'Focus areas requiring your attention today.',
      items: [
        { text: 'Review and approve Q4 budget proposal', priority: 'high', status: 'Due today' },
        { text: 'Board meeting preparation - finalize presentation', priority: 'high', status: 'Due Dec 30' },
        { text: 'Sign off on marketing campaign for Q1 launch', priority: 'medium', status: 'Due tomorrow' },
        { text: 'Review enterprise customer renewal proposals', priority: 'medium', status: 'Due this week' },
        { text: 'Team performance reviews - 3 pending', priority: 'low', status: 'Due Jan 5' },
      ]
    },
    {
      id: 'opportunities',
      title: 'AI-Identified Opportunities',
      icon: '💡',
      content: 'Strategic opportunities detected by Nova AI analysis.',
      items: [
        { text: 'European market expansion could increase revenue by 23% - market conditions favorable', priority: 'high' },
        { text: 'Pricing optimization: 23% of Voyager customers show upgrade potential (+$45K/mo)', priority: 'high' },
        { text: 'Partnership opportunity with TechCorp - 78% confidence of positive outcome', priority: 'medium' },
        { text: 'AI automation implementation could reduce operational costs by 15%', priority: 'medium' },
      ]
    },
    {
      id: 'risks',
      title: 'Risk Alerts',
      icon: '⚠️',
      content: 'Potential risks requiring monitoring or action.',
      items: [
        { text: '3 enterprise customers showing disengagement signals - combined ARR at risk: $180K', priority: 'high' },
        { text: 'Competitor launching similar product in February - prepare differentiation strategy', priority: 'high' },
        { text: 'Supply chain delays may impact Q1 deliveries - 45% probability', priority: 'medium' },
      ]
    },
    {
      id: 'insights',
      title: 'AI Insights & Predictions',
      icon: '🔮',
      content: 'Forward-looking analysis and predictions.',
      items: [
        { text: 'Q1 2025 revenue projected to increase 18% based on current pipeline and trends' },
        { text: 'Customer acquisition cost trending down - 12% improvement expected by Q2' },
        { text: 'Mobile app usage growing 28% MoM - consider prioritizing mobile-first features' },
        { text: 'Support ticket volume expected to spike after January release - recommend staffing adjustment' },
      ]
    }
  ];

  const handleExport = async (format: 'pdf' | 'email' | 'slack') => {
    setIsExporting(true);
    setExportFormat(format);
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsExporting(false);
    setExportFormat(null);
    onExport?.(format);
  };

  const handlePlayBriefing = () => {
    setIsPlaying(!isPlaying);
    // In production, this would use text-to-speech API
  };

  const toggleScheduleDay = (day: string) => {
    setScheduleDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 p-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-3">
              <span className="text-3xl">✨</span>
              <span>Executive Briefing</span>
            </h1>
            <p className="text-slate-400 mt-1">{briefingDate}</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Voice Briefing */}
            <button
              onClick={handlePlayBriefing}
              className={`p-2.5 rounded-xl transition-all ${
                isPlaying 
                  ? 'bg-indigo-500 text-white animate-pulse' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
              title={isPlaying ? 'Stop' : 'Listen to briefing'}
            >
              {isPlaying ? '⏹️' : '🔊'}
            </button>
            
            {/* Schedule */}
            <button
              onClick={() => setShowScheduleModal(true)}
              className="p-2.5 bg-slate-800/80 text-slate-400 hover:text-white rounded-xl transition-all"
              title="Schedule briefings"
            >
              📅
            </button>
            
            {/* Export Options */}
            <div className="relative group">
              <button className="p-2.5 bg-slate-800/80 text-slate-400 hover:text-white rounded-xl transition-all">
                📤
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-700 rounded-t-xl flex items-center space-x-2"
                >
                  <span>📄</span>
                  <span>Export as PDF</span>
                </button>
                <button
                  onClick={() => handleExport('email')}
                  disabled={isExporting}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-700 flex items-center space-x-2"
                >
                  <span>📧</span>
                  <span>Send via Email</span>
                </button>
                <button
                  onClick={() => handleExport('slack')}
                  disabled={isExporting}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-700 rounded-b-xl flex items-center space-x-2"
                >
                  <span>💬</span>
                  <span>Share to Slack</span>
                </button>
              </div>
            </div>
            
            {/* Close */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2.5 bg-slate-800/80 text-slate-400 hover:text-white rounded-xl transition-all"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-xl flex items-center space-x-3">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            <span className="text-sm">
              {exportFormat === 'pdf' && 'Generating PDF...'}
              {exportFormat === 'email' && 'Sending email...'}
              {exportFormat === 'slack' && 'Sharing to Slack...'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
        {briefingSections.map((section) => (
          <div key={section.id} className="bg-slate-800/30 rounded-xl p-5 border border-slate-800/50">
            <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </h2>
            
            <p className="text-slate-300 text-sm mb-4 whitespace-pre-line">{section.content}</p>
            
            {/* Metrics Grid */}
            {section.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {section.metrics.map((metric, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">{metric.label}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{metric.value}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        metric.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Items List */}
            {section.items && (
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg flex items-start justify-between ${
                      item.priority === 'high' ? 'bg-red-500/10 border border-red-500/20' :
                      item.priority === 'medium' ? 'bg-amber-500/10 border border-amber-500/20' :
                      item.priority === 'low' ? 'bg-slate-500/10 border border-slate-500/20' :
                      'bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className={`mt-0.5 ${
                        item.priority === 'high' ? 'text-red-400' :
                        item.priority === 'medium' ? 'text-amber-400' :
                        item.priority === 'low' ? 'text-slate-400' :
                        'text-cyan-400'
                      }`}>
                        {item.priority === 'high' ? '🔴' :
                         item.priority === 'medium' ? '🟡' :
                         item.priority === 'low' ? '⚪' : '💡'}
                      </span>
                      <span className="text-sm text-slate-300">{item.text}</span>
                    </div>
                    {item.status && (
                      <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{item.status}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Generated by Nova AI • Last updated: {new Date().toLocaleTimeString()}
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
            Regenerate
          </button>
          <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors">
            Take Action
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <span>📅</span>
              <span>Schedule Briefings</span>
            </h3>
            
            <div className="space-y-4">
              {/* Time Selection */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Delivery Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                />
              </div>
              
              {/* Day Selection */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Days</label>
                <div className="flex space-x-2">
                  {[
                    { id: 'mon', label: 'M' },
                    { id: 'tue', label: 'T' },
                    { id: 'wed', label: 'W' },
                    { id: 'thu', label: 'T' },
                    { id: 'fri', label: 'F' },
                    { id: 'sat', label: 'S' },
                    { id: 'sun', label: 'S' },
                  ].map(day => (
                    <button
                      key={day.id}
                      onClick={() => toggleScheduleDay(day.id)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        scheduleDays.includes(day.id)
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Delivery Method */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Delivery Method</label>
                <div className="space-y-2">
                  {[
                    { id: 'email', label: 'Email', icon: '📧' },
                    { id: 'slack', label: 'Slack', icon: '💬' },
                    { id: 'push', label: 'Push Notification', icon: '🔔' },
                  ].map(method => (
                    <label key={method.id} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800">
                      <input type="checkbox" className="rounded" defaultChecked={method.id === 'email'} />
                      <span>{method.icon}</span>
                      <span className="text-sm">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
