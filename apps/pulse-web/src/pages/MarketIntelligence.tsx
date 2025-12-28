import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import {
  listIntelligence,
  createIntelligence,
  toggleIntelligenceBookmark,
  getTrendingTopics,
  listRecommendations,
  updateRecommendationStatus,
} from '../api/athena';

export default function MarketIntelligencePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'intelligence' | 'recommendations'>('intelligence');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [newIntel, setNewIntel] = useState({
    title: '',
    summary: '',
    category: 'industry_news',
    source_url: '',
    tags: [] as string[]
  });

  const { data: intelligence, isLoading: loadingIntel } = useQuery({
    queryKey: ['market-intelligence', categoryFilter],
    queryFn: () => listIntelligence({ category: categoryFilter || undefined }),
  });

  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => listRecommendations({ status: 'pending' }),
  });

  const { data: trending } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: () => getTrendingTopics(7),
  });

  const createMutation = useMutation({
    mutationFn: createIntelligence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-intelligence'] });
      setShowCreateModal(false);
      setNewIntel({
        title: '',
        summary: '',
        category: 'industry_news',
        source_url: '',
        tags: []
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: toggleIntelligenceBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-intelligence'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateRecommendationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      industry_news: 'bg-blue-100 text-blue-800',
      competitor_move: 'bg-purple-100 text-purple-800',
      market_trend: 'bg-green-100 text-green-800',
      regulatory: 'bg-red-100 text-red-800',
      technology: 'bg-yellow-100 text-yellow-800',
      economic: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'industry_news', label: 'Industry News' },
    { value: 'competitor_move', label: 'Competitor Moves' },
    { value: 'market_trend', label: 'Market Trends' },
    { value: 'regulatory', label: 'Regulatory' },
    { value: 'technology', label: 'Technology' },
    { value: 'economic', label: 'Economic' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market Intelligence</h1>
            <p className="text-gray-600 mt-1">Track market trends and strategic recommendations</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            + Add Intelligence
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('intelligence')}
            className={`pb-3 px-1 font-medium ${
              activeTab === 'intelligence'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Market Intelligence
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-3 px-1 font-medium flex items-center gap-2 ${
              activeTab === 'recommendations'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recommendations
            {recommendations && recommendations.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {recommendations.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'intelligence' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Category Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategoryFilter(cat.value)}
                        className={`w-full text-left px-3 py-2 rounded text-sm ${
                          categoryFilter === cat.value
                            ? 'bg-blue-100 text-blue-800'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              {trending && trending.topics && trending.topics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Trending Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {trending.topics.map((topic: any, i: number) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {topic.topic} ({topic.count})
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Intelligence List */}
            <div className="lg:col-span-3 space-y-4">
              {loadingIntel ? (
                <div className="text-center py-12">Loading intelligence...</div>
              ) : intelligence && intelligence.length > 0 ? (
                intelligence.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(item.category)}`}>
                              {item.category.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            {item.relevance_score > 80 && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                High Relevance
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          {item.summary && (
                            <p className="text-sm text-gray-600 mb-2">{item.summary}</p>
                          )}
                          {item.ai_summary && (
                            <div className="bg-blue-50 p-3 rounded text-sm mb-2">
                              <p className="font-medium text-blue-800 mb-1">AI Summary</p>
                              <p className="text-blue-700">{item.ai_summary}</p>
                            </div>
                          )}
                          {item.ai_implications && item.ai_implications.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">Implications:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {item.ai_implications.slice(0, 3).map((imp, i) => (
                                  <li key={i}>• {imp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => bookmarkMutation.mutate(item.id)}
                          className="text-gray-400 hover:text-yellow-500 ml-4"
                        >
                          {item.is_bookmarked ? '⭐' : '☆'}
                        </button>
                      </div>
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View Source →
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500 mb-4">No market intelligence yet</p>
                    <Button onClick={() => setShowCreateModal(true)}>Add Intelligence</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Recommendations Tab */
          <div className="space-y-4">
            {loadingRecs ? (
              <div className="text-center py-12">Loading recommendations...</div>
            ) : recommendations && recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <Card key={rec.id} className={`border-l-4 ${getPriorityColor(rec.priority)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${getPriorityColor(rec.priority)}`}>
                            {rec.priority.toUpperCase()}
                          </span>
                          {rec.category && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {rec.category}
                            </span>
                          )}
                          {rec.confidence_score && (
                            <span className="text-xs text-gray-400">
                              {(rec.confidence_score * 100).toFixed(0)}% confidence
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                        {rec.description && (
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        )}
                        {rec.rationale && (
                          <div className="bg-gray-50 p-3 rounded text-sm mb-2">
                            <p className="font-medium text-gray-700 mb-1">Rationale</p>
                            <p className="text-gray-600">{rec.rationale}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          {rec.potential_impact && (
                            <div>
                              <p className="text-gray-500">Impact</p>
                              <p className="font-medium">{rec.potential_impact}</p>
                            </div>
                          )}
                          {rec.estimated_roi && (
                            <div>
                              <p className="text-gray-500">Est. ROI</p>
                              <p className="font-medium text-green-600">{rec.estimated_roi}%</p>
                            </div>
                          )}
                          {rec.timeline_weeks && (
                            <div>
                              <p className="text-gray-500">Timeline</p>
                              <p className="font-medium">{rec.timeline_weeks} weeks</p>
                            </div>
                          )}
                        </div>
                        {rec.action_items && rec.action_items.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Action Items:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {rec.action_items.map((item: any, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                                    {i + 1}
                                  </span>
                                  {typeof item === 'string' ? item : item.action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: rec.id, status: 'accepted' })}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: rec.id, status: 'in_progress' })}
                      >
                        Start Working
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: rec.id, status: 'dismissed' })}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No pending recommendations</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Market Intelligence</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={newIntel.title}
                  onChange={(e) => setNewIntel({ ...newIntel, title: e.target.value })}
                  placeholder="e.g., New competitor enters market"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Summary</label>
                <textarea
                  value={newIntel.summary}
                  onChange={(e) => setNewIntel({ ...newIntel, summary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Brief summary..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newIntel.category}
                  onChange={(e) => setNewIntel({ ...newIntel, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="industry_news">Industry News</option>
                  <option value="competitor_move">Competitor Move</option>
                  <option value="market_trend">Market Trend</option>
                  <option value="regulatory">Regulatory</option>
                  <option value="technology">Technology</option>
                  <option value="economic">Economic</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Source URL</label>
                <Input
                  value={newIntel.source_url}
                  onChange={(e) => setNewIntel({ ...newIntel, source_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(newIntel)}
                disabled={!newIntel.title || createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Intelligence'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
