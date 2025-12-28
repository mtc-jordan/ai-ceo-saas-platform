import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import type { Competitor, CompetitorAnalysis } from '../api/athena';
import {
  listCompetitors,
  createCompetitor,
  deleteCompetitor,
  analyzeCompetitor,
  getCompetitiveLandscape,
} from '../api/athena';

export default function Competitors() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    website: '',
    description: '',
    industry: '',
    threat_level: 5,
    market_overlap: 50,
    is_primary: false
  });

  const { data: competitors, isLoading } = useQuery({
    queryKey: ['competitors'],
    queryFn: () => listCompetitors(),
  });

  const { data: landscape } = useQuery({
    queryKey: ['competitive-landscape'],
    queryFn: getCompetitiveLandscape,
  });

  const createMutation = useMutation({
    mutationFn: createCompetitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      queryClient.invalidateQueries({ queryKey: ['competitive-landscape'] });
      setShowCreateModal(false);
      setNewCompetitor({
        name: '',
        website: '',
        description: '',
        industry: '',
        threat_level: 5,
        market_overlap: 50,
        is_primary: false
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompetitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      queryClient.invalidateQueries({ queryKey: ['competitive-landscape'] });
    },
  });

  const handleAnalyze = async (competitor: Competitor) => {
    setSelectedCompetitor(competitor);
    setAnalyzing(true);
    setShowAnalysisModal(true);
    try {
      const result = await analyzeCompetitor(competitor.id);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getThreatColor = (level: number) => {
    if (level <= 3) return 'bg-green-100 text-green-800';
    if (level <= 5) return 'bg-yellow-100 text-yellow-800';
    if (level <= 7) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getThreatLabel = (level: number) => {
    if (level <= 3) return 'Low';
    if (level <= 5) return 'Medium';
    if (level <= 7) return 'High';
    return 'Critical';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Competitor Tracking</h1>
            <p className="text-gray-600 mt-1">Monitor and analyze your competition</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            + Add Competitor
          </Button>
        </div>

        {/* Landscape Overview */}
        {landscape && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-gray-900">{landscape.total_competitors}</p>
                <p className="text-sm text-gray-500">Total Tracked</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{landscape.primary_competitors}</p>
                <p className="text-sm text-gray-500">Primary Competitors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">{landscape.average_threat_level?.toFixed(1)}</p>
                <p className="text-sm text-gray-500">Avg Threat Level</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-2">Threat Distribution</p>
                <div className="flex gap-1">
                  {landscape.threat_distribution && Object.entries(landscape.threat_distribution).map(([level, count]) => (
                    <div key={level} className="flex-1 text-center">
                      <div className={`text-xs px-1 py-0.5 rounded ${getThreatColor(
                        level === 'low' ? 2 : level === 'medium' ? 5 : level === 'high' ? 7 : 9
                      )}`}>
                        {count as number}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 capitalize">{level}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Competitors List */}
        {isLoading ? (
          <div className="text-center py-12">Loading competitors...</div>
        ) : competitors && competitors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map((competitor) => (
              <Card key={competitor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-gray-600">
                        {competitor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                        {competitor.is_primary && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${getThreatColor(competitor.threat_level)}`}>
                      {getThreatLabel(competitor.threat_level)}
                    </span>
                  </div>

                  {competitor.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{competitor.description}</p>
                  )}

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Threat Level</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded">
                          <div
                            className={`h-2 rounded ${competitor.threat_level > 7 ? 'bg-red-500' : competitor.threat_level > 5 ? 'bg-orange-500' : competitor.threat_level > 3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${competitor.threat_level * 10}%` }}
                          />
                        </div>
                        <span className="font-medium">{competitor.threat_level}/10</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Market Overlap</span>
                      <span className="font-medium">{competitor.market_overlap}%</span>
                    </div>
                    {competitor.industry && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Industry</span>
                        <span className="font-medium">{competitor.industry}</span>
                      </div>
                    )}
                  </div>

                  {competitor.website && (
                    <a
                      href={competitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline block mb-3"
                    >
                      {competitor.website}
                    </a>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAnalyze(competitor)}
                    >
                      Analyze
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this competitor?')) {
                          deleteMutation.mutate(competitor.id);
                        }
                      }}
                    >
                      🗑️
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No competitors tracked yet</p>
              <Button onClick={() => setShowCreateModal(true)}>Add Your First Competitor</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Competitor</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <Input
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                  placeholder="e.g., Acme Corp"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input
                  value={newCompetitor.website}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newCompetitor.description}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Industry</label>
                <Input
                  value={newCompetitor.industry}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, industry: e.target.value })}
                  placeholder="e.g., SaaS, E-commerce"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Threat Level (1-10)</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={newCompetitor.threat_level}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, threat_level: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Market Overlap (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={newCompetitor.market_overlap}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, market_overlap: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={newCompetitor.is_primary}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, is_primary: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_primary" className="text-sm">Mark as primary competitor</label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(newCompetitor)}
                disabled={!newCompetitor.name || createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Competitor'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && selectedCompetitor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Analysis: {selectedCompetitor.name}</h2>
            
            {analyzing ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Analyzing competitor...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Overall Assessment</h3>
                  <p className="text-gray-700">{analysis.overall_threat_assessment}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{analysis.market_position_summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">Their Strengths</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      {analysis.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-2">Their Weaknesses</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Opportunities Against Them</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {analysis.opportunities_against.map((o, i) => (
                        <li key={i}>• {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-medium text-orange-800 mb-2">Threats From Them</h3>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {analysis.threats_from.map((t, i) => (
                        <li key={i}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">Recommended Actions</h3>
                  <div className="space-y-2">
                    {analysis.recommended_actions.map((action: any, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          action.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {action.priority}
                        </span>
                        <span className="text-sm text-purple-700">{action.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Analysis failed. Please try again.</p>
            )}
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAnalysisModal(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
