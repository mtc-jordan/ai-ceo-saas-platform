import { useState } from 'react';


// Enhanced Document Management with AI Analysis
export default function DocumentManagement() {
  const [activeView, setActiveView] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Document statistics
  const stats = [
    { label: 'Total Documents', value: '1,247', icon: '📁', change: '+45 this month' },
    { label: 'AI Analyzed', value: '892', icon: '🤖', change: '72% coverage' },
    { label: 'Shared', value: '156', icon: '🔗', change: 'With 24 users' },
    { label: 'Storage Used', value: '4.2 GB', icon: '💾', change: 'of 10 GB' },
  ];

  // Categories
  const categories = [
    { id: 'all', name: 'All Documents', count: 1247, icon: '📁' },
    { id: 'financial', name: 'Financial', count: 234, icon: '💰' },
    { id: 'legal', name: 'Legal', count: 156, icon: '⚖️' },
    { id: 'strategic', name: 'Strategic', count: 89, icon: '🎯' },
    { id: 'hr', name: 'HR', count: 178, icon: '👥' },
    { id: 'marketing', name: 'Marketing', count: 312, icon: '📢' },
    { id: 'operations', name: 'Operations', count: 278, icon: '⚙️' },
  ];

  // Recent documents
  const documents = [
    {
      id: 1,
      name: 'Q4 2024 Financial Report.pdf',
      category: 'financial',
      size: '2.4 MB',
      modified: '2 hours ago',
      owner: 'John Smith',
      version: 'v3',
      aiAnalysis: {
        summary: 'Q4 financial performance exceeded expectations with 15% revenue growth.',
        keyInsights: ['Revenue up 15%', 'Margins improved', 'Cash flow positive'],
        riskFlags: 0
      },
      shared: true
    },
    {
      id: 2,
      name: 'Partnership Agreement - TechCorp.docx',
      category: 'legal',
      size: '856 KB',
      modified: '1 day ago',
      owner: 'Sarah Johnson',
      version: 'v2',
      aiAnalysis: {
        summary: 'Strategic partnership agreement with favorable terms and clear milestones.',
        keyInsights: ['5-year term', 'Revenue sharing 70/30', 'Exclusivity clause'],
        riskFlags: 2
      },
      shared: true
    },
    {
      id: 3,
      name: 'Strategic Plan 2025.pptx',
      category: 'strategic',
      size: '5.1 MB',
      modified: '3 days ago',
      owner: 'Michael Chen',
      version: 'v5',
      aiAnalysis: {
        summary: 'Comprehensive 2025 strategy focusing on market expansion and product innovation.',
        keyInsights: ['3 new markets', '2 product launches', '$10M investment'],
        riskFlags: 1
      },
      shared: false
    },
    {
      id: 4,
      name: 'Employee Handbook 2024.pdf',
      category: 'hr',
      size: '1.2 MB',
      modified: '1 week ago',
      owner: 'Emily Davis',
      version: 'v1',
      aiAnalysis: {
        summary: 'Updated employee handbook with new policies and benefits.',
        keyInsights: ['Remote work policy', 'New benefits', 'Updated PTO'],
        riskFlags: 0
      },
      shared: true
    },
    {
      id: 5,
      name: 'Marketing Campaign Q1 2025.pdf',
      category: 'marketing',
      size: '3.8 MB',
      modified: '2 days ago',
      owner: 'Robert Wilson',
      version: 'v2',
      aiAnalysis: {
        summary: 'Q1 marketing campaign with focus on digital channels and brand awareness.',
        keyInsights: ['$500K budget', 'Social media focus', '20% reach increase target'],
        riskFlags: 0
      },
      shared: false
    },
  ];

  // Recent activity
  const recentActivity = [
    { action: 'uploaded', document: 'Q4 Report.pdf', user: 'John Smith', time: '2 hours ago' },
    { action: 'shared', document: 'Partnership Agreement', user: 'Sarah Johnson', time: '5 hours ago' },
    { action: 'analyzed', document: 'Strategic Plan 2025', user: 'AI', time: '1 day ago' },
    { action: 'commented', document: 'Marketing Campaign', user: 'Robert Wilson', time: '2 days ago' },
  ];

  const getFileIcon = (name: string) => {
    if (name.endsWith('.pdf')) return '📄';
    if (name.endsWith('.docx') || name.endsWith('.doc')) return '📝';
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) return '📊';
    if (name.endsWith('.pptx') || name.endsWith('.ppt')) return '📽️';
    return '📁';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center space-x-3">
              <span className="text-4xl">📁</span>
              <span>Document Management</span>
            </h1>
            <p className="text-slate-400">AI-powered document analysis, version control, and sharing</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2">
              <span>📤</span>
              <span>Upload</span>
            </button>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-colors">
              New Folder
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span>{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      activity.action === 'uploaded' ? 'bg-green-500' :
                      activity.action === 'shared' ? 'bg-blue-500' :
                      activity.action === 'analyzed' ? 'bg-purple-500' : 'bg-amber-500'
                    }`}></div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-slate-400"> {activity.action} </span>
                        <span className="text-slate-300">{activity.document}</span>
                      </p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full px-4 py-2 pl-10 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveView('grid')}
                  className={`p-2 rounded-lg ${activeView === 'grid' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                >
                  ▦
                </button>
                <button
                  onClick={() => setActiveView('list')}
                  className={`p-2 rounded-lg ${activeView === 'list' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                >
                  ☰
                </button>
              </div>
            </div>

            {/* Documents Grid/List */}
            {activeView === 'grid' ? (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{getFileIcon(doc.name)}</span>
                        <div>
                          <h3 className="font-semibold text-sm">{doc.name}</h3>
                          <p className="text-xs text-slate-500">{doc.size} • {doc.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.shared && <span className="text-xs text-blue-400">🔗</span>}
                        <button className="p-1 hover:bg-slate-800 rounded">⋮</button>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {doc.aiAnalysis && (
                      <div className="bg-slate-800/50 rounded-xl p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs">🤖</span>
                          <span className="text-xs font-medium text-indigo-400">AI Analysis</span>
                          {doc.aiAnalysis.riskFlags > 0 && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                              {doc.aiAnalysis.riskFlags} risks
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{doc.aiAnalysis.summary}</p>
                        <div className="flex flex-wrap gap-1">
                          {doc.aiAnalysis.keyInsights.slice(0, 3).map((insight, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-700/50 rounded text-xs">
                              {insight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{doc.owner}</span>
                      <span>{doc.modified}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-500 border-b border-slate-800">
                      <th className="p-4">Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Size</th>
                      <th className="p-4">Modified</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">AI Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-800/30 cursor-pointer">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getFileIcon(doc.name)}</span>
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-slate-500">{doc.version}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 capitalize text-sm text-slate-400">{doc.category}</td>
                        <td className="p-4 text-sm text-slate-400">{doc.size}</td>
                        <td className="p-4 text-sm text-slate-400">{doc.modified}</td>
                        <td className="p-4 text-sm text-slate-400">{doc.owner}</td>
                        <td className="p-4">
                          {doc.aiAnalysis ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                              Analyzed
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded text-xs">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Upload Drop Zone */}
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer">
              <span className="text-4xl mb-4 block">📤</span>
              <p className="text-slate-400 mb-2">Drag and drop files here, or click to browse</p>
              <p className="text-xs text-slate-500">Supports PDF, DOCX, XLSX, PPTX up to 50MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
