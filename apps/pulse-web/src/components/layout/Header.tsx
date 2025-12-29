import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlobalSearch from '../GlobalSearch';
import { useAuthStore } from '../../store/authStore';

// Enhanced Header with Modern Design
export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials
  const getUserInitials = () => {
    if (user?.full_name) {
      const names = user.full_name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const notifications = [
    { id: 1, type: 'action', title: 'Action item due tomorrow', message: 'Review Q4 budget proposal', time: '5 min ago', unread: true },
    { id: 2, type: 'meeting', title: 'Meeting starting soon', message: 'Board Meeting in 30 minutes', time: '25 min ago', unread: true },
    { id: 3, type: 'report', title: 'Report generated', message: 'Weekly Executive Summary is ready', time: '1 hour ago', unread: false },
    { id: 4, type: 'alert', title: 'Revenue anomaly detected', message: 'Unusual spike in Q4 projections', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const quickActions = [
    { label: 'New Meeting', icon: '📅', action: () => navigate('/app/meetings/new') },
    { label: 'Create Report', icon: '📊', action: () => navigate('/app/reports/generate') },
    { label: 'Ask AI', icon: '🤖', action: () => navigate('/app/pulse/ask') },
    { label: 'Add Goal', icon: '🎯', action: () => navigate('/app/okr/goals/new') },
  ];

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Global Search Modal */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    <header className="fixed top-0 right-0 left-64 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section - Breadcrumb & Search */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            >
              <span>🔍</span>
              <span className="text-sm">Search...</span>
              <kbd className="hidden md:inline-flex items-center px-2 py-0.5 bg-slate-700 rounded text-xs">⌘K</kbd>
            </button>

            {/* Search Modal */}
            {showSearch && (
              <div className="absolute top-full left-0 mt-2 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anything..."
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>
                <div className="p-2">
                  <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Quick Actions</p>
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        setShowSearch(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-left"
                    >
                      <span>{action.icon}</span>
                      <span className="text-sm text-slate-300">{action.label}</span>
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-800">
                  <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Recent</p>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-left">
                    <span>📊</span>
                    <span className="text-sm text-slate-300">Q4 Revenue Report</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-left">
                    <span>📅</span>
                    <span className="text-sm text-slate-300">Board Meeting Notes</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-3">
          {/* Quick Add */}
          <button className="p-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white transition-colors">
            <span className="text-lg">+</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer ${
                        notification.unread ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 mt-2 rounded-full ${notification.unread ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/app/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="block p-3 text-center text-sm text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/50"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          {/* Help */}
          <button className="p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all">
            <span className="text-lg">❓</span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-2 p-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">{getUserInitials()}</span>
              </div>
              <span className="text-slate-400 text-sm">▼</span>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">{getUserInitials()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{user?.full_name || 'User'}</p>
                      <p className="text-sm text-slate-400">{user?.email || 'user@example.com'}</p>
                      {user?.is_platform_admin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link 
                    to="/app/settings" 
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800"
                  >
                    <span>👤</span>
                    <span className="text-sm text-slate-300">Profile Settings</span>
                  </Link>
                  <Link 
                    to="/app/billing" 
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800"
                  >
                    <span>💳</span>
                    <span className="text-sm text-slate-300">Billing</span>
                  </Link>
                  <Link 
                    to="/app/settings" 
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800"
                  >
                    <span>⚙️</span>
                    <span className="text-sm text-slate-300">Preferences</span>
                  </Link>
                  {user?.is_platform_admin && (
                    <Link 
                      to="/super-admin" 
                      onClick={() => setShowProfile(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-purple-400"
                    >
                      <span>🛡️</span>
                      <span className="text-sm">Super Admin</span>
                    </Link>
                  )}
                </div>
                <div className="p-2 border-t border-slate-800">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400"
                  >
                    <span>🚪</span>
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showSearch || showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setShowSearch(false);
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
    </>
  );
}
