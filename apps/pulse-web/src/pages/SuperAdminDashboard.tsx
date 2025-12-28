import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Enhanced Super Admin Dashboard for AI CEO SaaS Platform - Owner/Admin View
export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Comprehensive stats for owner dashboard
  const stats = {
    totalUsers: 12847,
    activeUsers: 8432,
    totalOrganizations: 1893,
    totalRevenue: 1847293.50,
    mrr: 154847.25,
    arr: 1858167.00,
    newUsersToday: 127,
    newUsersThisWeek: 892,
    activeSubscriptions: 1247,
    trialUsers: 342,
    churnRate: 2.3,
    conversionRate: 24.5,
    avgRevenuePerUser: 124.50,
    lifetimeValue: 2847.00
  };

  const recentUsers = [
    { id: 1, name: 'John Smith', email: 'john@techcorp.com', organization: 'TechCorp Inc.', plan: 'Enterprise', status: 'active', joined: '2024-12-27', revenue: 999, lastActive: '2 min ago' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@startup.io', organization: 'Startup.io', plan: 'Professional', status: 'active', joined: '2024-12-26', revenue: 299, lastActive: '15 min ago' },
    { id: 3, name: 'Michael Chen', email: 'mchen@enterprise.com', organization: 'Enterprise Co', plan: 'Enterprise', status: 'active', joined: '2024-12-25', revenue: 999, lastActive: '1 hour ago' },
    { id: 4, name: 'Emily Davis', email: 'emily@growth.co', organization: 'Growth Co', plan: 'Professional', status: 'trial', joined: '2024-12-24', revenue: 0, lastActive: '3 hours ago' },
    { id: 5, name: 'Robert Wilson', email: 'rwilson@corp.net', organization: 'Corp Net', plan: 'Starter', status: 'churned', joined: '2024-12-20', revenue: 99, lastActive: '5 days ago' },
    { id: 6, name: 'Lisa Anderson', email: 'lisa@innovate.tech', organization: 'Innovate Tech', plan: 'Professional', status: 'active', joined: '2024-12-23', revenue: 299, lastActive: '30 min ago' },
    { id: 7, name: 'David Kim', email: 'david@scale.io', organization: 'Scale.io', plan: 'Enterprise', status: 'active', joined: '2024-12-22', revenue: 999, lastActive: '45 min ago' },
    { id: 8, name: 'Jennifer Lee', email: 'jen@future.co', organization: 'Future Co', plan: 'Starter', status: 'trial', joined: '2024-12-28', revenue: 0, lastActive: 'Just now' },
  ];

  const organizations = [
    { id: 1, name: 'TechCorp Inc.', users: 45, plan: 'Enterprise', status: 'active', mrr: 4995, created: '2024-06-15' },
    { id: 2, name: 'Startup.io', users: 12, plan: 'Professional', status: 'active', mrr: 1495, created: '2024-08-22' },
    { id: 3, name: 'Enterprise Co', users: 78, plan: 'Enterprise', status: 'active', mrr: 7995, created: '2024-03-10' },
    { id: 4, name: 'Growth Co', users: 8, plan: 'Professional', status: 'trial', mrr: 0, created: '2024-12-20' },
    { id: 5, name: 'Scale.io', users: 34, plan: 'Enterprise', status: 'active', mrr: 3495, created: '2024-07-05' },
  ];

  const subscriptionPlans = [
    { name: 'Starter', monthlyPrice: 99, annualPrice: 79, users: 523, revenue: 51777, features: ['Up to 10 users', 'Basic Analytics', 'Email Support'] },
    { name: 'Professional', monthlyPrice: 299, annualPrice: 249, users: 612, revenue: 183000, features: ['Up to 50 users', 'Advanced Analytics', 'Priority Support', 'AI Features'] },
    { name: 'Enterprise', monthlyPrice: 999, annualPrice: 799, users: 112, revenue: 111888, features: ['Unlimited users', 'Custom Integrations', 'Dedicated Support', 'SLA'] },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 98000, users: 5200 },
    { month: 'Feb', revenue: 105000, users: 5800 },
    { month: 'Mar', revenue: 112000, users: 6400 },
    { month: 'Apr', revenue: 118000, users: 7100 },
    { month: 'May', revenue: 125000, users: 7800 },
    { month: 'Jun', revenue: 132000, users: 8500 },
    { month: 'Jul', revenue: 138000, users: 9200 },
    { month: 'Aug', revenue: 141000, users: 9800 },
    { month: 'Sep', revenue: 145000, users: 10500 },
    { month: 'Oct', revenue: 148000, users: 11200 },
    { month: 'Nov', revenue: 152000, users: 12000 },
    { month: 'Dec', revenue: 154847, users: 12847 },
  ];

  const systemHealth = {
    apiUptime: 99.98,
    avgResponseTime: 142,
    errorRate: 0.02,
    activeConnections: 1847,
    cpuUsage: 34,
    memoryUsage: 62,
    storageUsage: 48,
    dbConnections: 245,
    cacheHitRate: 94.5,
    queuedJobs: 12
  };

  const recentTransactions = [
    { id: 'txn_001', user: 'john@techcorp.com', amount: 999, type: 'subscription', status: 'completed', date: '2024-12-28 14:32' },
    { id: 'txn_002', user: 'sarah@startup.io', amount: 299, type: 'upgrade', status: 'completed', date: '2024-12-28 13:15' },
    { id: 'txn_003', user: 'mchen@enterprise.com', amount: 999, type: 'renewal', status: 'completed', date: '2024-12-28 11:45' },
    { id: 'txn_004', user: 'old@user.com', amount: -99, type: 'refund', status: 'processed', date: '2024-12-28 10:20' },
    { id: 'txn_005', user: 'new@customer.io', amount: 299, type: 'subscription', status: 'pending', date: '2024-12-28 09:55' },
  ];

  const auditLogs = [
    { action: 'User Created', user: 'admin@aiceo.com', target: 'jennifer@future.co', timestamp: '2024-12-28 14:45', ip: '192.168.1.100' },
    { action: 'Plan Changed', user: 'sarah@startup.io', target: 'Professional → Enterprise', timestamp: '2024-12-28 13:20', ip: '10.0.0.45' },
    { action: 'Login Success', user: 'john@techcorp.com', target: '-', timestamp: '2024-12-28 12:30', ip: '172.16.0.22' },
    { action: 'Password Reset', user: 'emily@growth.co', target: '-', timestamp: '2024-12-28 11:15', ip: '192.168.2.55' },
    { action: 'API Key Generated', user: 'admin@aiceo.com', target: 'TechCorp Inc.', timestamp: '2024-12-28 10:00', ip: '192.168.1.100' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'organizations', label: 'Organizations', icon: '🏢' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '💳' },
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'transactions', label: 'Transactions', icon: '📋' },
    { id: 'system', label: 'System', icon: '⚡' },
    { id: 'audit', label: 'Audit Logs', icon: '📝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold">AI</span>
                </div>
                <span className="text-xl font-bold">AI CEO</span>
              </Link>
              <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full">SUPER ADMIN</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users, orgs, transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
                <svg className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors relative">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">5</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                  SA
                </div>
                <span className="text-sm font-medium">Super Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: '+12.5%', positive: true, icon: '👥', color: 'from-blue-500 to-cyan-500' },
                { label: 'Active Users', value: stats.activeUsers.toLocaleString(), change: '+8.2%', positive: true, icon: '✅', color: 'from-green-500 to-emerald-500' },
                { label: 'MRR', value: `$${(stats.mrr / 1000).toFixed(1)}k`, change: '+15.3%', positive: true, icon: '💰', color: 'from-purple-500 to-pink-500' },
                { label: 'ARR', value: `$${(stats.arr / 1000000).toFixed(2)}M`, change: '+18.7%', positive: true, icon: '📈', color: 'from-orange-500 to-red-500' },
                { label: 'Churn Rate', value: `${stats.churnRate}%`, change: '-0.3%', positive: true, icon: '📉', color: 'from-teal-500 to-cyan-500' },
                { label: 'Conversion', value: `${stats.conversionRate}%`, change: '+2.1%', positive: true, icon: '🎯', color: 'from-indigo-500 to-purple-500' },
              ].map((metric, index) => (
                <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center text-sm`}>
                      {metric.icon}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      metric.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{metric.label}</p>
                  <p className="text-xl font-bold mt-0.5">{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Revenue & User Growth</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="12m">Last 12 months</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-end justify-between h-56 gap-1">
                  {revenueData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="w-full relative">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t opacity-80 group-hover:opacity-100 transition-opacity"
                          style={{ height: `${(item.revenue / 160000) * 180}px` }}
                        ></div>
                        <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 p-2 rounded text-xs text-center">
                          <p className="text-white font-medium">${(item.revenue / 1000).toFixed(0)}k</p>
                          <p className="text-slate-400">{item.users.toLocaleString()} users</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 mt-2">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Today's Highlights</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">👤</div>
                      <div>
                        <p className="text-sm font-medium">New Signups</p>
                        <p className="text-xs text-slate-400">Today</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-green-400">+{stats.newUsersToday}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">💳</div>
                      <div>
                        <p className="text-sm font-medium">New Subscriptions</p>
                        <p className="text-xs text-slate-400">Today</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-purple-400">+23</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">⬆️</div>
                      <div>
                        <p className="text-sm font-medium">Upgrades</p>
                        <p className="text-xs text-slate-400">Today</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-blue-400">+8</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">💵</div>
                      <div>
                        <p className="text-sm font-medium">Revenue Today</p>
                        <p className="text-xs text-slate-400">Processed</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-orange-400">$4,892</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Users */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Transactions</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-indigo-400 text-sm hover:text-indigo-300">View All</button>
                </div>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 4).map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          txn.type === 'refund' ? 'bg-red-500/20 text-red-400' :
                          txn.type === 'upgrade' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {txn.type === 'refund' ? '↩️' : txn.type === 'upgrade' ? '⬆️' : '💳'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{txn.user}</p>
                          <p className="text-xs text-slate-500">{txn.type} • {txn.date}</p>
                        </div>
                      </div>
                      <span className={`font-semibold ${txn.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Users</h3>
                  <button onClick={() => setActiveTab('users')} className="text-indigo-400 text-sm hover:text-indigo-300">View All</button>
                </div>
                <div className="space-y-3">
                  {recentUsers.slice(0, 4).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.organization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          user.status === 'trial' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {user.status}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{user.lastActive}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold mt-1">{stats.activeUsers.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Trial Users</p>
                <p className="text-2xl font-bold mt-1">{stats.trialUsers}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">New This Week</p>
                <p className="text-2xl font-bold mt-1 text-green-400">+{stats.newUsersThisWeek}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Conversion Rate</p>
                <p className="text-2xl font-bold mt-1">{stats.conversionRate}%</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-64 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
                <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm">
                  <option>All Plans</option>
                  <option>Starter</option>
                  <option>Professional</option>
                  <option>Enterprise</option>
                </select>
                <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Trial</option>
                  <option>Churned</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 flex items-center gap-2">
                  <span>📥</span> Export CSV
                </button>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-sm hover:from-indigo-600 hover:to-purple-700 flex items-center gap-2"
                >
                  <span>➕</span> Add User
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">User</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Organization</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Plan</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Revenue</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Last Active</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{user.organization}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-400' :
                            user.plan === 'Professional' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            user.status === 'trial' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">${user.revenue}/mo</td>
                        <td className="px-6 py-4 text-slate-400">{user.lastActive}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="More">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                <p className="text-sm text-slate-400">Showing 1-8 of {stats.totalUsers.toLocaleString()} users</p>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">Previous</button>
                  <button className="px-3 py-1 bg-indigo-500 rounded-lg text-sm">1</button>
                  <button className="px-3 py-1 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">2</button>
                  <button className="px-3 py-1 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">3</button>
                  <button className="px-3 py-1 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Total Organizations</p>
                <p className="text-2xl font-bold mt-1">{stats.totalOrganizations.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Enterprise Orgs</p>
                <p className="text-2xl font-bold mt-1">112</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Avg Users/Org</p>
                <p className="text-2xl font-bold mt-1">6.8</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Avg MRR/Org</p>
                <p className="text-2xl font-bold mt-1">$124</p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Organization</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Users</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Plan</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">MRR</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Created</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-sm font-semibold">
                            {org.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium">{org.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{org.users}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          org.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-400' :
                          org.plan === 'Professional' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          org.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">${org.mrr.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-400">{org.created}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan, index) => (
                <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <button 
                      onClick={() => setShowSubscriptionModal(true)}
                      className="text-indigo-400 text-sm hover:text-indigo-300"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${plan.monthlyPrice}</span>
                    <span className="text-slate-400">/month</span>
                    <p className="text-sm text-slate-500 mt-1">or ${plan.annualPrice}/month billed annually</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Users</span>
                      <span className="font-medium">{plan.users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Revenue</span>
                      <span className="font-medium">${plan.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-sm text-slate-400 mb-2">Features:</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">${(stats.totalRevenue / 1000000).toFixed(2)}M</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">MRR</p>
                <p className="text-2xl font-bold mt-1">${(stats.mrr / 1000).toFixed(1)}k</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">ARR</p>
                <p className="text-2xl font-bold mt-1">${(stats.arr / 1000000).toFixed(2)}M</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">ARPU</p>
                <p className="text-2xl font-bold mt-1">${stats.avgRevenuePerUser.toFixed(0)}</p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Revenue Over Time</h3>
              <div className="h-72 flex items-end justify-between gap-2">
                {revenueData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t group-hover:from-green-400 group-hover:to-emerald-300 transition-all"
                      style={{ height: `${(item.revenue / 160000) * 250}px` }}
                    ></div>
                    <span className="text-xs text-slate-500 mt-2">{item.month}</span>
                    <span className="text-xs text-slate-400">${(item.revenue / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700">
                Export Transactions
              </button>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Transaction ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">User</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Type</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-mono text-sm">{txn.id}</td>
                      <td className="px-6 py-4">{txn.user}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          txn.type === 'refund' ? 'bg-red-500/20 text-red-400' :
                          txn.type === 'upgrade' ? 'bg-purple-500/20 text-purple-400' :
                          txn.type === 'renewal' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-semibold ${txn.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          txn.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{txn.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">API Uptime</p>
                <p className="text-2xl font-bold mt-1 text-green-400">{systemHealth.apiUptime}%</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Avg Response</p>
                <p className="text-2xl font-bold mt-1">{systemHealth.avgResponseTime}ms</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Error Rate</p>
                <p className="text-2xl font-bold mt-1 text-green-400">{systemHealth.errorRate}%</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Connections</p>
                <p className="text-2xl font-bold mt-1">{systemHealth.activeConnections}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Cache Hit Rate</p>
                <p className="text-2xl font-bold mt-1">{systemHealth.cacheHitRate}%</p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Resource Usage</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { label: 'CPU Usage', value: systemHealth.cpuUsage, color: 'bg-blue-500' },
                  { label: 'Memory Usage', value: systemHealth.memoryUsage, color: 'bg-purple-500' },
                  { label: 'Storage Usage', value: systemHealth.storageUsage, color: 'bg-green-500' },
                ].map((resource, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{resource.label}</span>
                      <span className="text-sm font-medium">{resource.value}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${resource.color} rounded-full transition-all`}
                        style={{ width: `${resource.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Audit Logs</h3>
              <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700">
                Export Logs
              </button>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Action</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">User</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Target</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">IP Address</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.action.includes('Created') ? 'bg-green-500/20 text-green-400' :
                          log.action.includes('Changed') ? 'bg-purple-500/20 text-purple-400' :
                          log.action.includes('Login') ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">{log.user}</td>
                      <td className="px-6 py-4 text-slate-400">{log.target}</td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-400">{log.ip}</td>
                      <td className="px-6 py-4 text-slate-400">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Platform Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Maintenance Mode', desc: 'Temporarily disable access for all users', enabled: false },
                  { label: 'New User Registration', desc: 'Allow new users to sign up', enabled: true },
                  { label: 'Email Notifications', desc: 'Send email notifications for important events', enabled: true },
                  { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin users', enabled: true },
                  { label: 'API Rate Limiting', desc: 'Limit API requests per user', enabled: true },
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-slate-400">{setting.desc}</p>
                    </div>
                    <button className={`w-12 h-6 rounded-full relative transition-colors ${
                      setting.enabled ? 'bg-indigo-500' : 'bg-slate-700'
                    }`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        setting.enabled ? 'right-1' : 'left-1'
                      }`}></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Stripe Integration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">💳</div>
                    <div>
                      <p className="font-medium">Stripe Connected</p>
                      <p className="text-sm text-slate-400">Account: acct_1234567890</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Active</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <button className="py-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                    Open Stripe Dashboard
                  </button>
                  <button className="py-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                    View Webhook Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                <input type="text" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Organization</label>
                <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
                  <option>Select organization...</option>
                  <option>TechCorp Inc.</option>
                  <option>Startup.io</option>
                  <option>Enterprise Co</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Plan</label>
                <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
                  <option>Starter</option>
                  <option>Professional</option>
                  <option>Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button onClick={() => setShowAddUserModal(false)} className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700">Cancel</button>
              <button className="px-4 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600">Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
