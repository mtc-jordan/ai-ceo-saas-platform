import { useState } from 'react';
import { Link } from 'react-router-dom';

// Enhanced Notification Center
export default function NotificationCenter() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  // Notification statistics
  const stats = {
    total: 47,
    unread: 12,
    urgent: 3,
    today: 8
  };

  // Notifications
  const notifications = [
    {
      id: 1,
      type: 'urgent',
      category: 'alert',
      title: 'Revenue Anomaly Detected',
      message: 'Unusual drop in daily revenue detected. Down 23% compared to average.',
      time: '5 minutes ago',
      read: false,
      actionable: true,
      action: 'View Details'
    },
    {
      id: 2,
      type: 'urgent',
      category: 'meeting',
      title: 'Board Meeting Starting Soon',
      message: 'Q4 Board Review starts in 30 minutes. All materials are ready.',
      time: '30 minutes ago',
      read: false,
      actionable: true,
      action: 'Join Meeting'
    },
    {
      id: 3,
      type: 'high',
      category: 'okr',
      title: 'OKR Update Required',
      message: 'Weekly OKR progress update is due. 3 key results need attention.',
      time: '1 hour ago',
      read: false,
      actionable: true,
      action: 'Update Now'
    },
    {
      id: 4,
      type: 'medium',
      category: 'document',
      title: 'Document Shared With You',
      message: 'Sarah Johnson shared "Q4 Financial Report" with you.',
      time: '2 hours ago',
      read: true,
      actionable: true,
      action: 'View Document'
    },
    {
      id: 5,
      type: 'medium',
      category: 'workflow',
      title: 'Workflow Completed',
      message: 'Daily Executive Report has been generated and sent.',
      time: '3 hours ago',
      read: true,
      actionable: false
    },
    {
      id: 6,
      type: 'low',
      category: 'system',
      title: 'New Feature Available',
      message: 'AI Meeting Assistant now supports Microsoft Teams integration.',
      time: '1 day ago',
      read: true,
      actionable: true,
      action: 'Learn More'
    },
    {
      id: 7,
      type: 'medium',
      category: 'action_item',
      title: 'Action Item Due Tomorrow',
      message: 'Review Q1 marketing budget - assigned from Weekly Leadership Sync.',
      time: '1 day ago',
      read: true,
      actionable: true,
      action: 'View Task'
    },
    {
      id: 8,
      type: 'low',
      category: 'report',
      title: 'Weekly Report Ready',
      message: 'Your weekly executive summary is ready for review.',
      time: '2 days ago',
      read: true,
      actionable: true,
      action: 'View Report'
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alert': return '🚨';
      case 'meeting': return '📅';
      case 'okr': return '🎯';
      case 'document': return '📄';
      case 'workflow': return '⚙️';
      case 'system': return '💡';
      case 'action_item': return '✅';
      case 'report': return '📊';
      default: return '📌';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-l-red-500 bg-red-500/5';
      case 'high': return 'border-l-amber-500 bg-amber-500/5';
      case 'medium': return 'border-l-blue-500 bg-blue-500/5';
      case 'low': return 'border-l-slate-500 bg-slate-500/5';
      default: return 'border-l-slate-500';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'urgent') return n.type === 'urgent' || n.type === 'high';
    return n.category === activeFilter;
  });

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(i => i !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center space-x-3">
              <span className="text-4xl">🔔</span>
              <span>Notifications</span>
            </h1>
            <p className="text-slate-400">Stay updated on important activities and alerts</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/app/notification-preferences"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              ⚙️ Preferences
            </Link>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors">
              Mark All Read
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.unread}</p>
            <p className="text-xs text-slate-400">Unread</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.urgent}</p>
            <p className="text-xs text-slate-400">Urgent</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.today}</p>
            <p className="text-xs text-slate-400">Today</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
              { id: 'urgent', label: 'Urgent', count: notifications.filter(n => n.type === 'urgent' || n.type === 'high').length },
              { id: 'meeting', label: 'Meetings', count: notifications.filter(n => n.category === 'meeting').length },
              { id: 'okr', label: 'OKRs', count: notifications.filter(n => n.category === 'okr').length },
              { id: 'document', label: 'Documents', count: notifications.filter(n => n.category === 'document').length },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {filter.label}
                <span className="ml-2 px-1.5 py-0.5 bg-slate-700 rounded text-xs">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-4 flex items-center justify-between">
            <span className="text-sm">{selectedNotifications.length} selected</span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                Mark as Read
              </button>
              <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                Archive
              </button>
              <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Select All */}
        <div className="flex items-center space-x-3 mb-4 px-4">
          <input
            type="checkbox"
            checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-400">Select all</span>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 rounded-xl p-4 transition-all hover:bg-slate-800/50 ${getTypeColor(notification.type)} ${
                !notification.read ? 'bg-slate-900/80' : 'bg-slate-900/30'
              }`}
            >
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => toggleSelect(notification.id)}
                  className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-2xl">{getCategoryIcon(notification.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-slate-500">{notification.time}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {notification.type === 'urgent' && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Urgent</span>
                      )}
                      {notification.type === 'high' && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">High Priority</span>
                      )}
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    {notification.actionable && (
                      <button className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs font-medium transition-colors">
                        {notification.action}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔔</span>
            <h3 className="text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-slate-400">You're all caught up!</p>
          </div>
        )}

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-6">
            <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
