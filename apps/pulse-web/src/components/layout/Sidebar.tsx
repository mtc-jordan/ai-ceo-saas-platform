import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Enhanced Sidebar with Modern Design
export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['pulse', 'meetings']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navigation = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      path: '/app/dashboard',
      single: true
    },
    {
      id: 'pulse',
      label: 'Pulse AI',
      icon: '⚡',
      items: [
        { label: 'Overview', path: '/app/pulse', icon: '📊' },
        { label: 'Briefings', path: '/app/pulse/briefings', icon: '📋' },
        { label: 'Data Sources', path: '/app/pulse/data-sources', icon: '🔗' },
        { label: 'Ask AI', path: '/app/pulse/ask', icon: '🤖' },
      ]
    },
    {
      id: 'athena',
      label: 'Athena',
      icon: '🦉',
      items: [
        { label: 'Overview', path: '/app/athena', icon: '📈' },
        { label: 'Scenarios', path: '/app/athena/scenarios', icon: '🎯' },
        { label: 'Competitors', path: '/app/athena/competitors', icon: '🏢' },
        { label: 'Market Intel', path: '/app/athena/market', icon: '🌍' },
      ]
    },
    {
      id: 'governai',
      label: 'GovernAI',
      icon: '⚖️',
      items: [
        { label: 'Overview', path: '/app/governai', icon: '📊' },
        { label: 'Board Meetings', path: '/app/governai/meetings', icon: '👥' },
        { label: 'Compliance', path: '/app/governai/compliance', icon: '✅' },
        { label: 'Investments', path: '/app/governai/investments', icon: '💰' },
        { label: 'ESG', path: '/app/governai/esg', icon: '🌱' },
      ]
    },
    {
      id: 'lean',
      label: 'Lean Six Sigma',
      icon: '📐',
      items: [
        { label: 'Overview', path: '/app/lean', icon: '📊' },
        { label: 'DMAIC Projects', path: '/app/lean/dmaic', icon: '🔄' },
        { label: 'Waste Tracking', path: '/app/lean/waste', icon: '🗑️' },
        { label: 'OEE Tracking', path: '/app/lean/oee', icon: '⚙️' },
        { label: 'Kaizen Events', path: '/app/lean/kaizen', icon: '🚀' },
        { label: 'Root Cause', path: '/app/lean/rca', icon: '🔍' },
        { label: 'Analytics', path: '/app/lean/analytics', icon: '📈' },
        { label: 'Process Mapping', path: '/app/lean/process-mapping', icon: '🗺️' },
        { label: 'AI Insights', path: '/app/lean/ai-insights', icon: '🤖' },
      ]
    },
    {
      id: 'meetings',
      label: 'Meeting Assistant',
      icon: '🎙️',
      items: [
        { label: 'Dashboard', path: '/app/meetings', icon: '📊' },
        { label: 'Action Items', path: '/app/meetings/action-items', icon: '✅' },
        { label: 'Analytics', path: '/app/meetings/analytics', icon: '📈' },
        { label: 'Integrations', path: '/app/meetings/integrations', icon: '🔗' },
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: '📁',
      path: '/app/documents',
      single: true
    },
    {
      id: 'predictive',
      label: 'Predictive BI',
      icon: '🔮',
      path: '/app/predictive-bi',
      single: true
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📑',
      path: '/app/reports',
      single: true
    },
    {
      id: 'okr',
      label: 'OKRs & Goals',
      icon: '🎯',
      items: [
        { label: 'Dashboard', path: '/app/okr', icon: '📊' },
        { label: 'Alignment', path: '/app/okr/alignment', icon: '🔗' },
      ]
    },
    {
      id: 'workflows',
      label: 'Automation',
      icon: '⚡',
      items: [
        { label: 'Workflows', path: '/app/workflows', icon: '🔄' },
        { label: 'Scheduled Tasks', path: '/app/scheduled-tasks', icon: '⏰' },
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      items: [
        { label: 'Center', path: '/app/notifications', icon: '📬' },
        { label: 'Preferences', path: '/app/notification-preferences', icon: '⚙️' },
      ]
    },
  ];

  const settingsNav = [
    { label: 'Settings', path: '/app/settings', icon: '⚙️' },
    { label: 'Billing', path: '/app/billing', icon: '💳' },
    { label: 'White-Label', path: '/app/white-label', icon: '🏷️' },
    { label: 'Localization', path: '/app/localization', icon: '🌐' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800 transition-all duration-300 z-40 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <Link to="/app/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CEO Platform
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 h-[calc(100vh-180px)]">
        <div className="space-y-1">
          {navigation.map((item) => (
            <div key={item.id}>
              {item.single ? (
                <Link
                  to={item.path!}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive(item.path!)
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      item.items?.some(i => isActive(i.path))
                        ? 'bg-slate-800/50 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      {!collapsed && <span className="font-medium">{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <span className={`text-xs transition-transform ${
                        expandedSections.includes(item.id) ? 'rotate-180' : ''
                      }`}>
                        ▼
                      </span>
                    )}
                  </button>
                  {!collapsed && expandedSections.includes(item.id) && item.items && (
                    <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive(subItem.path)
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : 'text-slate-500 hover:text-white hover:bg-slate-800/30'
                          }`}
                        >
                          <span>{subItem.icon}</span>
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        {!collapsed && (
          <div className="my-4 border-t border-slate-800"></div>
        )}

        {/* Settings Section */}
        {!collapsed && (
          <div className="space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Settings
            </p>
            {settingsNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive(item.path)
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-slate-500 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-950">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-medium">JD</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">John Doe</p>
              <p className="text-xs text-slate-500 truncate">CEO • Acme Corp</p>
            </div>
          )}
          {!collapsed && (
            <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              ⚙️
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
