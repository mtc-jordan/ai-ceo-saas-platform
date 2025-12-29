import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import type { Scenario, ScenarioVariable, ScenarioAnalysisResult } from '../api/athena';
import {
  listScenarios,
  createScenario,
  deleteScenario,
  analyzeScenario,
  getScenarioTemplates,
  toggleScenarioFavorite,
} from '../api/athena';

export default function Scenarios() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScenarioAnalysisResult | null>(null);
  const [newScenario, setNewScenario] = useState({
    name: '',
    description: '',
    scenario_type: 'custom',
    time_horizon_months: 12,
    base_assumptions: {
      revenue: 1000000,
      costs: 600000,
      customers: 1000,
      churn_rate: 0.05,
      growth_rate: 0.10
    }
  });
  const [variables, setVariables] = useState<ScenarioVariable[]>([
    { name: 'price_increase', display_name: 'Price Increase %', current_value: 0, modified_value: 10, unit: '%' },
    { name: 'marketing_budget', display_name: 'Marketing Budget', current_value: 100000, modified_value: 150000, unit: '$' },
    { name: 'churn_rate', display_name: 'Churn Rate', current_value: 5, modified_value: 4, unit: '%' }
  ]);

  const { data: scenarios, isLoading } = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => listScenarios(),
  });

  const { data: templates } = useQuery({
    queryKey: ['scenario-templates'],
    queryFn: getScenarioTemplates,
  });

  // Local state for demo scenarios when API fails
  const [localScenarios, setLocalScenarios] = useState<Scenario[]>([]);

  const createMutation = useMutation({
    mutationFn: createScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      setShowCreateModal(false);
      setNewScenario({
        name: '',
        description: '',
        scenario_type: 'custom',
        time_horizon_months: 12,
        base_assumptions: {
          revenue: 1000000,
          costs: 600000,
          customers: 1000,
          churn_rate: 0.05,
          growth_rate: 0.10
        }
      });
    },
    onError: () => {
      // Fallback to local state for demo
      const newLocalScenario: Scenario = {
        id: `local-${Date.now()}`,
        name: newScenario.name,
        description: newScenario.description,
        scenario_type: newScenario.scenario_type,
        status: 'draft',
        time_horizon_months: newScenario.time_horizon_months,
        base_assumptions: newScenario.base_assumptions,
        variables: [],
        outcomes: {},
        ai_recommendations: [],
        is_favorite: false,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocalScenarios(prev => [...prev, newLocalScenario]);
      setShowCreateModal(false);
      setNewScenario({
        name: '',
        description: '',
        scenario_type: 'custom',
        time_horizon_months: 12,
        base_assumptions: {
          revenue: 1000000,
          costs: 600000,
          customers: 1000,
          churn_rate: 0.05,
          growth_rate: 0.10
        }
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: toggleScenarioFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });

  const handleAnalyze = async () => {
    if (!selectedScenario) return;
    try {
      const result = await analyzeScenario(selectedScenario.id, variables);
      setAnalysisResult(result);
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'analyzing': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'growth': return '📈';
      case 'cost_reduction': return '💰';
      case 'market_expansion': return '🌍';
      case 'pricing': return '🏷️';
      case 'acquisition': return '🤝';
      default: return '📊';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scenario Planning</h1>
            <p className="text-gray-600 mt-1">Create and analyze what-if scenarios</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            + New Scenario
          </Button>
        </div>

        {/* Scenarios Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading scenarios...</div>
        ) : (scenarios && scenarios.length > 0) || localScenarios.length > 0 ? (
          // Combine API scenarios with local scenarios
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...(scenarios || []), ...localScenarios].map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(scenario.scenario_type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(scenario.status)}`}>
                          {scenario.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => favoriteMutation.mutate(scenario.id)}
                      className="text-gray-400 hover:text-yellow-500"
                    >
                      {scenario.is_favorite ? '⭐' : '☆'}
                    </button>
                  </div>
                  
                  {scenario.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{scenario.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span>{scenario.time_horizon_months} months</span>
                    <span>•</span>
                    <span>{scenario.scenario_type.replace('_', ' ')}</span>
                  </div>

                  {scenario.outcomes?.outcomes && (
                    <div className="bg-gray-50 rounded p-2 mb-3">
                      <p className="text-xs text-gray-500 mb-1">Projected Outcome</p>
                      {scenario.outcomes.outcomes.slice(0, 2).map((o: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{o.display_name}</span>
                          <span className={o.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {o.change_percent >= 0 ? '+' : ''}{o.change_percent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedScenario(scenario);
                        setVariables(scenario.variables?.length > 0 ? scenario.variables : variables);
                        setAnalysisResult(null);
                        setShowAnalyzeModal(true);
                      }}
                    >
                      Analyze
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this scenario?')) {
                          deleteMutation.mutate(scenario.id);
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
              <p className="text-gray-500 mb-4">No scenarios created yet</p>
              <Button onClick={() => setShowCreateModal(true)}>Create Your First Scenario</Button>
            </CardContent>
          </Card>
        )}

        {/* Templates Section */}
        {templates && templates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Scenario Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setNewScenario({
                        ...newScenario,
                        name: template.name,
                        description: template.description,
                        scenario_type: template.type
                      });
                      setShowCreateModal(true);
                    }}
                    className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                  >
                    <span className="text-2xl">{getTypeIcon(template.type)}</span>
                    <h4 className="font-medium mt-2">{template.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Scenario</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={newScenario.name}
                  onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                  placeholder="e.g., Q1 Growth Strategy"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newScenario.description}
                  onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Describe your scenario..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newScenario.scenario_type}
                  onChange={(e) => setNewScenario({ ...newScenario, scenario_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="custom">Custom</option>
                  <option value="growth">Growth</option>
                  <option value="cost_reduction">Cost Reduction</option>
                  <option value="market_expansion">Market Expansion</option>
                  <option value="pricing">Pricing</option>
                  <option value="acquisition">Acquisition</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Time Horizon (months)</label>
                <Input
                  type="number"
                  value={newScenario.time_horizon_months}
                  onChange={(e) => setNewScenario({ ...newScenario, time_horizon_months: parseInt(e.target.value) })}
                  min={1}
                  max={120}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Base Assumptions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Revenue ($)</label>
                    <Input
                      type="number"
                      value={newScenario.base_assumptions.revenue}
                      onChange={(e) => setNewScenario({
                        ...newScenario,
                        base_assumptions: { ...newScenario.base_assumptions, revenue: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Costs ($)</label>
                    <Input
                      type="number"
                      value={newScenario.base_assumptions.costs}
                      onChange={(e) => setNewScenario({
                        ...newScenario,
                        base_assumptions: { ...newScenario.base_assumptions, costs: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Customers</label>
                    <Input
                      type="number"
                      value={newScenario.base_assumptions.customers}
                      onChange={(e) => setNewScenario({
                        ...newScenario,
                        base_assumptions: { ...newScenario.base_assumptions, customers: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Growth Rate (%)</label>
                    <Input
                      type="number"
                      value={newScenario.base_assumptions.growth_rate * 100}
                      onChange={(e) => setNewScenario({
                        ...newScenario,
                        base_assumptions: { ...newScenario.base_assumptions, growth_rate: parseFloat(e.target.value) / 100 }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(newScenario)}
                disabled={!newScenario.name || createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Scenario'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Modal */}
      {showAnalyzeModal && selectedScenario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Analyze: {selectedScenario.name}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Modify Variables</h3>
                <div className="space-y-3">
                  {variables.map((v, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <label className="text-sm font-medium">{v.display_name}</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">Current: {v.current_value}{v.unit}</span>
                          <span className="text-gray-300">→</span>
                          <Input
                            type="number"
                            value={v.modified_value}
                            onChange={(e) => {
                              const updated = [...variables];
                              updated[index].modified_value = parseFloat(e.target.value);
                              setVariables(updated);
                            }}
                            className="w-32"
                          />
                          <span className="text-sm text-gray-500">{v.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {analysisResult && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Analysis Results</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {analysisResult.outcomes.map((outcome, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">{outcome.display_name}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold">
                            {outcome.unit === '$' ? '$' : ''}{outcome.projected_value.toLocaleString()}{outcome.unit === '%' ? '%' : ''}
                          </span>
                          <span className={`text-sm ${outcome.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {outcome.change_percent >= 0 ? '+' : ''}{outcome.change_percent}%
                          </span>
                        </div>
                        <div className="mt-1">
                          <div className="h-1 bg-gray-200 rounded">
                            <div
                              className="h-1 bg-blue-500 rounded"
                              style={{ width: `${outcome.confidence * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Confidence: {(outcome.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysisResult.warnings.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {analysisResult.warnings.map((warning, i) => (
                          <li key={i}>⚠️ {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.ai_analysis && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-medium text-blue-800 mb-2">AI Analysis</h4>
                      <p className="text-sm text-blue-700">{analysisResult.ai_analysis}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAnalyzeModal(false)} className="flex-1">
                Close
              </Button>
              <Button onClick={handleAnalyze} className="flex-1">
                {analysisResult ? 'Re-analyze' : 'Run Analysis'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
