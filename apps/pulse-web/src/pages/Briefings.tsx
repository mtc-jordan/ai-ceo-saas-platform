import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import {
  FileText,
  Calendar,
  Download,
  Mail,
  Share2,
  Pause,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
  RefreshCw,
  Plus,
  Search,
  Volume2,
  Star,

} from 'lucide-react';

interface Briefing {
  id: string;
  date: string;
  title: string;
  summary: string;
  metrics: {
    revenue: { value: string; change: number };
    users: { value: string; change: number };
    satisfaction: { value: string; change: number };
  };
  priorities: Array<{ text: string; status: 'urgent' | 'high' | 'medium' }>;
  opportunities: Array<{ text: string; confidence: number }>;
  risks: Array<{ text: string; severity: 'high' | 'medium' | 'low' }>;
  isStarred: boolean;
  isRead: boolean;
}

const Briefings: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBriefing, setSelectedBriefing] = useState<Briefing | null>(null);
  const [filter, setFilter] = useState<'all' | 'starred' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample briefings data
  const [briefings, setBriefings] = useState<Briefing[]>([
    {
      id: '1',
      date: new Date().toISOString(),
      title: "Today's Executive Briefing",
      summary: 'Revenue performance exceeds expectations with a 12.5% increase. Enterprise segment showing strong growth. Customer satisfaction remains high at 94.6%. Key focus areas include expanding market presence and optimizing operational efficiency.',
      metrics: {
        revenue: { value: '$2.40M', change: 12.5 },
        users: { value: '12,838', change: 8.3 },
        satisfaction: { value: '94.6%', change: -0.5 }
      },
      priorities: [
        { text: 'Review Q4 budget allocation', status: 'urgent' },
        { text: 'Finalize enterprise deal with Acme Corp', status: 'high' },
        { text: 'Approve marketing campaign for Q1', status: 'medium' }
      ],
      opportunities: [
        { text: 'Expand into APAC market - 3 qualified leads', confidence: 87 },
        { text: 'Upsell premium features to mid-tier customers', confidence: 92 }
      ],
      risks: [
        { text: 'Competitor launching similar product next month', severity: 'high' },
        { text: 'Key account showing reduced engagement', severity: 'medium' }
      ],
      isStarred: true,
      isRead: true
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString(),
      title: "Yesterday's Executive Briefing",
      summary: 'Strong performance across all metrics. New customer acquisition up 15%. Product launch received positive feedback. Team productivity at all-time high.',
      metrics: {
        revenue: { value: '$2.35M', change: 10.2 },
        users: { value: '12,654', change: 7.8 },
        satisfaction: { value: '95.1%', change: 0.8 }
      },
      priorities: [
        { text: 'Complete quarterly review presentation', status: 'high' },
        { text: 'Schedule board meeting', status: 'medium' },
        { text: 'Review hiring pipeline', status: 'medium' }
      ],
      opportunities: [
        { text: 'Partnership opportunity with TechGiant Inc', confidence: 78 },
        { text: 'New feature request from enterprise clients', confidence: 85 }
      ],
      risks: [
        { text: 'Supply chain delays affecting delivery', severity: 'medium' },
        { text: 'Currency fluctuation impact on international sales', severity: 'low' }
      ],
      isStarred: false,
      isRead: true
    },
    {
      id: '3',
      date: new Date(Date.now() - 172800000).toISOString(),
      title: 'Weekly Summary Briefing',
      summary: 'Week-over-week growth of 5.2%. Successfully closed 3 enterprise deals. Customer churn reduced by 12%. Infrastructure upgrades completed ahead of schedule.',
      metrics: {
        revenue: { value: '$2.28M', change: 5.2 },
        users: { value: '12,450', change: 5.5 },
        satisfaction: { value: '94.3%', change: 1.2 }
      },
      priorities: [
        { text: 'Launch new feature set', status: 'urgent' },
        { text: 'Conduct team performance reviews', status: 'high' },
        { text: 'Update security protocols', status: 'high' }
      ],
      opportunities: [
        { text: 'Government contract RFP submission', confidence: 65 },
        { text: 'Referral program showing 40% conversion', confidence: 88 }
      ],
      risks: [
        { text: 'Talent retention in engineering team', severity: 'high' },
        { text: 'Regulatory changes in EU market', severity: 'medium' }
      ],
      isStarred: true,
      isRead: false
    },
    {
      id: '4',
      date: new Date(Date.now() - 259200000).toISOString(),
      title: 'Monthly Performance Review',
      summary: 'Exceptional month with 18% revenue growth. Market share increased by 2.3%. Customer NPS at record high of 72. Successfully launched in 2 new markets.',
      metrics: {
        revenue: { value: '$2.15M', change: 18.0 },
        users: { value: '12,100', change: 12.4 },
        satisfaction: { value: '93.8%', change: 2.1 }
      },
      priorities: [
        { text: 'Scale infrastructure for growth', status: 'urgent' },
        { text: 'Hire additional sales team members', status: 'high' },
        { text: 'Develop Q2 roadmap', status: 'medium' }
      ],
      opportunities: [
        { text: 'Acquisition target identified', confidence: 72 },
        { text: 'Strategic partnership with CloudProvider', confidence: 81 }
      ],
      risks: [
        { text: 'Rapid scaling affecting quality', severity: 'high' },
        { text: 'Cash flow management during expansion', severity: 'medium' }
      ],
      isStarred: false,
      isRead: false
    }
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const filteredBriefings = briefings.filter(b => {
    if (filter === 'starred' && !b.isStarred) return false;
    if (filter === 'unread' && b.isRead) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !b.summary.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleStar = (id: string) => {
    setBriefings(prev => prev.map(b => 
      b.id === id ? { ...b, isStarred: !b.isStarred } : b
    ));
  };

  const markAsRead = (id: string) => {
    setBriefings(prev => prev.map(b => 
      b.id === id ? { ...b, isRead: true } : b
    ));
  };

  const generateNewBriefing = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newBriefing: Briefing = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: 'Real-time Executive Briefing',
      summary: 'AI-generated briefing based on latest data. Revenue trending upward with strong momentum. Key metrics show positive trajectory across all departments.',
      metrics: {
        revenue: { value: '$2.42M', change: 13.1 },
        users: { value: '12,920', change: 8.9 },
        satisfaction: { value: '94.8%', change: 0.2 }
      },
      priorities: [
        { text: 'Urgent: Review incoming partnership proposal', status: 'urgent' },
        { text: 'Prepare for investor call tomorrow', status: 'high' }
      ],
      opportunities: [
        { text: 'New market segment identified with high potential', confidence: 91 }
      ],
      risks: [
        { text: 'Monitor competitor pricing changes', severity: 'medium' }
      ],
      isStarred: false,
      isRead: false
    };
    
    setBriefings(prev => [newBriefing, ...prev]);
    setSelectedBriefing(newBriefing);
    setIsGenerating(false);
  };

  const handleSelectBriefing = (briefing: Briefing) => {
    setSelectedBriefing(briefing);
    markAsRead(briefing.id);
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-hidden p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">📋</span>
                Executive Briefings
              </h1>
              <p className="text-slate-400 mt-1">AI-generated daily insights and business intelligence</p>
            </div>
            <button
              onClick={generateNewBriefing}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generate New Briefing
                </>
              )}
            </button>
          </div>

          <div className="flex gap-6 h-[calc(100%-80px)]">
            {/* Briefings List */}
            <div className="w-96 flex flex-col bg-slate-900/50 rounded-xl border border-slate-800">
              {/* Search and Filter */}
              <div className="p-4 border-b border-slate-800">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search briefings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filter === 'all' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('starred')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                      filter === 'starred' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Star className="w-3 h-3" /> Starred
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filter === 'unread' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Unread ({briefings.filter(b => !b.isRead).length})
                  </button>
                </div>
              </div>

              {/* Briefings List */}
              <div className="flex-1 overflow-y-auto">
                {filteredBriefings.map((briefing) => (
                  <div
                    key={briefing.id}
                    onClick={() => handleSelectBriefing(briefing)}
                    className={`p-4 border-b border-slate-800 cursor-pointer transition-colors ${
                      selectedBriefing?.id === briefing.id 
                        ? 'bg-cyan-500/10 border-l-2 border-l-cyan-500' 
                        : 'hover:bg-slate-800/50'
                    } ${!briefing.isRead ? 'bg-slate-800/30' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📋</span>
                        <span className="text-xs text-slate-400">{formatDate(briefing.date)}</span>
                        {!briefing.isRead && (
                          <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleStar(briefing.id); }}
                        className={`p-1 rounded hover:bg-slate-700 ${briefing.isStarred ? 'text-yellow-400' : 'text-slate-500'}`}
                      >
                        <Star className="w-4 h-4" fill={briefing.isStarred ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <h3 className="text-white font-medium mb-1 line-clamp-1">{briefing.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{briefing.summary}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className={`flex items-center gap-1 ${briefing.metrics.revenue.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {briefing.metrics.revenue.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {briefing.metrics.revenue.value}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{briefing.priorities.length} priorities</span>
                    </div>
                  </div>
                ))}

                {filteredBriefings.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No briefings found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Briefing Detail */}
            <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
              {selectedBriefing ? (
                <div className="h-full flex flex-col">
                  {/* Detail Header */}
                  <div className="p-6 border-b border-slate-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(selectedBriefing.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <h2 className="text-xl font-bold text-white">{selectedBriefing.title}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          {isPlaying ? 'Pause' : 'Listen'}
                        </button>
                        <button className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Detail Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Summary */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Executive Summary</h3>
                      <p className="text-slate-300 leading-relaxed">{selectedBriefing.summary}</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Key Metrics</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <div className="text-slate-400 text-sm mb-1">Revenue</div>
                          <div className="text-2xl font-bold text-white">{selectedBriefing.metrics.revenue.value}</div>
                          <div className={`flex items-center gap-1 text-sm ${selectedBriefing.metrics.revenue.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedBriefing.metrics.revenue.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {selectedBriefing.metrics.revenue.change >= 0 ? '+' : ''}{selectedBriefing.metrics.revenue.change}%
                          </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <div className="text-slate-400 text-sm mb-1">Active Users</div>
                          <div className="text-2xl font-bold text-white">{selectedBriefing.metrics.users.value}</div>
                          <div className={`flex items-center gap-1 text-sm ${selectedBriefing.metrics.users.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedBriefing.metrics.users.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {selectedBriefing.metrics.users.change >= 0 ? '+' : ''}{selectedBriefing.metrics.users.change}%
                          </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <div className="text-slate-400 text-sm mb-1">Satisfaction</div>
                          <div className="text-2xl font-bold text-white">{selectedBriefing.metrics.satisfaction.value}</div>
                          <div className={`flex items-center gap-1 text-sm ${selectedBriefing.metrics.satisfaction.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedBriefing.metrics.satisfaction.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {selectedBriefing.metrics.satisfaction.change >= 0 ? '+' : ''}{selectedBriefing.metrics.satisfaction.change}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Priorities */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Priorities
                      </h3>
                      <div className="space-y-2">
                        {selectedBriefing.priorities.map((priority, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              priority.status === 'urgent' ? 'bg-red-500/20 text-red-400' :
                              priority.status === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {priority.status.toUpperCase()}
                            </span>
                            <span className="text-slate-300">{priority.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Opportunities */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Opportunities
                      </h3>
                      <div className="space-y-2">
                        {selectedBriefing.opportunities.map((opp, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-slate-300">{opp.text}</span>
                            </div>
                            <span className="text-sm text-cyan-400">{opp.confidence}% confidence</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Risks
                      </h3>
                      <div className="space-y-2">
                        {selectedBriefing.risks.map((risk, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className={`w-4 h-4 ${
                                risk.severity === 'high' ? 'text-red-400' :
                                risk.severity === 'medium' ? 'text-yellow-400' :
                                'text-blue-400'
                              }`} />
                              <span className="text-slate-300">{risk.text}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              risk.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              risk.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {risk.severity.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-white mb-2">Select a Briefing</h3>
                    <p>Choose a briefing from the list to view details</p>
                    <button
                      onClick={generateNewBriefing}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Generate New Briefing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Briefings;
